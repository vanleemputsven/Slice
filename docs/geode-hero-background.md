# Hero Background (2D Product System)

## Why we changed approach

The previous 3D explorations still felt abstract. Feedback was clear: the hero should look like an extension of the Slice product UI, not an art object. We moved to a 2D system built from panel layers, data rails, and chart-like rhythm.

## What we render now

- **Panel stack backdrop**: layered rounded rectangles that match dashboard card language.
- **Soft grid layer**: low-contrast product grid for structure and scale.
- **Data rails**: animated vertical rails on both sides of hero content to suggest streams/workflows.
- **Mini chart module**: subtle bar strip near the bottom to echo analytics without becoming literal UI.
- **Pointer glow**: accent glow follows pointer position to preserve interactivity.
- **Motion policy**: reduced motion collapses to calm static states; no jitter.

## Stack

- `framer-motion` + CSS utility classes
- Component: `src/components/marketing/geode-hero-canvas.tsx` (export name unchanged for imports).
- Loaded with `dynamic(..., { ssr: false })` from the marketing hero.

## Tuning

- Data-rail density: `RAIL_COUNT`
- Bar density: `BAR_COUNT`
- Motion softness: spring settings (`stiffness`, `damping`, `mass`)
- Visual intensity: rail opacity, grid opacity, and accent glow alpha
