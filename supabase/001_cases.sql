-- Execute once in a new Supabase project's SQL Editor.
begin;
create table public.cases (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 code text not null check(char_length(btrim(code)) between 1 and 30),
 description text not null check(char_length(btrim(description)) between 1 and 500),
 responsible text not null check(char_length(btrim(responsible)) between 1 and 100),
 next_action text not null default '' check(char_length(next_action)<=250),
 follow_up date,
 repair_note text not null default '' check(char_length(repair_note)<=1000),
 repair_date date,
 check_person text not null default '' check(char_length(check_person)<=100),
 check_date date,
 check_method text not null default '' check(char_length(check_method)<=1000),
 check_result text not null default 'pending' check(check_result in ('pending','passed','failed','inconclusive')),
 supply_suitable boolean not null default false,
 household_result text not null default 'pending' check(household_result in ('pending','confirmed','continued','unreachable')),
 household_date date,
 household_channel text not null default '' check(char_length(household_channel)<=100),
 reopen_reason text not null default '' check(char_length(reopen_reason)<=1000),
 status text not null default 'reported' check(status in ('reported','repair_pending','verification_pending','verified','referred','reopened')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(owner_id,code),
 constraint active_next_action check(status='verified' or (length(btrim(next_action))>0 and follow_up is not null)),
 constraint closure_evidence check(status<>'verified' or (
 length(btrim(repair_note))>0 and repair_date is not null and
 length(btrim(check_person))>0 and check_date is not null and
 length(btrim(check_method))>0 and check_result='passed' and supply_suitable=true and
 household_result='confirmed' and household_date is not null and length(btrim(household_channel))>0)),
 constraint continued_loss check(household_result<>'continued' or (status='reopened' and length(btrim(reopen_reason))>0)),
 constraint check_after_repair check(check_date is null or repair_date is null or check_date>=repair_date),
 constraint confirmation_after_repair check(household_date is null or repair_date is null or household_date>=repair_date)
);
alter table public.cases enable row level security;
revoke all on public.cases from anon;
grant select,insert,update on public.cases to authenticated;
revoke delete on public.cases from authenticated;
create policy own_cases_select on public.cases for select to authenticated using ((select auth.uid())=owner_id);
create policy own_cases_insert on public.cases for insert to authenticated with check ((select auth.uid())=owner_id);
create policy own_cases_update on public.cases for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create or replace function public.validate_case_update() returns trigger language plpgsql set search_path=public as $$
begin
 if TG_OP='UPDATE' then
   if new.owner_id<>old.owner_id or new.id<>old.id then raise exception 'Case ownership and id cannot change'; end if;
   new.created_at:=old.created_at;
 end if;
 if new.repair_date>current_date or new.check_date>current_date or new.household_date>current_date then raise exception 'Evidence cannot be future dated'; end if;
 new.updated_at:=now();
 return new;
end; $$;
create trigger validate_case_write before insert or update on public.cases for each row execute function public.validate_case_update();
create index cases_owner_followup on public.cases(owner_id,follow_up);
commit;
