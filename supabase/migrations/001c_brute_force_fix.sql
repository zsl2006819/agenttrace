-- ============================================================
-- BRUTE FORCE FIX: audit_events.tenant_id missing
-- Run this in Supabase SQL Editor if you get:
--   ERROR: column "tenant_id" does not exist
-- ============================================================

-- 0. Show current state for debugging
DO $$
DECLARE
    col_count int;
BEGIN
    SELECT count(*) INTO col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'audit_events'
      AND column_name = 'tenant_id';

    IF col_count = 0 THEN
        RAISE NOTICE 'DIAGNOSIS: tenant_id column does NOT exist';
    ELSE
        RAISE NOTICE 'DIAGNOSIS: tenant_id column exists';
    END IF;
END $$;

-- 1. Drop the broken view (CASCADE to remove dependencies)
drop view if exists public.my_audit_events cascade;

-- 2. Force add the column with explicit public schema
alter table public.audit_events
    add column if not exists tenant_id text not null default 'default-tenant';

-- 3. Verify the column was added (should raise notice)
DO $$
DECLARE
    col_count int;
BEGIN
    SELECT count(*) INTO col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'audit_events'
      AND column_name = 'tenant_id';

    IF col_count = 0 THEN
        RAISE EXCEPTION 'FAILED: tenant_id column was NOT added!';
    ELSE
        RAISE NOTICE 'SUCCESS: tenant_id column now exists';
    END IF;
END $$;

-- 4. Ensure unique constraints exist (drop and recreate if needed)
alter table public.audit_events
    drop constraint if exists audit_events_tenant_agent_session_sequence_key;
alter table public.audit_events
    drop constraint if exists audit_events_tenant_id_idempotency_key_key;

alter table public.audit_events
    add constraint audit_events_tenant_agent_session_sequence_key
    unique (tenant_id, agent_id, session_id, sequence);

alter table public.audit_events
    add constraint audit_events_tenant_id_idempotency_key_key
    unique (tenant_id, idempotency_key);

-- 5. Recreate the view with explicit public schema
create or replace view public.my_audit_events as
select * from public.audit_events
where tenant_id = get_my_tenant_id();

-- 6. Grant access
grant select on public.my_audit_events to authenticated;

-- 7. Final verification
DO $$
DECLARE
    col_count int;
BEGIN
    SELECT count(*) INTO col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'audit_events'
      AND column_name = 'tenant_id';

    IF col_count = 0 THEN
        RAISE EXCEPTION 'STILL FAILED: tenant_id column missing after fix!';
    ELSE
        RAISE NOTICE 'ALL FIXED: tenant_id exists and view is ready';
    END IF;
END $$;