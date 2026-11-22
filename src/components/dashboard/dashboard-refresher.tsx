'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Query parameters Creem may append when a checkout completes.
 * If the browser returns to the dashboard in the same tab, these let us
 * detect the successful payment and refresh immediately.
 */
const SUCCESS_PARAMS = [
  'checkout_id',
  'checkout',
  'success',
  'payment',
  'subscription',
  'creem',
];

/** How often we re-check the plan while a checkout may still be settling. */
const POLL_INTERVAL_MS = 8_000;

/** Poll this long after the page loads (or after a checkout is detected). */
const POLL_WINDOW_MS = 3 * 60 * 1000;

/** Poll longer when we know the user is coming back from a checkout. */
const POLL_WINDOW_AFTER_CHECKOUT_MS = 10 * 60 * 1000;

function hasCheckoutSuccessParam(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return SUCCESS_PARAMS.some((key) => params.has(key));
}

interface DashboardRefresherProps {
  /** Plan the server rendered, used to detect when the webhook lands. */
  initialPlan: string;
}

/**
 * Keeps the dashboard's server-rendered data (plan, quota, exports) in sync
 * after a Creem checkout.
 *
 * Creem opens in a new tab, and the webhook that upgrades `profiles.plan`
 * usually lands a moment *after* the user switches back. A single refresh
 * therefore reads stale data, so we poll the lightweight `/api/plan` endpoint
 * and refresh as soon as the plan actually changes.
 */
export function DashboardRefresher({ initialPlan }: DashboardRefresherProps) {
  const router = useRouter();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const plannedPlan = useRef(initialPlan);
  const deadline = useRef(0);

  useEffect(() => {
    plannedPlan.current = initialPlan;
  }, [initialPlan]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
  }, []);

  const stopPolling = useCallback(() => {
    if (pollTimer.current !== null) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const checkPlan = useCallback(async () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }

    try {
      const res = await fetch('/api/plan', { cache: 'no-store' });
      if (!res.ok) return;

      const data = (await res.json()) as { plan?: string };
      const nextPlan = data.plan ?? 'free';

      if (nextPlan !== plannedPlan.current) {
        plannedPlan.current = nextPlan;
        router.refresh();
      }
    } catch {
      // Transient network failure — the next tick will try again.
    }
  }, [router]);

  const startPolling = useCallback(
    (windowMs: number) => {
      stopPolling();
      deadline.current = Date.now() + windowMs;

      pollTimer.current = setInterval(() => {
        if (Date.now() > deadline.current) {
          stopPolling();
          return;
        }
        void checkPlan();
      }, POLL_INTERVAL_MS);
    },
    [checkPlan, stopPolling]
  );

  const refreshWithRetry = useCallback(() => {
    router.refresh();
    clearTimers();
    // Retry to catch the webhook update landing slightly after the redirect.
    [1500, 4000, 8000].forEach((delay) => {
      timers.current.push(setTimeout(() => router.refresh(), delay));
    });
  }, [router, clearTimers]);

  useEffect(() => {
    // Same-tab return (e.g. checkout opened without target="_blank").
    if (hasCheckoutSuccessParam()) {
      refreshWithRetry();
      startPolling(POLL_WINDOW_AFTER_CHECKOUT_MS);
      // Clean the query string so a manual reload doesn't re-trigger.
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Always watch briefly: the webhook may land seconds after page load.
      startPolling(POLL_WINDOW_MS);
    }

    // One immediate check catches a webhook that landed before the page loaded.
    void checkPlan();

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      void checkPlan();
      refreshWithRetry();
    };
    const handleFocus = () => {
      void checkPlan();
      refreshWithRetry();
      startPolling(POLL_WINDOW_AFTER_CHECKOUT_MS);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      clearTimers();
      stopPolling();
    };
  }, [
    checkPlan,
    clearTimers,
    refreshWithRetry,
    startPolling,
    stopPolling,
  ]);

  return null;
}