create index audit_actor_user on public.audit_events(actor_user_id);
create index memberships_user on public.company_memberships(user_id);
