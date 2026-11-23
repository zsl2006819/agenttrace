'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RULES = [
  {
    id: 'rule-1',
    name: 'Block destructive DB writes',
    condition: "tool == 'drop_table' || tool == 'truncate_table'",
    action: 'Block',
    status: 'Active',
  },
  {
    id: 'rule-2',
    name: 'Alert on PII exposure',
    condition: "tool == 'send_email' && contains_pii == true",
    action: 'Alert',
    status: 'Active',
  },
  {
    id: 'rule-3',
    name: 'Rate-limit LLM calls',
    condition: "tool == 'llm_chat' && calls_per_min > 60",
    action: 'Block',
    status: 'Inactive',
  },
];

const ACTION_LABELS: Record<string, { color: string; bg: string }> = {
  Block: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20' },
  Alert: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
};

const STATUS_LABELS: Record<string, { color: string; bg: string }> = {
  Active: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  Inactive: { color: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800/50' },
};

export default function SecurityPage() {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [hasRisk, setHasRisk] = useState(true);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await new Promise((r) => setTimeout(r, 800));
    setCreating(false);
    setOpen(false);
    setHasRisk(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Security & Guardrails
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Define interception rules to stop unsafe agent actions before they happen.
        </p>
      </div>

      {/* Status banner */}
      <section className="mb-8 rounded-xl p-6 flex items-center gap-4 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-none border">
        {hasRisk ? (
          <>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 dark:bg-red-900/20 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="border-l border-red-100 pl-4 dark:border-red-900/30">
              <h3 className="font-semibold text-red-700 dark:text-red-400">High Risk Detected</h3>
              <p className="mt-0.5 text-red-600 dark:text-red-400/90 text-[12px]">
                2 active guardrail rules are blocking potentially unsafe agent operations.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="border-l border-emerald-100 pl-4 dark:border-emerald-900/30">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">System Protected</h3>
              <p className="mt-0.5 text-emerald-600 dark:text-emerald-400/90 text-[12px]">
                All guardrail rules are active. No active threats detected.
              </p>
            </div>
          </>
        )}
      </section>

      {/* Rules table */}
      <section className="rounded-xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 flex items-center justify-between">
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Interception Rules
          </h3>
          <Button onClick={() => setOpen(true)} size="sm" className="rounded-lg">
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
            Create Rule
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-zinc-100 dark:divide-zinc-800">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/30">
                <th className="px-6 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Rule Name
                </th>
                <th className="px-6 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Condition
                </th>
                <th className="px-6 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Action
                </th>
                <th className="px-6 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Status
                </th>
                <th className="px-6 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider dark:text-zinc-400 text-right">
                  </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {RULES.map((rule) => {
                const actionStyle = ACTION_LABELS[rule.action];
                const statusStyle = STATUS_LABELS[rule.status];
                return (
                  <tr key={rule.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {rule.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm tabular-nums text-zinc-600 dark:text-zinc-500">
                      {rule.condition}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${actionStyle.color} ${actionStyle.bg}`}>
                        {rule.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${statusStyle.color} ${statusStyle.bg}`}>
                        {rule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" aria-label="Delete rule">
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/50 text-[12px] text-zinc-500 dark:text-zinc-400">
          Rules are evaluated in order. First match wins.
        </div>
      </section>

      {/* Notifications Module */}
      <section className="mt-8 rounded-xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Notifications
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Alert delivery</p>
        </div>
        <div className="p-6">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            When a guardrail rule triggers a block, AgentTrace sends an alert to your
            configured endpoint. Enter a Slack Webhook URL or Email address.
          </p>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="notifyUrl">Endpoint URL</Label>
              <Input
                id="notifyUrl"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                defaultValue=""
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {}}
                size="sm"
                className="rounded-lg bg-zinc-900 text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Save Endpoint
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg">
                Test Connection
              </Button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              No notifications saved yet. Alerts will be posted to this endpoint when
              a rule is triggered.
            </p>
          </div>
        </div>
      </section>

      {/* Create Rule dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Create Interception Rule</DialogTitle>
            <DialogDescription>
              Choose a tool and action. When an agent matches this condition,
              AgentTrace will block or alert before the call executes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input id="ruleName" placeholder="e.g. Block drop_table" defaultValue="" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toolSelect">Target Tool</Label>
                <Select onValueChange={() => {}} defaultValue="drop_table">
                  <SelectTrigger id="toolSelect">
                    <SelectValue placeholder="Select tool" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drop_table">drop_table</SelectItem>
                    <SelectItem value="truncate_table">truncate_table</SelectItem>
                    <SelectItem value="send_email">send_email</SelectItem>
                    <SelectItem value="llm_chat">llm_chat</SelectItem>
                    <SelectItem value="delete_record">delete_record</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="actionSelect">Action</Label>
                <Select onValueChange={() => {}} defaultValue="Block">
                  <SelectTrigger id="actionSelect">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Block">Block (prevent the call)</SelectItem>
                    <SelectItem value="Alert">Alert (log + notify)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={creating}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={1.75} /> : null}
                Create Rule
                <ChevronRight className="ml-2 h-4 w-4" strokeWidth={1.75} />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
