import { redirect } from 'next/navigation';
import { createSupabaseServerWithAuth } from '@/lib/supabase-server';
import { DashboardSidebar } from '@/components/dashboard/sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerWithAuth();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?redirect=/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-zinc-50/80 dark:bg-zinc-900/40">
      <DashboardSidebar email={user.email ?? null} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}