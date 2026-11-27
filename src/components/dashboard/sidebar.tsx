'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ScrollText,
  KeyRound,
  Settings,
  ShieldAlert,
  LogOut,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Audit Logs', icon: ScrollText },
  { href: '/dashboard/security', label: 'Security', icon: ShieldAlert },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: KeyRound },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const FOOTER_LINKS = [
  { href: '/docs', label: 'Documentation', icon: BookOpen },
  { href: '/trust', label: 'Trust Center', icon: ShieldCheck },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname === href || pathname.startsWith(href + '/');
}

const itemBase =
  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors';

const itemActive =
  'bg-zinc-100 font-medium text-zinc-900 border-l-2 border-l-black';

const itemIdle =
  'text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900';

export function DashboardSidebar({ email }: { email: string | null }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-slate-200/70 bg-slate-50/50 transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center px-3">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="AgentTrace"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-[11px] font-semibold tracking-tight text-white">
            AT
          </span>
          {!collapsed && (
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-900">
              AgentTrace
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(itemBase, active ? itemActive : itemIdle)}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
        <div className="shrink-0 border-t border-zinc-200/70 p-2">
          <div className="space-y-0.5">
            {FOOTER_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(itemBase, itemIdle)}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}

            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                title={collapsed ? 'Sign Out' : undefined}
                className={cn(itemBase, itemIdle, 'w-full text-left')}
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </form>
          </div>

          <div className="mt-2 flex items-center gap-2 border-t border-zinc-200/70 px-1 pt-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold uppercase text-white">
              {(email ?? '?').charAt(0)}
            </span>

            {!collapsed && email && (
              <span
                className="min-w-0 flex-1 truncate text-xs text-zinc-500"
                title={email}
              >
                {email}
              </span>
            )}

            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={cn(
                'rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700',
                !collapsed && 'ml-auto'
              )}
            >
            {collapsed ? (
              <ChevronsRight className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}