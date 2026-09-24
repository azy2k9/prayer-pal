create table if not exists public.prayer_day_contexts (
  user_id uuid not null references auth.users (id) on delete cascade,
  prayer_date date not null,
  time_zone text not null,
  location jsonb not null,
  timing_configuration jsonb not null,
  timing_configuration_version text not null,
  primary key (user_id, prayer_date)
);

alter table public.prayer_day_contexts enable row level security;

create policy "Users can read their own prayer day contexts"
  on public.prayer_day_contexts for select using (auth.uid() = user_id);
create policy "Users can create their own prayer day contexts"
  on public.prayer_day_contexts for insert with check (auth.uid() = user_id);
create policy "Users can update their own prayer day contexts"
  on public.prayer_day_contexts for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.prayer_outcomes (
  user_id uuid not null references auth.users (id) on delete cascade,
  prayer_date date not null,
  prayer text not null check (prayer in ('Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Jumuah')),
  outcome text not null check (outcome in ('completed', 'not-completed', 'qada')),
  recorded_at timestamptz not null,
  device_time_zone text not null,
  location jsonb not null,
  timing_configuration jsonb not null,
  timing_configuration_version text not null,
  primary key (user_id, prayer_date, prayer),
  check (prayer <> 'Jumuah' or outcome <> 'qada')
);

alter table public.prayer_outcomes enable row level security;

create policy "Users can read their own prayer outcomes"
  on public.prayer_outcomes for select using (auth.uid() = user_id);
create policy "Users can create their own prayer outcomes"
  on public.prayer_outcomes for insert with check (auth.uid() = user_id);
create policy "Users can update their own prayer outcomes"
  on public.prayer_outcomes for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
