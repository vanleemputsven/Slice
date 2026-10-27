# Sliding pill controls

## Why

Every exclusive choice in a pill shell (nav, language, sharing filter, auth tabs) should feel the same: the highlight **slides** to the new option instead of popping on/off. One motion language makes the product feel considered.

## Shared component

`src/components/ui/segmented-control.tsx` owns:

- **SegmentedControl** — button groups with a measured sliding pill
- **SegmentedNav** — same pill for route links
- **ToggleChip** — on/off filters (Due soon, Needs review) with a matching fade/scale pill

Easing is a strong ease-out (~200ms). Reduced-motion users get no position animation.
