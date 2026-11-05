-- Incremental migration. Run AFTER 001_cases.sql. No existing case is deleted.
begin;
alter table public.cases
 add column acceptance text not null default 'pending' check (acceptance in ('pending','accepted','declined')),
 add column acceptance_date date,
 add column acceptance_source text not null default '' check (char_length(acceptance_source)<=100),
 add column version integer not null default 1,
 add constraint acceptance_evidence check (acceptance='pending' or (acceptance_date is not null and length(btrim(acceptance_source))>0));

create table public.case_history (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.cases(id),
 owner_id uuid not null references auth.users(id),
 version integer not null,
 snapshot jsonb not null,
 recorded_at timestamptz not null default now(),
 unique(case_id,version)
);
create table public.case_events (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.cases(id),
 owner_id uuid not null references auth.users(id),
 event_type text not null check(event_type in ('case_opened','acceptance_recorded','next_action_updated','technician_report_recorded','family_response_recorded','verification_saved_pending','verification_blocked','repair_verified')),
 reason text not null default '' check(reason in ('','missing_confirmation','contradictory_reports','incomplete_evidence')),
 created_at timestamptz not null default now()
);
alter table public.case_history enable row level security;
alter table public.case_events enable row level security;
revoke all on public.case_history,public.case_events from anon,authenticated;
grant select on public.case_history,public.case_events to authenticated;
grant insert (case_id,owner_id,event_type,reason) on public.case_events to authenticated;
create policy own_history_read on public.case_history for select to authenticated using ((select auth.uid())=owner_id);
create policy own_events_read on public.case_events for select to authenticated using ((select auth.uid())=owner_id);
create policy own_interaction_events on public.case_events for insert to authenticated with check (
 (select auth.uid())=owner_id and event_type in ('case_opened','verification_blocked') and
 exists(select 1 from public.cases c where c.id=case_id and c.owner_id=(select auth.uid()))
);
create index history_case_owner on public.case_history(owner_id,case_id,version);
create index events_case_owner on public.case_events(owner_id,case_id,created_at);

create or replace function public.validate_case_update() returns trigger language plpgsql set search_path=public as $$
begin
 if TG_OP='UPDATE' then
   if new.owner_id<>old.owner_id or new.id<>old.id then raise exception 'Case ownership and id cannot change'; end if;
   new.created_at:=old.created_at;
   new.version:=old.version+1;
 else
   new.version:=1;
 end if;
 if new.repair_date>current_date or new.check_date>current_date or new.household_date>current_date or new.acceptance_date>current_date then
   raise exception 'Evidence cannot be future dated';
 end if;
 new.updated_at:=now();
 return new;
end; $$;

-- Trigger writes are in the same transaction as the case change.
-- Clients cannot create, alter or delete successful-change history/events.
create function public.audit_case_change() returns trigger language plpgsql security definer set search_path=public as $$
declare e text;
begin
 insert into public.case_history(case_id,owner_id,version,snapshot) values(new.id,new.owner_id,new.version,to_jsonb(new));
 foreach e in array array[
   case when TG_OP='INSERT' or row(new.acceptance,new.acceptance_date,new.acceptance_source) is distinct from row(old.acceptance,old.acceptance_date,old.acceptance_source) then 'acceptance_recorded' end,
   case when TG_OP='INSERT' or row(new.next_action,new.follow_up) is distinct from row(old.next_action,old.follow_up) then 'next_action_updated' end,
   case when (TG_OP='INSERT' and new.repair_note<>'') or (TG_OP='UPDATE' and row(new.repair_note,new.repair_date) is distinct from row(old.repair_note,old.repair_date)) then 'technician_report_recorded' end,
   case when (TG_OP='INSERT' and new.household_result<>'pending') or (TG_OP='UPDATE' and row(new.household_result,new.household_date,new.household_channel,new.reopen_reason) is distinct from row(old.household_result,old.household_date,old.household_channel,old.reopen_reason)) then 'family_response_recorded' end,
   case when new.status='verified' then 'repair_verified' else 'verification_saved_pending' end
 ] loop
   if e is not null then insert into public.case_events(case_id,owner_id,event_type) values(new.id,new.owner_id,e); end if;
 end loop;
 return new;
end; $$;
revoke all on function public.audit_case_change() from public;
-- Preserve a baseline of existing records before new edits happen.
insert into public.case_history(case_id,owner_id,version,snapshot) select id,owner_id,version,to_jsonb(c) from public.cases c;
create trigger audit_case_write after insert or update on public.cases for each row execute function public.audit_case_change();
commit;
