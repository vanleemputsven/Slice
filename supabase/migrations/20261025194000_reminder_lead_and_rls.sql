-- Reminder lead, plus two advisor fixes for the database that already
-- ran the earlier migrations by hand: hide the signup trigger from the
-- Data API, and evaluate auth.uid() once per statement.

alter table public.user_preferences
  add column reminder_lead_days smallint not null default 3
  constraint user_preferences_reminder_lead_days_range
  check (reminder_lead_days >= 0 and reminder_lead_days <= 14);

comment on column public.user_preferences.reminder_lead_days is
  'Days before a charge, including the due date, that Slice marks it. 0 marks only the due date.';

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
  on public.user_preferences for select
  using ((select auth.uid()) = user_id);

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
  on public.user_preferences for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
  on public.user_preferences for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "user_preferences_delete_own" on public.user_preferences;
create policy "user_preferences_delete_own"
  on public.user_preferences for delete
  using ((select auth.uid()) = user_id);

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using ((select auth.uid()) = user_id);

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own"
  on public.subscriptions for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "subscriptions_delete_own" on public.subscriptions;
create policy "subscriptions_delete_own"
  on public.subscriptions for delete
  using ((select auth.uid()) = user_id);
