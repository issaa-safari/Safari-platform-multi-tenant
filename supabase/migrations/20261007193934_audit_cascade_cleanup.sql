create or replace function private.audit_change() returns trigger language plpgsql security definer set search_path='' as $$
declare tenant uuid; entity uuid;
begin
  if tg_table_name='companies' then tenant=coalesce(new.id,old.id); entity=tenant;
  else tenant=coalesce(new.company_id,old.company_id); entity=coalesce(new.id,old.id); end if;
  -- The company row is already gone during ON DELETE CASCADE. Its audit
  -- history is also being purged, so do not create an orphan audit event.
  if tg_op='DELETE' and not exists(select 1 from public.companies where id=tenant) then return old; end if;
  insert into public.audit_events(company_id,actor_user_id,action,entity_id)
  values(tenant,auth.uid(),tg_table_name||'.'||lower(tg_op),entity);
  return coalesce(new,old);
end;
$$;
revoke all on function private.audit_change() from public,anon,authenticated;
