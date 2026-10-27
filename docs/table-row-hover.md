# Table row hover

## Why the old hover felt wrong

1. A translucent white wash on the `<tr>` left a gap on the right (`scrollbar-gutter`) and a different tone on the sticky service cell.
2. That grey slab reads as generic admin UI, not Slice’s quiet surface language.

## Approach

Hover paints **every `td`** with the same opaque `surface-alt` mix, including sticky and actions. The lift runs edge to edge. No side seam, no gutter strip. Highlighted rows use a soft coral tint instead of a hard ring.
