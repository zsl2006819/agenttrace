-- ============================================================
-- PATCH: Add tenant_id to existing audit_events table
-- Run this BEFORE 002_multi_tenant_auth.sql if you get:
--   ERROR: column "tenant_id" does not exist
-- ============================================================

-- 1. Add tenant_id column if it doesn't exist (with default for existing rows)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'audit_events'
          AND column_name = 'tenant_id'
    ) THEN
        -- Add column with default for existing rows
        ALTER TABLE audit_events
            ADD COLUMN tenant_id text NOT NULL DEFAULT 'default-tenant';
        RAISE NOTICE 'Added tenant_id column with default ''default-tenant''';
    ELSE
        RAISE NOTICE 'Column tenant_id already exists';
    END IF;
END $$;

-- 2. Ensure the unique constraint on (tenant_id, agent_id, session_id, sequence) exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'audit_events_tenant_agent_session_sequence_key'
    ) THEN
        ALTER TABLE audit_events
            ADD CONSTRAINT audit_events_tenant_agent_session_sequence_key
            UNIQUE (tenant_id, agent_id, session_id, sequence);
        RAISE NOTICE 'Added unique constraint (tenant_id, agent_id, session_id, sequence)';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;

-- 3. Ensure the unique constraint on (tenant_id, idempotency_key) exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'audit_events_tenant_id_idempotency_key_key'
    ) THEN
        ALTER TABLE audit_events
            ADD CONSTRAINT audit_events_tenant_id_idempotency_key_key
            UNIQUE (tenant_id, idempotency_key);
        RAISE NOTICE 'Added unique constraint (tenant_id, idempotency_key)';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;

-- 4. Drop the append-only trigger if it exists (we'll recreate it)
DROP TRIGGER IF EXISTS trg_audit_append_only ON audit_events;

-- 5. Drop the mutation prevention function (will be recreated)
DROP FUNCTION IF EXISTS trg_prevent_audit_mutation();

-- 6. Recreate the append-only trigger function
CREATE OR REPLACE FUNCTION trg_prevent_audit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'Audit events are append-only. UPDATE and DELETE on audit_events are strictly prohibited.';
    RETURN NULL;
END;
$$;

-- 7. Recreate the append-only trigger
CREATE TRIGGER trg_audit_append_only
    BEFORE UPDATE OR DELETE ON audit_events
    FOR EACH ROW
    EXECUTE FUNCTION trg_prevent_audit_mutation();

-- 8. Revoke UPDATE and DELETE permissions
REVOKE UPDATE, DELETE ON TABLE audit_events FROM PUBLIC;
REVOKE UPDATE, DELETE ON TABLE audit_events FROM authenticated;
REVOKE UPDATE, DELETE ON TABLE audit_events FROM anon;
REVOKE UPDATE, DELETE ON TABLE audit_events FROM service_role;

-- 9. Grant SELECT and INSERT to authenticated role
GRANT SELECT, INSERT ON TABLE audit_events TO authenticated;

-- Done - now you can run 002_multi_tenant_auth.sql