-- ============================================================
-- API Keys table (tenant-scoped)
-- Run this in the Supabase SQL Editor.
-- Only the SHA-256 hash of a key is ever stored; the plaintext is
-- returned to the user exactly once at creation time.
-- ============================================================

create table if not exists public.api_keys (
    id uuid primary key default gen_random_uuid(),
    tenant_id text not null,
    name text not null default 'Default',
    key_prefix text not null default '',
    key_hash text not null,
    last_used_at timestamptz,
    revoked_at timestamptz,
    created_at timestamptz default now()
);

create index if not exists api_keys_tenant_id_idx on public.api_keys (tenant_id);
create unique index if not exists api_keys_tenant_hash_idx on public.api_keys (tenant_id, key_hash);

-- Enable RLS: each tenant may only see / manage its own keys.
alter table public.api_keys enable row level security;

drop policy if exists "Users can view own tenant api keys" on public.api_keys;
drop policy if exists "Users can insert own tenant api keys" on public.api_keys;
drop policy if exists "Users can update own tenant api keys" on public.api_keys;
drop policy if exists "Users can delete own tenant api keys" on public.api_keys;

create policy "Users can view own tenant api keys"
    on public.api_keys
    for select
    using (
        tenant_id = (
            select tenant_id from public.profiles where id = auth.uid()
        )
    );

create policy "Users can insert own tenant api keys"
    on public.api_keys
    for insert
    with check (
        tenant_id = (
            select tenant_id from public.profiles where id = auth.uid()
        )
    );

create policy "Users can update own tenant api keys"
    on public.api_keys
    for update
    using (
        tenant_id = (
            select tenant_id from public.profiles where id = auth.uid()
        )
    )
    with check (
        tenant_id = (
            select tenant_id from public.profiles where id = auth.uid()
        )
    );

create policy "Users can delete own tenant api keys"
    on public.api_keys
    for delete
    using (
        tenant_id = (
            select tenant_id from public.profiles where id = auth.uid()
        )
    );