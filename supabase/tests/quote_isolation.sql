-- Administrative test against the NEW pilot project; all fixtures roll back.
begin;
create temporary table results(label text primary key,passed boolean not null);
grant select,insert on results to authenticated,anon;
insert into auth.users(id,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('11111111-1111-4111-8111-111111111111','quote-owner-a@foundation.example',now(),'{}','{}',now(),now()),
('22222222-2222-4222-8222-222222222222','quote-owner-b@foundation.example',now(),'{}','{}',now(),now()),
('33333333-3333-4333-8333-333333333333','quote-consultant@foundation.example',now(),'{}','{}',now(),now()),
('44444444-4444-4444-8444-444444444444','quote-finance@foundation.example',now(),'{}','{}',now(),now());
insert into public.companies(id,slug,name,country_code,base_currency,time_zone) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','quote-test-a','Quote A','KE','EUR','UTC'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','quote-test-b','Quote B','FR','EUR','UTC');
insert into public.company_memberships(company_id,user_id,role) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','owner'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','owner'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','33333333-3333-4333-8333-333333333333','consultant'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','44444444-4444-4444-8444-444444444444','finance');
insert into public.company_clients(id,company_id,full_name) values
('cccccccc-cccc-4ccc-8ccc-cccccccccccc','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Traveler A'),
('dddddddd-dddd-4ddd-8ddd-dddddddddddd','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Traveler B');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
insert into public.company_quote_drafts(id,company_id,client_id,title,currency,start_date,end_date,travelers,days,lines) values
('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','cccccccc-cccc-4ccc-8ccc-cccccccccccc','Safari draft','EUR','2026-11-01','2026-11-01',2,'[{"title":"Arrival","description":"Meet guide"}]','[{"description":"Private safari","quantity":3,"unitMinor":101}]');
insert into results values('database computes integer total',(select total_minor=303 from public.company_quote_drafts));
insert into results values('quote writes create audited metadata',(select count(*)=1 from public.audit_events where action='company_quote_drafts.insert'));
do $$ declare n int; begin
  begin
    update public.company_quote_drafts set client_id='dddddddd-dddd-4ddd-8ddd-dddddddddddd',revision=2;
    raise exception 'Cross-company client attached';
  exception when foreign_key_violation then insert into results values('cross-company relation rejected',true); end;
  begin
    update public.company_quote_drafts set company_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    raise exception 'Ownership changed';
  exception when insufficient_privilege then insert into results values('ownership reassignment denied',true); end;
  begin
    update public.company_quote_drafts set total_minor=900;
    raise exception 'Total overwritten';
  exception when insufficient_privilege or sqlstate '428C9' then insert into results values('derived total cannot be overwritten',true); end;
  begin
    update public.company_quote_drafts set lines='[{"description":"Malformed","quantity":1.5,"unitMinor":100}]',revision=2;
    raise exception 'Fractional quantity accepted';
  exception when invalid_parameter_value then insert into results values('invalid money line blocked',true); end;
  begin
    update public.company_quote_drafts set lines='[{"description":"Safari","quantity":1,"unitMinor":0}]',revision=2;
    raise exception 'Zero selling quote accepted';
  exception when invalid_parameter_value then insert into results values('unpriced quote blocked',true); end;
  begin
    update public.company_quote_drafts set end_date='2026-11-02',revision=2;
    raise exception 'Missing itinerary day accepted';
  exception when invalid_parameter_value then insert into results values('date itinerary mismatch blocked',true); end;
  begin
    update public.company_quote_drafts set title='Stale edit',revision=1;
    raise exception 'Stale revision accepted';
  exception when serialization_failure then insert into results values('revision increment enforced',true); end;
  update public.company_quote_drafts set title='Updated draft',revision=2 where revision=1;
  get diagnostics n=row_count; insert into results values('valid edit advances one revision',n=1);
  update public.company_quote_drafts set title='Stale edit',revision=2 where revision=1;
  get diagnostics n=row_count; insert into results values('optimistic update does not overwrite latest revision',n=0);
  begin
    delete from public.company_quote_drafts;
    raise exception 'Draft deleted without grant';
  exception when insufficient_privilege then insert into results values('deletion unavailable until explicit lifecycle',true); end;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
insert into results values('other company cannot read quote',(select count(*)=0 from public.company_quote_drafts));
do $$ declare n int; begin
  update public.company_quote_drafts set title='Other company attack',revision=3 where id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
  get diagnostics n=row_count; insert into results values('other company cannot edit quote',n=0);
  begin
    insert into public.company_quote_drafts(company_id,client_id,title,currency,start_date,end_date,travelers,days,lines) values
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','cccccccc-cccc-4ccc-8ccc-cccccccccccc','Forbidden','EUR','2026-11-01','2026-11-01',2,'[{"title":"Arrival","description":""}]','[{"description":"Safari","quantity":1,"unitMinor":100}]');
    raise exception 'Other company inserted quote';
  exception when insufficient_privilege then insert into results values('other company cannot create quote',true); end;
end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
insert into results values('consultant sees own company quote',(select count(*)=1 from public.company_quote_drafts));
update public.company_quote_drafts set title='Consultant edit',revision=3;
insert into results values('consultant may edit private draft',(select revision=3 from public.company_quote_drafts));
reset role;
update public.company_memberships set active=false where user_id='33333333-3333-4333-8333-333333333333';
set local role authenticated;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
insert into results values('revocation immediately removes quote access',(select count(*)=0 from public.company_quote_drafts));
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
insert into results values('finance has no blanket private quote access',(select count(*)=0 from public.company_quote_drafts));
do $$ declare n int; begin
 update public.company_quote_drafts set title='Finance edit',revision=4;
 get diagnostics n=row_count; insert into results values('finance cannot edit quote',n=0);
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin perform * from public.company_quote_drafts; raise exception 'Anonymous quote read';
 exception when insufficient_privilege then insert into results values('anonymous quote access denied',true); end;
end $$;
reset role;
insert into results values('quote table enforces RLS',(select relrowsecurity from pg_class where oid='public.company_quote_drafts'::regclass));
delete from public.companies where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
insert into results values('company removal cascades quote data',(select count(*)=0 from public.company_quote_drafts));
do $$ begin if exists(select 1 from results where not passed) then raise exception 'Quote assertion failed'; end if; end $$;
select label,passed from results order by label;
rollback;
