create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists display_name text;

alter table public.profiles
  add column if not exists updated_at timestamptz default now();

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.people
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

create unique index if not exists people_owner_name_unique
  on public.people (owner_id, lower(name));

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  body text not null,
  sent_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.messages
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Note',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

alter table public.profiles enable row level security;
alter table public.people enable row level security;
alter table public.messages enable row level security;
alter table public.notes enable row level security;

drop policy if exists "Users manage their own profile" on public.profiles;
create policy "Users manage their own profile" on public.profiles
  for all using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users manage their own people" on public.people;
create policy "Users manage their own people" on public.people
  for all using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Users manage their own messages" on public.messages;
create policy "Users manage their own messages" on public.messages
  for all using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Users manage their own notes" on public.notes;
create policy "Users manage their own notes" on public.notes
  for all using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);                       