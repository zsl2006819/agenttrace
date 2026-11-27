-- ============================================================
-- Security Rules table (tenant-scoped)
-- Rules that intercept agent actions before they execute.
-- ============================================================

create table if not exists public.security_rules (
    id uuid primary key default gen_random_uuid(),
    tenant_id text not null,
    name text not null,
    target_tool text not null,
    condition text not null default 'always',
    action text not null check (action in ('Block', 'Alert')),
    status text not null default 'Active' check (status in ('Active', 'Inactive')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists security_rules_tenant_id_idx on public.security_rules (tenant_id);
create index if not exists security_rules_tenant_tool_idx on public.security_rules (tenant_id, target_tool, status);

-- Enable RLS: each tenant may only see / manage its own rules.
alter table public.security_rules enable row level security;

drop policy if exists "Users can view own tenant security rules" on public.security_rules;
drop policy if exists "Users can insert own tenant security rules" on public.security_rules;
drop policy if exists "Users can update own tenant security rules" on public.security_rules;
drop policy if exists "Users can delete own tenant security rules" on public.security_rules;

create policy "Users can view own tenant security rules"
    on public.security_rules
    for select
    using (
        tenant_id = (
            select tenant_id from public.profiles where id = auth.uid()
        )
    );

create policy "Users can insert own tenant security rules"
    on public.security_rules
    for insert
    with check (
        tenant_id = (
            select tenant_id from public.profiles where id = auth.uid()
        )
    );

create policy "Users can update own tenant security rules"
    on public.security_rules
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

create policy "Users can delete own tenant security rules"
    on public.security_rules
    for delete
    using (
        tenant_id = (
            select tenant_id from public.profiles where id = auth.uid()
        )
    );

-- Insert default recommended rules for new tenants
-- These will be created via the handle_new_user trigger or manually
-- Example seed (uncomment and run manually per tenant if needed):
-- insert into public.security_rules (tenant_id, name, target_tool, condition, action, status)
-- values
--     ('tenant_xxx', 'Block destructive DB writes', 'drop_table', 'always', 'Block', 'Active'),
--     ('tenant_xxx', 'Block table truncation', 'truncate_table', 'always', 'Block', 'Active'),
--     ('tenant_xxx', 'Alert on PII exposure', 'send_email', 'contains_pii == true', 'Alert', 'Active'),
--     ('tenant_xxx', 'Rate-limit LLM calls', 'llm_chat', 'calls_per_min > 60', 'Block', 'Inactive');