-- Administrative integration test, against the NEW project only.
-- All users, companies, clients and object metadata are synthetic and rolled back.
begin;
create temporary table results(label text primary key, passed boolean not null);
create temporary table fixtures(label text primary key, id uuid not null);
grant select,insert on results,fixtures to authenticated,anon;
insert into auth.users(id,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('11111111-1111-4111-8111-111111111111','owner-a@foundation.example',now(),'{}','{}',now(),now()),
('22222222-2222-4222-8222-222222222222','owner-b@foundation.example',now(),'{}','{}',now(),now()),
('33333333-3333-4333-8333-333333333333','consultant@foundation.example',now(),'{}','{}',now(),now()),
('44444444-4444-4444-8444-444444444444','finance@foundation.example',now(),'{}','{}',now(),now()),
('55555555-5555-4555-8555-555555555555','unconfirmed@foundation.example',null,'{}','{}',now(),now());
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
insert into fixtures values('a',public.create_company('Foundation A','foundation-test-a','KE','USD','en','Africa/Nairobi'));
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
insert into fixtures values('b',public.create_company('Foundation B','foundation-test-b','FR','EUR','fr','Europe/Paris'));
reset role;
insert into public.company_memberships(company_id,user_id,role)
select id,'33333333-3333-4333-8333-333333333333','consultant' from fixtures where label='a';
insert into public.company_memberships(company_id,user_id,role)
select id,'44444444-4444-4444-8444-444444444444','finance' from fixtures where label='a';
insert into public.company_clients(company_id,full_name,email)
select id,'Shared Traveler','same@foundation.example' from fixtures;
insert into storage.objects(bucket_id,name)
select 'company-documents',id::text||'/test.pdf' from fixtures;
insert into results values('all application tables enforce RLS',(select bool_and(relrowsecurity) from pg_class where oid in ('public.companies'::regclass,'public.company_memberships'::regclass,'public.company_clients'::regclass,'public.audit_events'::regclass)));
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
insert into results values('owner sees only its own company',(select count(*)=1 from public.companies));
insert into results values('same traveler email is separate in each company',(select count(*)=1 from public.company_clients where email='same@foundation.example'));
insert into results values('atomic create assigned the owner',(select role='owner' from public.company_memberships where user_id=auth.uid()));
insert into results values('owner sees only its own private object',(select count(*)=1 from storage.objects where bucket_id='company-documents'));
do $$ declare a uuid; b uuid; n int; begin
 select id into a from fixtures where label='a'; select id into b from fixtures where label='b';
 begin
  insert into public.company_clients(company_id,full_name) values(b,'Wrong Company');
  raise exception 'Cross-company client insert was allowed';
 exception when insufficient_privilege then insert into results values('cross-company client insert denied',true); end;
 update public.company_clients set notes='forbidden' where company_id=b;
 get diagnostics n=row_count; insert into results values('cross-company update changes zero records',n=0);
 delete from public.company_clients where company_id=b;
 get diagnostics n=row_count; insert into results values('cross-company delete changes zero records',n=0);
 begin
  insert into public.company_memberships(company_id,user_id,role) values(b,auth.uid(),'owner');
  raise exception 'Direct membership escalation was allowed';
 exception when insufficient_privilege then insert into results values('direct membership escalation denied',true); end;
 begin
  update public.company_clients set company_id=b where company_id=a;
  raise exception 'Client ownership reassignment was allowed';
 exception when insufficient_privilege then insert into results values('client ownership reassignment denied',true); end;
 begin
  insert into storage.objects(bucket_id,name) values('company-documents',b::text||'/forbidden.pdf');
  raise exception 'Cross-company storage upload was allowed';
 exception when insufficient_privilege then insert into results values('cross-company storage upload denied',true); end;
 insert into storage.objects(bucket_id,name) values('company-documents',a::text||'/own.pdf');
 insert into results values('own-company storage upload allowed',true);
 update public.companies set name='Foundation A updated' where id=a;
 get diagnostics n=row_count; insert into results values('owner may update own settings',n=1);
 begin
  update public.companies set time_zone='Invalid/Zone' where id=a;
  raise exception 'Invalid time zone was accepted';
 exception when invalid_parameter_value then insert into results values('database rejects invalid time zones',true); end;
 begin
  insert into public.company_clients(company_id,full_name,email) values(a,'Duplicate Traveler','SAME@foundation.example');
  raise exception 'Duplicate company email was accepted';
 exception when unique_violation then insert into results values('email uniqueness is case-insensitive per company',true); end;
 insert into results values('owner can view audit history',(select count(*)>0 from public.audit_events where company_id=a));
end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ declare a uuid; n int; begin
 select id into a from fixtures where label='a';
 update public.company_clients set notes='consultant change' where company_id=a;
 get diagnostics n=row_count; insert into results values('consultant may edit company clients',n=1);
 update public.companies set name='Consultant must not edit settings' where id=a;
 get diagnostics n=row_count; insert into results values('consultant cannot edit company settings',n=0);
 insert into results values('consultant has no audit access',(select count(*)=0 from public.audit_events));
end $$;
reset role;
update public.company_memberships set active=false where user_id='33333333-3333-4333-8333-333333333333';
set local role authenticated;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
insert into results values('revocation immediately removes company access',(select count(*)=0 from public.companies));
insert into results values('revocation immediately removes client access',(select count(*)=0 from public.company_clients));
insert into results values('revocation immediately removes file access',(select count(*)=0 from storage.objects where bucket_id='company-documents'));
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
insert into results values('finance has no blanket CRM access',(select count(*)=0 from public.company_clients));
do $$ declare n int; begin
 update public.companies set name='Finance must not edit settings';
 get diagnostics n=row_count; insert into results values('finance cannot edit company settings',n=0);
end $$;
select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
do $$ begin
 begin
  perform public.create_company('Unconfirmed','unconfirmed-test','KE','USD','en','UTC');
  raise exception 'Unconfirmed user created company';
 exception when insufficient_privilege then insert into results values('unconfirmed account cannot create company',true); end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin
  perform * from public.companies;
  raise exception 'Anonymous user read companies';
 exception when insufficient_privilege then insert into results values('anonymous company access denied',true); end;
 begin
  perform public.create_company('Anonymous','anonymous-test','KE','USD','en','UTC');
  raise exception 'Anonymous user created company';
 exception when insufficient_privilege then insert into results values('anonymous company creation denied',true); end;
end $$;
reset role;
delete from public.companies where id in (select id from fixtures);
insert into results values('company cascade deletion leaves no orphan audit events',(select count(*)=0 from public.audit_events where company_id in (select id from fixtures)));
do $$ begin
 if exists(select 1 from results where not passed) then raise exception 'One or more isolation assertions failed'; end if;
end $$;
select label,passed from results order by label;
rollback;
