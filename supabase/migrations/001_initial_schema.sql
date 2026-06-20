-- Initial schema: sessions, gaps, results
-- Run in Supabase SQL Editor or via `supabase db push`

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  concept_tested text not null,
  created_at timestamptz not null default now()
);

create table public.gaps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  initial_explanation text not null,
  memorized_label text not null,
  follow_up_question text not null,
  created_at timestamptz not null default now()
);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  gap_id uuid not null references public.gaps (id) on delete cascade,
  second_attempt text not null,
  is_gap_closed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (foreign-key lookups for RLS and joins)
-- ---------------------------------------------------------------------------

create index sessions_user_id_idx on public.sessions (user_id);
create index gaps_session_id_idx on public.gaps (session_id);
create index results_gap_id_idx on public.results (gap_id);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

alter table public.sessions enable row level security;
alter table public.gaps enable row level security;
alter table public.results enable row level security;

-- sessions: direct ownership via user_id
-- ---------------------------------------------------------------------------

create policy "sessions_select_own"
  on public.sessions
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "sessions_insert_own"
  on public.sessions
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "sessions_update_own"
  on public.sessions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "sessions_delete_own"
  on public.sessions
  for delete
  to authenticated
  using (user_id = auth.uid());

-- gaps: ownership verified through sessions
-- ---------------------------------------------------------------------------

create policy "gaps_select_own"
  on public.gaps
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.sessions
      where sessions.id = gaps.session_id
        and sessions.user_id = auth.uid()
    )
  );

create policy "gaps_insert_own"
  on public.gaps
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.sessions
      where sessions.id = gaps.session_id
        and sessions.user_id = auth.uid()
    )
  );

create policy "gaps_update_own"
  on public.gaps
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.sessions
      where sessions.id = gaps.session_id
        and sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.sessions
      where sessions.id = gaps.session_id
        and sessions.user_id = auth.uid()
    )
  );

create policy "gaps_delete_own"
  on public.gaps
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.sessions
      where sessions.id = gaps.session_id
        and sessions.user_id = auth.uid()
    )
  );

-- results: ownership verified through gaps -> sessions (gap_id is load-bearing FK)
-- ---------------------------------------------------------------------------

create policy "results_select_own"
  on public.results
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.gaps
      inner join public.sessions on sessions.id = gaps.session_id
      where gaps.id = results.gap_id
        and sessions.user_id = auth.uid()
    )
  );

create policy "results_insert_own"
  on public.results
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.gaps
      inner join public.sessions on sessions.id = gaps.session_id
      where gaps.id = results.gap_id
        and sessions.user_id = auth.uid()
    )
  );

create policy "results_update_own"
  on public.results
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.gaps
      inner join public.sessions on sessions.id = gaps.session_id
      where gaps.id = results.gap_id
        and sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.gaps
      inner join public.sessions on sessions.id = gaps.session_id
      where gaps.id = results.gap_id
        and sessions.user_id = auth.uid()
    )
  );

create policy "results_delete_own"
  on public.results
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.gaps
      inner join public.sessions on sessions.id = gaps.session_id
      where gaps.id = results.gap_id
        and sessions.user_id = auth.uid()
    )
  );
