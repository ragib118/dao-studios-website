-- DAO Studios: User / Admin role foundation
-- Run this once in the Supabase SQL Editor.
-- IMPORTANT: After running it, set your owner account to role = 'admin'
-- using the final UPDATE statement at the bottom.

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    role text not null default 'user' check (role in ('user', 'admin')),
    avatar_color text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, display_name, role)
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'name',
            split_part(coalesce(new.email, ''), '@', 1),
            'DAO Studios User'
        ),
        'user'
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
    );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Users can read their own profile.
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- Admins can read every profile.
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

-- Users can update their own non-role profile fields.
-- The role column is protected by a trigger below.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Admins can update profiles.
drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Prevent non-admin users from changing their own role.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if old.role is distinct from new.role and not public.is_admin() then
        raise exception 'Only an admin can change account roles';
    end if;

    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;

create trigger protect_profile_role
before update on public.profiles
for each row
execute function public.protect_profile_role();

-- Backfill profiles for users that already exist.
insert into public.profiles (id, display_name, role)
select
    id,
    coalesce(
        raw_user_meta_data ->> 'full_name',
        raw_user_meta_data ->> 'name',
        split_part(coalesce(email, ''), '@', 1),
        'DAO Studios User'
    ),
    'user'
from auth.users
on conflict (id) do nothing;

-- ============================================================
-- IMPORTANT: replace the email below with YOUR owner/admin email
-- and run this line after the rest of the script succeeds.
-- ============================================================
-- update public.profiles
-- set role = 'admin', updated_at = now()
-- where id = (select id from auth.users where email = 'YOUR-EMAIL@example.com');
