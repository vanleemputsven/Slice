# Renewal horizon

## Why this is the first expansion

Slice already answers "what does a month of subscriptions cost in workdays?" People open a tracker again when money is about to leave. The renewal horizon is that reason: every active subscription whose next charge falls today through the next 14 days, shown as the personal share of the cycle price.

Fourteen days is long enough to cancel or to move money, and short enough that the list stays the thing you came for. A charge inside the reminder lead is marked in the app. The lead is stored on the person's preferences. The default is three days, including the due date. Zero marks only the due date. There is no outbound email yet: this environment has no mail provider.

## What this is not

Bank import stays a later decision. It needs a regulated provider, consent, and a cost the product does not have yet. The horizon works from dates the person already entered.

A custom reminder lead is stored on `user_preferences.reminder_lead_days` (0–14, default 3). The project-scoped Supabase MCP is pinned to this project in `.cursor/mcp.json`.

The first charge is added from the horizon, with the same form as the subscriptions page. An empty dashboard stays on that list and the wage field. Charts and zero totals appear after the first row exists.

The form's default due date is the local calendar day (`formatCalendarDate`). `Date.toISOString().slice(0, 10)` is the UTC day, so late evening in Europe was stored as tomorrow.

A row on the horizon opens the same edit form. **Charged** stores the following cycle date (`nextCycleDate`) so that charge leaves this window. The monthly share does not change. The landing scan's last step is a real first list, described in `docs/first-list.md`.

## Seams under test

`listRenewalHorizon` is the public boundary. Tests lock the charge amount, the 14-day window, the shared split, inactive subscriptions, a past anchor that rolls forward, and the three-day mark. They do not open the database. Monthly share and work time stay separate functions with their own examples, so a yearly charge cannot be confused with a month of work.
