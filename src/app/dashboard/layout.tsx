import { redirect } from 'next/navigation';
import { createSupabaseServerWithAuth } from '@/lib/supabase-server';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { CommandPalette } from '@/components/command-palette';
import { Toaster } from 'sonner';

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
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      <DashboardSidebar email={user.email ?? null} />
      <main className="min-w-0 flex-1">{children}</main>
      <CommandPalette />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-200 dark:border-zinc-700',
          duration: 2000,
          style: { boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
        }}
      />
    </div>
  );
}