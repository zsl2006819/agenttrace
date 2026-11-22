-- ============================================
-- 007_webhook_events.sql
-- Idempotency ledger for Creem webhook deliveries.
--
-- Creem retries webhook deliveries. Recording the event id before we
-- process a payload guarantees a replayed delivery cannot overwrite an
-- already-updated plan or quota.
-- ============================================

create table if not exists public.webhook_events (
    id uuid primary key default gen_random_uuid(),
    event_id text not null unique,
    event_type text not null,
    payload jsonb,
    processed_at timestamptz not null default now()
);

create index if not exists webhook_events_event_id_idx
    on public.webhook_events(event_id);

-- Only the service role (which bypasses RLS) writes to this ledger.
-- No policies are created, so anon/authenticated clients cannot read it.
alter table public.webhook_events enable row level security;

-- Housekeeping: allow pruning old ledger rows without a full table scan.
create index if not exists webhook_events_processed_at_idx
    on public.webhook_events(processed_at desc);