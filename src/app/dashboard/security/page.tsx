'use client';

import { useState } from 'react';
import {
  Shield,
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
import { toast } from 'sonner';

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
  Block: { color: 'text-red-600', bg: 'bg-red-50' },
  Alert: { color: 'text-amber-600', bg: 'bg-amber-50' },
};

const STATUS_LABELS: Record<string, { color: string; bg: string }> = {
  Active: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  Inactive: { color: 'text-zinc-500', bg: 'bg-zinc-100' },
};

export default function SecurityPage() {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Dynamic risk assessment: only show red warning when there is an active
  // Block rule. Without any rules, or without an active Block rule, the
  // system is considered protected.
  const hasRules = RULES.length > 0;
  const hasBlockEvent = RULES.some(
    (rule) => rule.action === 'Block' && rule.status === 'Active'
  );
  const hasRisk = hasRules && hasBlockEvent;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await new Promise((r) => setTimeout(r, 800));
    setCreating(false);
    setOpen(false);
    toast.success('Rule created');
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Security & Guardrails
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Define interception rules to stop unsafe agent actions before they happen.
        </p>
      </div>

      {/* Status banner */}
      <section className="mb-8 rounded-xl p-6 flex items-center gap-4 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-200/80 bg-white">
        {hasRisk ? (
          <>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="border-l border-red-100 pl-4">
              <h3 className="font-semibold text-red-700">High Risk Detected</h3>
              <p className="mt-0.5 text-red-600 text-[12px]">
                Active guardrail rules have intercepted unsafe agent operations this month.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Shield className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="border-l border-blue-100 pl-4">
              <h3 className="font-semibold text-blue-700">Recommended guardrails available</h3>
              <p className="mt-0.5 text-blue-600 text-[12px]">
                Enable them to protect your agents from destructive actions.
              </p>
            </div>
            <Button
              onClick={() => setOpen(true)}
              size="sm"
              className="ml-auto rounded-lg bg-slate-900 text-white shadow-sm hover:bg-slate-800"
            >
              <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
              Enable All Recommended
            </Button>
          </>
        )}
      </section>

      {/* Rules */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Interception Rules
          </h3>
          <Button onClick={() => setOpen(true)} size="sm" className="rounded-lg">
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
            Create Rule
          </Button>
        </div>
        <div className="space-y-2">
          {RULES.map((rule) => {
            const actionStyle = ACTION_LABELS[rule.action];
            const statusStyle = STATUS_LABELS[rule.status];
            return (
              <div
                key={rule.id}
                className="rounded-lg border border-slate-200/50 bg-white p-4 flex items-center justify-between transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 text-sm">
                      {rule.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded px-1 py-0.5 uppercase tracking-tighter ml-1.5">
                      [Recommended]
                    </span>
                    <span className="text-xs font-mono text-slate-500 bg-slate-50 rounded px-1.5 py-0.5">
                      {rule.condition}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-semibold ${actionStyle.color} ${actionStyle.bg}`}>
                    {rule.action}
                  </span>
                  <span className={`inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-semibold ${statusStyle.color} ${statusStyle.bg}`}>
                    {rule.status}
                  </span>
                  <button
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Delete rule"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[10px] text-slate-400">
          Rules are evaluated in order. First match wins.
        </p>
      </section>

      {/* Notifications Module */}
      <section className="mt-8 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Notifications
            </h3>
          </div>
          <p className="text-[10px] text-slate-400">Alert delivery</p>
        </div>
        <p className="text-xs text-slate-500 mb-4">
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
              className="bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => toast.success('Endpoint saved')}
              size="sm"
              className="rounded-lg bg-slate-900 text-white shadow-sm hover:bg-slate-800"
            >
              Save Endpoint
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg">
              Test Connection
            </Button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200/50">
          <p className="text-[10px] text-slate-400">
            No notifications saved yet. Alerts will be posted to this endpoint when
            a rule is triggered.
          </p>
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
