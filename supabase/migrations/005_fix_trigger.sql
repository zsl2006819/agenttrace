-- ============================================================
-- FIX: Database error saving new user
-- Issue: handle_new_user() trigger fails on user registration
-- Solution: Replace gen_random_bytes with md5(random()::text)
-- ============================================================

-- Step 1: Drop trigger first
drop trigger if exists on_auth_user_created on auth.users;

-- Step 2: Drop function with CASCADE
drop function if exists public.handle_new_user() cascade;

-- Step 3: Recreate function with safer random generation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, tenant_id, email, full_name, avatar_url)
    values (
        new.id,
        'tenant_' || md5(random()::text || clock_timestamp()::text),
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$;

-- Step 4: Recreate trigger
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- Step 5: Verify (optional)
-- select * from public.profiles limit 1;