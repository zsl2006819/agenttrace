'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Users,
  Shield,
  UserCog,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  owner: { label: 'Owner', color: 'text-amber-700', bg: 'bg-amber-50', icon: Shield },
  admin: { label: 'Admin', color: 'text-blue-700', bg: 'bg-blue-50', icon: UserCog },
  viewer: { label: 'Viewer', color: 'text-slate-700', bg: 'bg-slate-50', icon: Users },
};

interface TeamMember {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'viewer';
  status: 'active' | 'pending';
  joined_at: string;
}

interface TeamContentProps {
  userEmail: string;
  userId: string;
  mockMembers: TeamMember[];
}

export function TeamContent({ userEmail, userId, mockMembers }: TeamContentProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'admin'>('viewer');
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setInviteOpen(false);
    setInviteEmail('');
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Team
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Manage team members and their permissions.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="rounded-lg bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]">
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Invite Member
        </Button>
      </div>

      {/* Team Members */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-colors duration-200 hover:border-slate-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-widest text-slate-500">Member</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-widest text-slate-500">Role</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-widest text-slate-500">Joined</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-widest text-slate-500 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockMembers.map((member) => {
                const roleInfo = ROLE_LABELS[member.role];
                const RoleIcon = roleInfo.icon;
                const isCurrentUser = member.id === userId;
                return (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                          {member.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{member.email}</p>
                          {isCurrentUser && <span className="text-xs text-slate-500">You</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn('inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] font-semibold', roleInfo.color, roleInfo.bg)}>
                        <RoleIcon className="h-3 w-3" strokeWidth={1.75} />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn('inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] font-semibold',
                        member.status === 'active'
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-amber-700 bg-amber-50'
                      )}>
                        {member.status === 'active' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3" strokeWidth={1.75} />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {!isCurrentUser && member.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                          Resend Invite
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Role Legend */}
      <section className="mt-6 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-colors duration-200 hover:border-slate-300">
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['owner', 'admin', 'viewer'] as const).map((role) => {
            const info = ROLE_LABELS[role];
            const Icon = info.icon;
            return (
              <div key={role} className="rounded-lg border border-slate-200 p-4 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn('h-5 w-5', info.color)} strokeWidth={1.75} />
                  <span className="font-semibold text-slate-900">{info.label}</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  {role === 'owner' && (
                    <>
                      <li>• Full access to all settings</li>
                      <li>• Manage team members</li>
                      <li>• Billing & subscription</li>
                      <li>• Delete workspace</li>
                    </>
                  )}
                  {role === 'admin' && (
                    <>
                      <li>• View audit logs</li>
                      <li>• Manage API keys</li>
                      <li>• Configure security rules</li>
                      <li>• Invite members</li>
                    </>
                  )}
                  {role === 'viewer' && (
                    <>
                      <li>• View audit logs</li>
                      <li>• View API usage</li>
                      <li>• Export reports</li>
                    </>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Enter their email and choose a role. They'll receive an invitation to join.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input id="inviteEmail" type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteRole">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'viewer' | 'admin')}>
                <SelectTrigger id="inviteRole">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer (read-only access)</SelectItem>
                  <SelectItem value="admin">Admin (manage settings, invite members)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto rounded-lg bg-slate-900 text-white shadow-sm hover:bg-slate-800">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}