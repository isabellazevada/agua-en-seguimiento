begin;

create table if not exists public.pricing_scenarios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  inputs jsonb not null check (jsonb_typeof(inputs) = 'object' and octet_length(inputs::text) <= 4096),
  results jsonb not null check (jsonb_typeof(results) = 'object' and octet_length(results::text) <= 4096),
  calculation_version integer not null check (calculation_version >= 1),
  created_at timestamptz not null default now(),
  unique (id, owner_id)
);

create table if not exists public.pricing_decisions (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null,
  owner_id uuid not null,
  kind text not null check (kind in ('quote', 'approval', 'payment', 'renewal')),
  date date not null,
  source text not null check (source in ('simulated', 'whatsapp', 'email', 'meeting', 'receipt')),
  foreign key (scenario_id, owner_id)
    references public.pricing_scenarios(id, owner_id) on delete cascade,
  unique (scenario_id, kind, date, source)
);

create index if not exists pricing_scenarios_owner_created_idx
  on public.pricing_scenarios(owner_id, created_at desc);
create index if not exists pricing_decisions_owner_idx
  on public.pricing_decisions(owner_id);

alter table public.pricing_scenarios enable row level security;
alter table public.pricing_decisions enable row level security;
revoke all on public.pricing_scenarios, public.pricing_decisions from public, anon, authenticated;
grant select, insert on public.pricing_scenarios, public.pricing_decisions to authenticated;

drop policy if exists pricing_scenarios_read on public.pricing_scenarios;
create policy pricing_scenarios_read on public.pricing_scenarios for select to authenticated
  using ((select auth.uid()) = owner_id);
drop policy if exists pricing_scenarios_insert on public.pricing_scenarios;
create policy pricing_scenarios_insert on public.pricing_scenarios for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists pricing_decisions_read on public.pricing_decisions;
create policy pricing_decisions_read on public.pricing_decisions for select to authenticated
  using ((select auth.uid()) = owner_id);
drop policy if exists pricing_decisions_insert on public.pricing_decisions;
create policy pricing_decisions_insert on public.pricing_decisions for insert to authenticated
  with check ((select auth.uid()) = owner_id);

commit;
