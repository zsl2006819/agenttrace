'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SEARCH_SHORTCUT = 'Cmd+K';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'events' | 'keys' | 'policies' | 'settings';
  href: string;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: '1', title: 'Audit Events', description: 'Search across all audit events, tool calls, and sessions', category: 'events', href: '/dashboard' },
  { id: '2', title: 'API Keys', description: 'Find and manage your API keys', category: 'keys', href: '/dashboard/api-keys' },
  { id: '3', title: 'Security Policies', description: 'View and configure security rules and firewall policies', category: 'policies', href: '/dashboard/security' },
  { id: '4', title: 'Team Members', description: 'Manage team access and roles', category: 'settings', href: '/dashboard/team' },
  { id: '5', title: 'Billing & Usage', description: 'View plan details, usage, and billing history', category: 'settings', href: '/dashboard/settings' },
  { id: '6', title: 'Export Reports', description: 'Generate compliance reports (PDF/JSONL)', category: 'events', href: '/dashboard' },
  { id: '7', title: 'Webhook Configuration', description: 'Configure custom webhook endpoints', category: 'settings', href: '/dashboard/settings' },
  { id: '8', title: 'Chain Integrity', description: 'Verify hash chain and cryptographic proofs', category: 'policies', href: '/dashboard' },
];

const CATEGORY_LABELS: Record<SearchResult['category'], string> = {
  events: 'Audit Events',
  keys: 'API Keys',
  policies: 'Policies',
  settings: 'Settings',
};

const CATEGORY_ICONS: Record<string, string> = {
  events: 'text-emerald-500',
  keys: 'text-blue-500',
  policies: 'text-amber-500',
  settings: 'text-slate-500',
};

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredResults = query
    ? MOCK_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description.toLowerCase().includes(query.toLowerCase()) ||
          r.category.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_RESULTS;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full sm:w-72 md:w-80 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 transition-all duration-200 hover:border-slate-300 focus-within:border-slate-900 dark:hover:border-zinc-600 dark:focus-within:border-zinc-300 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
        aria-label="Global search"
        aria-expanded={isOpen}
      >
        <Search className="h-4 w-4 text-slate-400 shrink-0" strokeWidth={1.5} />
        <span className="truncate text-slate-500 dark:text-zinc-400">
          Search audit events, keys, policies...
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
          {SEARCH_SHORTCUT}
        </kbd>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-full sm:w-72 md:w-80 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900 animate-in fade-in-20 slide-in-from-top-4">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border-none bg-transparent px-9 py-2.5 text-sm"
                autoFocus
              />
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-zinc-800 max-h-96 overflow-y-auto">
            {filteredResults.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => {
                  window.location.href = result.href;
                  setIsOpen(false);
                  setQuery('');
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded"
              >
                <div className="font-medium text-slate-900 dark:text-zinc-100">{result.title}</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400">{result.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}