-- ============================================================
-- 002_multi_tenant_auth.sql (PATCHED)
-- Multi-tenancy with Supabase Auth, RLS, and profiles
--
-- Prerequisites:
--   - Run 001_audit_events.sql first (creates audit_events table)
--   - If audit_events was created WITHOUT tenant_id, run 001b_patch_tenant_id.sql first
-- ============================================================

-- Enable pgcrypto extension (for gen_random_uuid())
create extension if not exists pgcrypto;

-- ============================================
-- 1. profiles table: Maps auth.users.id to tenant_id
-- ============================================
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    tenant_id text not null unique,
    email text,
    full_name text,
    avatar_url text,
    role text default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Index: speed up lookup by tenant_id
create index if not exists profiles_tenant_id_idx on profiles(tenant_id);

-- Trigger: auto-update updated_at
create or replace function trg_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at
    before update on profiles
    for each row
    execute function trg_profiles_updated_at();

-- ============================================
-- 2. audit_events table: Add tenant_id if missing (defensive)
-- ============================================
DO $$
BEGIN
    -- Check if tenant_id column exists in audit_events
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'audit_events'
          AND column_name = 'tenant_id'
    ) THEN
        -- Add tenant_id with default for existing rows
        ALTER TABLE audit_events
            ADD COLUMN tenant_id text NOT NULL DEFAULT 'default-tenant';
        RAISE NOTICE 'Added tenant_id column to audit_events';
    ELSE
        RAISE NOTICE 'audit_events.tenant_id already exists';
    END IF;
END $$;

-- ============================================
-- 3. audit_events RLS policies
-- ============================================
-- Enable RLS
alter table audit_events enable row level security;

-- Drop existing policies if they exist (for idempotency)
drop policy if exists "Users can view own tenant audit events" on audit_events;
drop policy if exists "Users can insert own tenant audit events" on audit_events;

-- Policy: Users can only SELECT rows for their own tenant_id
create policy "Users can view own tenant audit events"
    on audit_events
    for select
    using (
        tenant_id = (
            select tenant_id from profiles where id = auth.uid()
        )
    );

-- Policy: Users can only INSERT rows for their own tenant_id
create policy "Users can insert own tenant audit events"
    on audit_events
    for insert
    with check (
        tenant_id = (
            select tenant_id from profiles where id = auth.uid()
        )
    );

-- Note: UPDATE and DELETE are blocked by the append-only trigger
-- defined in 001_audit_events.sql (or 001b_patch_tenant_id.sql)
-- RLS does not need separate policies for these since the trigger
-- raises an exception at the table level.

-- ============================================
-- 4. profiles table RLS
-- ============================================
alter table profiles enable row level security;

-- Drop existing policies if they exist (for idempotency)
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Policy: Users can only view their own profile
create policy "Users can view own profile"
    on profiles
    for select
    using (id = auth.uid());

-- Policy: Users can only update their own profile
create policy "Users can update own profile"
    on profiles
    for update
    using (id = auth.uid())
    with check (id = auth.uid());

-- ============================================
-- 5. Auto-create profile on user signup (trigger)
-- ============================================
create or replace function handle_new_user()
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
    execute function handle_new_user();

-- ============================================
-- 6. Helper functions and views
-- ============================================
-- Get current user's tenant_id (for use in frontend/RPC)
create or replace function get_my_tenant_id()
returns text
language sql
security definer set search_path = public
as $$
    select tenant_id from profiles where id = auth.uid();
$$;

-- Drop existing view if it exists (for idempotency)
drop view if exists my_audit_events;

-- Current tenant's audit events view (auto-filtered by tenant_id)
create view my_audit_events as
select * from audit_events
where tenant_id = get_my_tenant_id();

grant select on my_audit_events to authenticated;