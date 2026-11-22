'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type PlanKey = 'starter' | 'business';

interface PricingCheckoutButtonProps {
  plan: PlanKey;
  className?: string;
  children: ReactNode;
}

/**
 * Starts a Creem checkout session for the signed-in user.
 *
 * The payment URL is created server-side so it can carry the user's id as
 * `referenceId`; the browser only ever receives the resulting URL.
 */
export function PricingCheckoutButton({
  plan,
  className,
  children,
}: PricingCheckoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (pending) return;

    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (response.status === 401) {
        router.push('/login?redirect=/');
        return;
      }

      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        setError(data.error ?? 'Could not start checkout. Please try again.');
        setPending(false);
        return;
      }

      // Full navigation: the payment page lives on Creem's domain.
      window.location.href = data.url;
    } catch {
      setError('Network error. Please try again.');
      setPending(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-busy={pending}
        className={className}
      >
        {pending ? 'Starting checkout…' : children}
      </button>
      {error && (
        <p
          role="alert"
          className="mt-2 text-center text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}