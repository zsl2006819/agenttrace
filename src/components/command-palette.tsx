'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import {
  Search,
  Zap,
  ExternalLink,
  Settings,
  ShieldAlert,
  KeyRound,
  Users,
  ScrollText,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface CommandItem {
  label: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
  section?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const items: CommandItem[] = [
    {
      label: 'Audit Logs',
      description: 'View audit trail and insights',
      icon: ScrollText,
      shortcut: '⌘1',
      section: 'Navigation',
      action: () => navigate('/dashboard'),
    },
    {
      label: 'Security & Guardrails',
      description: 'Configure interception rules',
      icon: ShieldAlert,
      shortcut: '⌘2',
      section: 'Navigation',
      action: () => navigate('/dashboard/security'),
    },
    {
      label: 'API Keys',
      description: 'Manage API keys and permissions',
      icon: KeyRound,
      shortcut: '⌘3',
      section: 'Navigation',
      action: () => navigate('/dashboard/api-keys'),
    },
    {
      label: 'Team',
      description: 'Manage team members',
      icon: Users,
      shortcut: '⌘4',
      section: 'Navigation',
      action: () => navigate('/dashboard/team'),
    },
    {
      label: 'Settings',
      description: 'Account and workspace settings',
      icon: Settings,
      shortcut: '⌘5',
      section: 'Navigation',
      action: () => navigate('/dashboard/settings'),
    },
    {
      label: 'Export PDF Report',
      description: 'Generate compliance PDF report',
      icon: FileText,
      section: 'Actions',
      action: () => {
        const btn = document.querySelector('button[aria-label="Export Compliance Bundle"]') as HTMLButtonElement;
        btn?.click();
        setOpen(false);
      },
    },
    {
      label: 'Export JSONL',
      description: 'Download raw audit events',
      icon: FileText,
      section: 'Actions',
      action: () => {
        const btn = document.querySelector('button[title="Upgrade required"]:not([aria-label])') as HTMLButtonElement;
        btn?.click();
        setOpen(false);
      },
    },
    {
      label: 'Documentation',
      description: 'View developer docs',
      icon: ExternalLink,
      section: 'Resources',
      action: () => navigate('/docs'),
    },
    {
      label: 'Trust Center',
      description: 'Security and compliance info',
      icon: ShieldAlert,
      section: 'Resources',
      action: () => navigate('/trust'),
    },
  ];

  const sections = ['Navigation', 'Actions', 'Resources'] as const;

  return (
    <Command>
      <Command.Dialog open={open} onOpenChange={setOpen}>
        <Command.Input
          placeholder="Type a command or search..."
          className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none placeholder:text-slate-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <Command.List className="max-h-[300px] overflow-auto">
          <Command.Empty className="py-6 text-center text-sm text-slate-500 dark:text-zinc-400">
            No results found.
          </Command.Empty>
          {sections.map((section) => (
            <Command.Group key={section}>
              <Command.Separator />
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-zinc-400">
                {section}
              </div>
              {items
                .filter((item) => item.section === section)
                .map((item) => (
                  <Command.Item
                    key={item.label}
                    onSelect={item.action}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                  >
                    <item.icon className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-zinc-100">{item.label}</div>
                      <div className="text-xs text-slate-500 dark:text-zinc-400">{item.description}</div>
                    </div>
                    {item.shortcut && (
                      <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">{item.shortcut}</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  </Command.Item>
                ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command.Dialog>
    </Command>
  );
}