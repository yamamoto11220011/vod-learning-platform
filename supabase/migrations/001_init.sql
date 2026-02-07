create extension if not exists "pgcrypto";
create extension if not exists pg_trgm;

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  avatar_url text,
  is_subscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  video_url text not null,
  duration int not null check (duration >= 0),
  category text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  content text not null,
  video_timestamp int not null check (video_timestamp >= 0),
  created_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create index if not exists idx_videos_created_at on public.videos (created_at desc);
create index if not exists idx_videos_category on public.videos (category);
create index if not exists idx_videos_title_trgm on public.videos using gin (title gin_trgm_ops);

create index if not exists idx_notes_user_created on public.notes (user_id, created_at desc);
create index if not exists idx_notes_video_timestamp on public.notes (video_id, video_timestamp asc);

alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.notes enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy "videos_select_authenticated" on public.videos
for select using (auth.role() = 'authenticated');

create policy "notes_select_own" on public.notes
for select using (auth.uid() = user_id);

create policy "notes_insert_own" on public.notes
for insert with check (auth.uid() = user_id);

create policy "notes_update_own" on public.notes
for update using (auth.uid() = user_id);

create policy "notes_delete_own" on public.notes
for delete using (auth.uid() = user_id);
