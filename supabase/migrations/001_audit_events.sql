-- 启用 pgcrypto 扩展（用于 gen_random_uuid()）
create extension if not exists pgcrypto;

-- 创建审计事件表（Append-Only，不可修改不可删除）
create table if not exists audit_events (
    id uuid primary key default gen_random_uuid(),
    tenant_id text not null,
    agent_id text not null,
    session_id text not null,
    sequence bigint not null,
    idempotency_key text not null,
    tool_name text not null,
    input_hash text,
    output_hash text,
    error_code text,
    human_override boolean default false,
    prev_hash text,
    current_hash text,
    signature text,
    key_id text,
    created_at timestamptz default now()
);

-- 唯一约束：同一租户 / 代理 / 会话下，序列号唯一（保证顺序严格递增）
alter table audit_events
    add constraint audit_events_tenant_agent_session_sequence_key
    unique (tenant_id, agent_id, session_id, sequence);

-- 唯一约束：同一租户下，幂等键唯一（防止重复提交）
alter table audit_events
    add constraint audit_events_tenant_id_idempotency_key_key
    unique (tenant_id, idempotency_key);

-- Append-Only：撤销所有角色的 UPDATE 和 DELETE 权限
revoke update, delete on table audit_events from public;
revoke update, delete on table audit_events from authenticated;
revoke update, delete on table audit_events from anon;
revoke update, delete on table audit_events from service_role;

-- 触发器函数：拦截任何 UPDATE 或 DELETE，直接抛出异常
create or replace function trg_prevent_audit_mutation()
returns trigger
language plpgsql
as $$
begin
    raise exception 'Audit events are append-only. UPDATE and DELETE on audit_events are strictly prohibited.';
    return null;
end;
$$;

-- 创建行级 BEFORE 触发器，拦截 UPDATE 和 DELETE
create trigger trg_audit_append_only
    before update or delete on audit_events
    for each row
    execute function trg_prevent_audit_mutation();