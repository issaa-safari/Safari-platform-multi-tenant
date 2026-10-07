-- Adapt the original request -> day-by-day quote workflow to tenant-bound drafts.
-- No proposal delivery, traveler tokens, supplier costs or acceptance in this slice.
create function private.quote_selling_total(lines jsonb) returns bigint
language plpgsql immutable set search_path='' as $$
declare item jsonb; total numeric=0; quantity numeric; amount numeric;
begin
  if jsonb_typeof(lines) is distinct from 'array' or jsonb_array_length(lines) not between 1 and 100 then
    raise exception 'Invalid quote lines' using errcode='22023';
  end if;
  for item in select value from jsonb_array_elements(lines) loop
    if jsonb_typeof(item) is distinct from 'object' or jsonb_typeof(item->'description') is distinct from 'string'
      or char_length(btrim(item->>'description')) not between 2 and 240
      or jsonb_typeof(item->'quantity') is distinct from 'number' or jsonb_typeof(item->'unitMinor') is distinct from 'number'
      or (select count(*) from jsonb_object_keys(item))<>3 then
      raise exception 'Invalid quote line' using errcode='22023';
    end if;
    quantity=(item->>'quantity')::numeric; amount=(item->>'unitMinor')::numeric;
    if quantity<>trunc(quantity) or quantity not between 1 and 1000 or amount<>trunc(amount) or amount not between 0 and 1000000000000 then
      raise exception 'Invalid quote money' using errcode='22023';
    end if;
    total=total+quantity*amount;
  end loop;
  if total not between 1 and 1000000000000 then raise exception 'Invalid selling total' using errcode='22023'; end if;
  return total::bigint;
end;
$$;
revoke all on function private.quote_selling_total(jsonb) from public,anon;
grant execute on function private.quote_selling_total(jsonb) to authenticated;

create table public.company_quote_drafts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id uuid not null,
  title text not null check(char_length(btrim(title)) between 2 and 160),
  currency text not null check(currency in ('USD','EUR','GBP','KES','TZS','ZAR','CAD','AUD','JPY','CHF','KWD','BHD','OMR','INR','AED','UGX','RWF')),
  start_date date not null check(start_date between date '1900-01-01' and date '9999-01-01'),
  end_date date not null,
  travelers integer not null check(travelers between 1 and 1000),
  days jsonb not null,
  lines jsonb not null,
  inclusions text not null default '' check(char_length(inclusions)<=4000),
  exclusions text not null default '' check(char_length(exclusions)<=4000),
  total_minor bigint generated always as (private.quote_selling_total(lines)) stored,
  revision integer not null default 1 check(revision>=1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id,id),
  foreign key(company_id,client_id) references public.company_clients(company_id,id),
  check(end_date-start_date between 0 and 59)
);
create index quote_drafts_company_created on public.company_quote_drafts(company_id,created_at desc);
create index quote_drafts_company_client on public.company_quote_drafts(company_id,client_id);
alter table public.company_quote_drafts enable row level security;
revoke all on public.company_quote_drafts from anon,authenticated;
grant select on public.company_quote_drafts to authenticated;
grant insert(id,company_id,client_id,title,currency,start_date,end_date,travelers,days,lines,inclusions,exclusions) on public.company_quote_drafts to authenticated;
grant update(client_id,title,currency,start_date,end_date,travelers,days,lines,inclusions,exclusions,revision) on public.company_quote_drafts to authenticated;
create policy quote_draft_read on public.company_quote_drafts for select to authenticated using(private.company_role(company_id) in ('owner','admin','consultant'));
create policy quote_draft_create on public.company_quote_drafts for insert to authenticated with check(private.company_role(company_id) in ('owner','admin','consultant'));
create policy quote_draft_edit on public.company_quote_drafts for update to authenticated using(private.company_role(company_id) in ('owner','admin','consultant')) with check(private.company_role(company_id) in ('owner','admin','consultant'));
create function private.validate_quote_draft() returns trigger language plpgsql set search_path='' as $$
declare item jsonb;
begin
  if tg_op='UPDATE' then
    if new.company_id<>old.company_id or new.id<>old.id or new.created_at<>old.created_at or new.revision<>old.revision+1 then
      raise exception 'Invalid draft revision' using errcode='40001';
    end if;
    new.updated_at=now();
  end if;
  if jsonb_typeof(new.days) is distinct from 'array' then raise exception 'Invalid itinerary' using errcode='22023'; end if;
  if jsonb_array_length(new.days)<>new.end_date-new.start_date+1 then raise exception 'One itinerary day per trip date required' using errcode='22023'; end if;
  for item in select value from jsonb_array_elements(new.days) loop
    if jsonb_typeof(item) is distinct from 'object' or jsonb_typeof(item->'title') is distinct from 'string'
      or jsonb_typeof(item->'description') is distinct from 'string' or char_length(btrim(item->>'title')) not between 2 and 160
      or char_length(item->>'description')>4000 or (select count(*) from jsonb_object_keys(item))<>2 then
      raise exception 'Invalid itinerary day' using errcode='22023';
    end if;
  end loop;
  return new;
end;
$$;
revoke all on function private.validate_quote_draft() from public,anon,authenticated;
create trigger quote_draft_validate before insert or update on public.company_quote_drafts for each row execute function private.validate_quote_draft();
create trigger quote_draft_audit after insert or update on public.company_quote_drafts for each row execute function private.audit_change();
