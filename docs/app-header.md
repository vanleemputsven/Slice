# App header layout

## Why

Primary navigation belongs next to the brand, not clustered with language/sign-out. That matches how people scan an app chrome: identity → where am I → utilities.

## Structure

1. **Logo** (left)
2. **Main nav** (immediately after logo) — Overview / Subscriptions / Settings
3. **Utilities** (trailing edge) — greeting (large screens), language, sign out

On small screens the nav drops to a full-width second row so touch targets stay comfortable; logo and utilities stay on the first row.

## Interaction

Nav uses the shared `SegmentedNav` sliding pill (see `docs/segmented-control.md`). Same motion as language toggle and list filters.
