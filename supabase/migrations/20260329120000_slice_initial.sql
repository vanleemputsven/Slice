-- Slice: per-user subscriptions + preferences with RLS.
-- Apply in Supabase SQL editor or via `supabase db push` when using CLI.

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  hourly_wage numeric(12, 4),
  hours_per_workday smallint not null default 8
    check (hours_per_workday >= 1 and hours_per_workday <= 24),
  currency char(3) not null default 'USD',
  locale text not null default 'en'
    check (locale in ('en', 'nl')),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  provider text not null,
  icon_key text,
  category text not null,
  billing_cycle text not null
    check (billing_cycle in ('monthly', 'yearly', 'custom')),
  custom_period_months smallint
    check (
      custom_period_months is null
      or (custom_period_months >= 1 and custom_period_months <= 36)
    ),
  total_price numeric(14, 4) not null check (total_price > 0),
  currency char(3) not null default 'USD',
  shared boolean not null default false,
  share_count smallint
    check (share_count is null or (share_count >= 2 and share_count <= 50)),
  next_payment_date date not null,
  notes text,
  active boolean not null default true,
  review_flag boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_id_created_at_idx
  on public.subscriptions (user_id, created_at);

alter table public.user_preferences enable row level security;
alter table public.subscriptions enable row level security;

create policy "user_preferences_select_own"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "user_preferences_insert_own"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "user_preferences_update_own"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_preferences_delete_own"
  on public.user_preferences for delete
  using (auth.uid() = user_id);

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "subscriptions_update_own"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subscriptions_delete_own"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
