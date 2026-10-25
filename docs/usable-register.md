# Why the register is the product

Slice is reopened to answer one question: what leaves the account in the next 14 days, and how many hours of work that is. A charge inside the reminder lead is marked in that list. Recording it as charged moves the stored date one cycle forward. The monthly share stays for comparison. It is not the thing on the date.

Bank sync and outbound mail stay out. There is no provider, and a fake send would train the wrong habit.

## What changed in the app

The overview leads with that 14-day total. The amount is the one large figure. Hours at the person’s rate sit in the same block, because that conversion is the reason to open Slice instead of a spreadsheet. Stats under it are type, without icons. Charts keep a single hue on the data and neutral lines around it.

The subscriptions page is the register: search by name or provider, the same charged action, and the next date uses the stored reminder lead. A hardcoded seven-day warning disagreed with a lead of three or fourteen.

The app shell drops the dot grid, card gradients, and glow on buttons. Those were decoration on a screen someone uses every few days. Colour stays on a marked charge and on the chart marks. Navigation uses weight, not a coloured icon. Route changes do not animate; that motion would play on every visit.

The landing page keeps its own page. This pass does not replace that art direction.

## Phone and the clock

Below the `md` breakpoint the register is a stack of rows: mark, name, personal monthly share, next date, and actions that are at least 44px. The wide table stays from `md` up, with the name column stuck to the left if the rest still scrolls. Filter chips wrap, so a category is not hidden in a scrollbar-less row.

“Today” is read in the browser after mount. A server in UTC and a phone in Europe would otherwise disagree about the 14-day window for a few hours around midnight, and React would hydrate the wrong list. Until that local day exists, the horizon reserves its space and the register shows the stored calendar date without a relative day count.

Inputs are 16px so iOS does not zoom the page on focus. The sticky header is a solid surface, with safe-area padding, and a skip link targets the main content. Charts load in their own chunk so the first view of the horizon does not wait on the chart library.
