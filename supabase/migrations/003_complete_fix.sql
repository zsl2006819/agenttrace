-- ============================================================
-- COMPLETE FIX: Run this entire script in Supabase SQL Editor
-- Fixes: function get_my_tenant_id() does not exist
-- ============================================================

-- Step 0: Ensure pgcrypto extension is enabled
create extension if not exists pgcrypto;

-- ============================================
-- Step 1: Create profiles table (if not exists)
-- ============================================
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    tenant_id text not null unique,
    email text,
    full_name text,
    avatar_url text,
    role text default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists profiles_tenant_id_idx on public.profiles(tenant_id);

-- ============================================
-- Step 2: Create get_my_tenant_id() function FIRST
-- (Must exist before creating the view that uses it)
-- ============================================
create or replace function public.get_my_tenant_id()
returns text
language sql
security definer set search_path = public
as $$
    select tenant_id from public.profiles where id = auth.uid();
$$;

-- ============================================
-- Step 3: Ensure audit_events has tenant_id column
-- ============================================
alter table public.audit_events
    add column if not exists tenant_id text not null default 'default-tenant';

-- ============================================
-- Step 4: Drop old view (CASCADE to remove dependencies)
-- ============================================
drop view if exists public.my_audit_events cascade;

-- ============================================
-- Step 5: Recreate my_audit_events view
-- ============================================
create view public.my_audit_events as
select * from public.audit_events
where tenant_id = public.get_my_tenant_id();

-- ============================================
-- Step 6: Grant permissions
-- ============================================
grant select on public.my_audit_events to authenticated;

-- ============================================
-- Step 7: Enable RLS on audit_events (if not already)
-- ============================================
alter table public.audit_events enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own tenant audit events" on public.audit_events;
drop policy if exists "Users can insert own tenant audit events" on public.audit_events;

-- Recreate RLS policies
create policy "Users can view own tenant audit events"
    on public.audit_events
    for select
    using (
        tenant_id = (
            select tenant_id from public.profiles where id = auth.uid()
        )
    );

create policy "Users can insert own tenant audit events"
    on public.audit_events
    for insert
    with check (
        tenant_id = (
            select tenant_id from public.profiles where id = auth.uid()
        )
    );

-- ============================================
-- Step 8: Enable RLS on profiles
-- ============================================
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile"
    on public.profiles
    for select
    using (id = auth.uid());

create policy "Users can update own profile"
    on public.profiles
    for update
    using (id = auth.uid())
    with check (id = auth.uid());

-- ============================================
-- Step 9: Auto-create profile trigger (if not exists)
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, tenant_id, email, full_name, avatar_url)
    values (
        new.id,
        'tenant_' || encode(gen_random_bytes(12), 'hex'),
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- ============================================
-- DONE: All objects created in correct order
-- ============================================
-- Verify with:
--   select * from public.my_audit_events limit 1;
--   select public.get_my_tenant_id();