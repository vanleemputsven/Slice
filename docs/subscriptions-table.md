# Subscriptions register table

## Why headers jumped

Column widths were content-driven. Filtering changed which rows (and action buttons) were visible, so the browser reflowed every column — including the header.

## Fix

- `table-layout: fixed` with a stable `colgroup`
- `scrollbar-gutter: stable` so a scrollbar does not shove the header sideways
- Truncation on long service/category cells instead of growing columns

## Header voice

Avoid the tiny muted “dashboard slop” look. Headers use the same secondary text colour as the product UI, normal weight, short labels (`Full` + quiet `/mo`), and right-aligned money/date columns.
