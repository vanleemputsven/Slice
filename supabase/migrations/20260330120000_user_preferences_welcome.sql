-- Optional display name + first-run welcome gate (complete or skip).

alter table public.user_preferences
  add column preferred_name text
    constraint user_preferences_preferred_name_len check (
      preferred_name is null
      or (
        length(trim(preferred_name)) >= 1
        and length(preferred_name) <= 80
      )
    );

alter table public.user_preferences
  add column welcome_completed_at timestamptz;

comment on column public.user_preferences.preferred_name is
  'Optional name for a personal tone in the app; never required.';
comment on column public.user_preferences.welcome_completed_at is
  'First-run welcome finished or skipped; null means redirect from protected routes.';

update public.user_preferences
set welcome_completed_at = coalesce(welcome_completed_at, now())
where welcome_completed_at is null;
