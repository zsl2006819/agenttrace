import { redirect } from 'next/navigation';
import { createSupabaseServerWithAuth, createSupabaseServiceRole } from '@/lib/supabase-server';
import { TeamContent } from './team-content';

export const dynamic = 'force-dynamic';

interface TeamMember {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'viewer';
  status: 'active' | 'pending';
  joined_at: string;
}

export default async function TeamPage() {
  const supabase = createSupabaseServerWithAuth();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/dashboard/team');
  }

  const service = createSupabaseServiceRole();

  const { data: profile } = await service
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  const tenantId = (profile?.tenant_id as string | undefined) ?? null;

  // Fetch team members (mock data for now - in production this would come from a team_members table)
  const mockMembers: TeamMember[] = [
    { id: user.id, email: user.email ?? 'owner@example.com', role: 'owner', status: 'active', joined_at: new Date().toISOString() },
    { id: '2', email: 'alice@example.com', role: 'admin', status: 'active', joined_at: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: '3', email: 'bob@example.com', role: 'viewer', status: 'pending', joined_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  ];

  return <TeamContent userEmail={user.email ?? ''} userId={user.id} mockMembers={mockMembers} />;
}