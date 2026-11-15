-- ============================================================
-- NUCLEAR RESET: Complete rebuild of multi-tenancy objects
-- WARNING: This will DROP and recreate profiles table
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- Step 1: Drop trigger first (before dropping function)
drop trigger if exists on_auth_user_created on auth.users;

-- Step 2: Drop functions with CASCADE
drop function if exists public.handle_new_user() cascade;
drop function if exists public.get_my_tenant_id() cascade;

-- Step 3: Drop old profiles table with CASCADE
drop table if exists public.profiles cascade;

-- Step 4: Drop old view with CASCADE
drop view if exists public.my_audit_events cascade;

-- Step 5: Ensure audit_events has tenant_id column
alter table public.audit_events
    add column if not exists tenant_id text not null default 'default-tenant';

-- ============================================
-- REBUILD FROM SCRATCH
-- ============================================

-- Step 6: Create profiles table fresh
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    tenant_id text not null unique,
    email text,
    full_name text,
    avatar_url text,
    role text default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index profiles_tenant_id_idx on public.profiles(tenant_id);

-- Step 7: Create updated_at trigger function for profiles
create or replace function public.trg_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger trg_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.trg_profiles_updated_at();

-- Step 8: Create get_my_tenant_id() function
create or replace function public.get_my_tenant_id()
returns text
language sql
security definer set search_path = public
as $$
    select tenant_id from public.profiles where id = auth.uid();
$$;

-- Step 9: Create handle_new_user() function
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

-- Step 10: Create trigger on auth.users
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- Step 11: Create my_audit_events view
create view public.my_audit_events as
select * from public.audit_events
where tenant_id = public.get_my_tenant_id();

-- Step 12: Grant permissions
grant select on public.my_audit_events to authenticated;

-- Step 13: Enable RLS on audit_events
alter table public.audit_events enable row level security;

drop policy if exists "Users can view own tenant audit events" on public.audit_events;
drop policy if exists "Users can insert own tenant audit events" on public.audit_events;

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

-- Step 14: Enable RLS on profiles
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
-- VERIFICATION
-- ============================================
-- Run these to verify:
--   select * from public.profiles limit 1;
--   select public.get_my_tenant_id();
--   select * from public.my_audit_events limit 1;