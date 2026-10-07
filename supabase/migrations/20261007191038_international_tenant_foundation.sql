-- Fresh-project foundation. No dependencies on the original operator database.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$'),
  name text not null check (char_length(name) between 2 and 120),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  base_currency text not null check (base_currency ~ '^[A-Z]{3}$'),
  default_locale text not null default 'en' check (default_locale ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
  time_zone text not null default 'UTC',
  created_at timestamptz not null default now()
);
create table public.company_memberships (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','consultant','finance')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (company_id,user_id)
);
create index memberships_user_company on public.company_memberships(user_id,company_id) where active;
create table public.company_clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 160),
  email text check (email is null or (char_length(email)<=254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  phone text check (phone is null or phone ~ '^\+[1-9][0-9 ()-]{5,24}$'),
  notes text not null default '' check (char_length(notes)<=4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id,id)
);
create unique index clients_company_email on public.company_clients(company_id,lower(email)) where email is not null;
create index clients_company_created on public.company_clients(company_id,created_at desc);
create table public.audit_events (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now()
);
create index audit_company_created on public.audit_events(company_id,created_at desc);

-- Deliberate privilege boundary: avoids recursive membership RLS, using the
-- verified database JWT identity and live membership, never user_metadata.
create function private.company_role(target_company uuid) returns text
language sql stable security definer set search_path = '' as $$
  select m.role from public.company_memberships m
  where auth.uid() is not null and m.company_id=target_company
    and m.user_id=auth.uid() and m.active;
$$;
revoke all on function private.company_role(uuid) from public,anon;
grant execute on function private.company_role(uuid) to authenticated;

alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;
alter table public.company_clients enable row level security;
alter table public.audit_events enable row level security;
revoke all on public.companies,public.company_memberships,public.company_clients,public.audit_events from anon,authenticated;
grant select on public.companies,public.company_memberships,public.audit_events to authenticated;
grant update(name,country_code,base_currency,default_locale,time_zone) on public.companies to authenticated;
grant select,insert,delete on public.company_clients to authenticated;
grant update(full_name,email,phone,notes) on public.company_clients to authenticated;

create policy company_read on public.companies for select to authenticated using (private.company_role(id) is not null);
create policy company_edit on public.companies for update to authenticated using (private.company_role(id) in ('owner','admin')) with check (private.company_role(id) in ('owner','admin'));
create policy membership_read on public.company_memberships for select to authenticated using (private.company_role(company_id) is not null);
create policy client_read on public.company_clients for select to authenticated using (private.company_role(company_id) in ('owner','admin','consultant'));
create policy client_create on public.company_clients for insert to authenticated with check (private.company_role(company_id) in ('owner','admin','consultant'));
create policy client_edit on public.company_clients for update to authenticated using (private.company_role(company_id) in ('owner','admin','consultant')) with check (private.company_role(company_id) in ('owner','admin','consultant'));
create policy client_delete on public.company_clients for delete to authenticated using (private.company_role(company_id) in ('owner','admin','consultant'));
create policy audit_read on public.audit_events for select to authenticated using (private.company_role(company_id) in ('owner','admin'));

create function private.validate_company_zone() returns trigger language plpgsql set search_path='' as $$
begin
  if not exists(select 1 from pg_catalog.pg_timezone_names where name=new.time_zone) then
    raise exception 'Invalid time zone' using errcode='22023';
  end if;
  return new;
end;
$$;
revoke all on function private.validate_company_zone() from public,anon,authenticated;
create trigger company_zone before insert or update on public.companies for each row execute function private.validate_company_zone();

create function private.client_updated() returns trigger language plpgsql set search_path='' as $$
begin
  if new.company_id<>old.company_id or new.id<>old.id then
    raise exception 'Client ownership is immutable' using errcode='42501';
  end if;
  new.updated_at=now();
  return new;
end;
$$;
revoke all on function private.client_updated() from public,anon,authenticated;
create trigger client_updated before update on public.company_clients for each row execute function private.client_updated();

create function private.audit_change() returns trigger language plpgsql security definer set search_path='' as $$
declare tenant uuid; entity uuid;
begin
  if tg_table_name='companies' then tenant=coalesce(new.id,old.id); entity=tenant;
  else tenant=coalesce(new.company_id,old.company_id); entity=coalesce(new.id,old.id); end if;
  insert into public.audit_events(company_id,actor_user_id,action,entity_id)
  values(tenant,auth.uid(),tg_table_name||'.'||lower(tg_op),entity);
  return coalesce(new,old);
end;
$$;
revoke all on function private.audit_change() from public,anon,authenticated;
create trigger company_audit after insert or update on public.companies for each row execute function private.audit_change();
create trigger client_audit after insert or update or delete on public.company_clients for each row execute function private.audit_change();

-- Atomic creation is the only initial membership write path. The public RPC
-- is an invoker wrapper; the implementation lives in an unexposed schema.
create function private.create_company(company_name text,company_slug text,country text,currency text,locale text,zone text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid=auth.uid(); result uuid;
begin
  if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if not exists(select 1 from auth.users where id=actor and email_confirmed_at is not null) then
    raise exception 'Confirmed email required' using errcode='42501';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text,0));
  if (select count(*) from public.company_memberships where user_id=actor and role='owner' and active)>=10 then
    raise exception 'Workspace creation limit reached' using errcode='42501';
  end if;
  insert into public.companies(name,slug,country_code,base_currency,default_locale,time_zone)
  values(company_name,company_slug,country,currency,locale,zone) returning id into result;
  insert into public.company_memberships(company_id,user_id,role) values(result,actor,'owner');
  return result;
end;
$$;
revoke all on function private.create_company(text,text,text,text,text,text) from public,anon;
grant execute on function private.create_company(text,text,text,text,text,text) to authenticated;
create function public.create_company(company_name text,company_slug text,country text,currency text,locale text,zone text)
returns uuid language sql security invoker set search_path='' as $$
  select private.create_company(company_name,company_slug,country,currency,locale,zone);
$$;
revoke all on function public.create_company(text,text,text,text,text,text) from public,anon;
grant execute on function public.create_company(text,text,text,text,text,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('company-documents','company-documents',false,10485760,array['application/pdf','image/jpeg','image/png']);
create function private.storage_company(path text) returns uuid language sql immutable security invoker set search_path='' as $$
  select case when split_part(path,'/',1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then split_part(path,'/',1)::uuid else null end;
$$;
revoke all on function private.storage_company(text) from public,anon;
grant execute on function private.storage_company(text) to authenticated;
create policy company_file_read on storage.objects for select to authenticated using (bucket_id='company-documents' and private.company_role(private.storage_company(name)) in ('owner','admin','consultant'));
create policy company_file_create on storage.objects for insert to authenticated with check (bucket_id='company-documents' and private.company_role(private.storage_company(name)) in ('owner','admin','consultant'));
create policy company_file_delete on storage.objects for delete to authenticated using (bucket_id='company-documents' and private.company_role(private.storage_company(name)) in ('owner','admin'));
-- Replacement/rename is deliberately unavailable in the foundation. Upload a
-- new object instead; granular booking/traveler document grants come later.
