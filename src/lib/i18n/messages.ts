import type { AppLocale } from "@/lib/i18n/locale";

const en = {
  "language.toggleAria": "Language: Dutch or English",
  "header.homeAria": "Slice home",
  "header.navMain": "Main",
  "header.navOverview": "Overview",
  "header.navSubscriptions": "Subscriptions",

  "dashboard.title": "Overview",
  "dashboard.subtitle":
    "Totals, charts, notes, renewals, hours at your rate.",
  "dashboard.manageSubs": "Manage subscriptions",
  "dashboard.summaryStats": "Summary statistics",
  "dashboard.statMonthYours": "Month (yours)",
  "dashboard.statFullPlans": "Full plans",
  "dashboard.statPerMo": "/mo",
  "dashboard.statYearYours": "Year (yours)",
  "dashboard.statYearlyHint": "×12 on current list",
  "dashboard.statActive": "Active",
  "dashboard.statDue30": "due in 30d",
  "dashboard.statSharedPlans": "Shared plans",
  "dashboard.statSplitCount": "Split count on each row",
  "dashboard.workTime": "Work time",
  "dashboard.workTimeHint":
    "Hours (and rough workdays) to cover your subscription share at your rate.",
  "dashboard.hourlyLabel": "Hourly take-home",
  "dashboard.hourlyPlaceholder": "e.g. 42",
  "dashboard.hourlyAria": "Hourly wage for burn rate",
  "dashboard.hoursPerDay": "Hours / workday",
  "dashboard.hoursPerDayAria": "Hours per workday for workday equivalent",
  "dashboard.addRateHint": "Add a rate to see hours and workdays.",
  "dashboard.hoursPerMonth": "Hours / month",
  "dashboard.workdaysPerMo": "Workdays / mo ({hours} h)",
  "dashboard.hoursPerYear": "Hours / year",
  "dashboard.upcoming": "Upcoming",
  "dashboard.upcomingCounts": "Week {week} · 30d {month}",
  "dashboard.noneActive": "None active.",
  "dashboard.dueToday": "Today",
  "dashboard.dueTomorrow": "Tomorrow",
  "dashboard.dueInDays": "In {days}d",
  "dashboard.emptyTitle": "No subscriptions yet",
  "dashboard.emptyHint":
    "Add subscriptions on the subscriptions page, or load sample data to try the app.",
  "dashboard.emptyCta": "Go to subscriptions",

  "insights.heading": "Short notes",
  "insights.hint": "Active subscriptions; based on what you entered.",
  "insights.badgeReview": "Review",
  "insights.badgeCompare": "Compare",
  "insights.badgeInfo": "Info",

  "insights.yearlyLeader.title": "Yearly total ≠ monthly leader",
  "insights.yearlyLeader.description":
    "Highest yearly cost for you: {annualName} ({annualAmount}/yr). Highest monthly share: {monthlyName}. Annual billing often changes the order.",
  "insights.yearlyLeader.tip":
    "Open each subscription and check cycle and price if you are choosing what to cancel.",

  "insights.sharedLargest.title": "Biggest shared subscription",
  "insights.sharedLargest.description":
    "{name}: you pay {yours}/mo; full bill about {full}/mo.",
  "insights.sharedLargest.tip":
    "Update the number of people if the split changed.",

  "insights.flagged.title": "Flagged for review",
  "insights.flagged.descriptionOne": "1 item: {names}{more}.",
  "insights.flagged.descriptionMany": "{count} items: {names}{more}.",
  "insights.flagged.more": " (+{n} more)",
  "insights.flagged.tip":
    "Decide keep, downgrade, or cancel when you have a minute.",

  "insights.cluster.title": "Many renewals in two weeks",
  "insights.cluster.description":
    "{count} subscriptions have a payment in the next 14 days.",
  "insights.cluster.tip":
    "Skim the due dates so nothing hits the same day by surprise.",

  "charts.aria": "Spending charts",
  "charts.title": "Spending",
  "charts.emptyHint": "Add subscriptions for category split and ranking.",
  "charts.subtitle":
    "By category and by line item. Percent = share of your monthly total.",
  "charts.category": "Category",
  "charts.ranking": "Ranking (your share)",
  "charts.noData": "No data.",
  "charts.tooltipFullMo": "Full {amount}/mo",
  "charts.barTooltipFullPart": " · full {full}",

  "explorer.emptyTitle": "No subscriptions",
  "explorer.emptyHint":
    "Add at least one active subscription to see your monthly total here.",
  "explorer.emptyCta": "Subscriptions",
  "explorer.monthlyTitle": "Monthly total (your share)",
  "explorer.perMo": "/ mo",
  "explorer.intro":
    "Bar = share per subscription. Hover to emphasize; click to pin and see the total if you remove that line.",
  "explorer.barAria": "Subscription shares as proportion of monthly total",
  "explorer.srSegment":
    "{name}, {amount} per month, {pct} percent",
  "explorer.more": "+{count}",
  "explorer.without": "Without",
  "explorer.openRow": "Open row",
  "explorer.clear": "Clear",
  "explorer.clickHint": "Click a segment to pin it.",
  "explorer.ofTotal": "{pct}% of this total",

  "topCost.kicker": "Largest monthly share",
  "topCost.youPayMo": "You pay (per month)",
  "topCost.fullPlan": "Full plan (monthly equivalent)",
  "topCost.nextCharge": "Next charge",
  "topCost.sharing": "Sharing",
  "topCost.sharingSplit":
    "{count} people · your yearly share {amount}",
  "topCost.soloYear": "Solo · ~{amount}/yr",
  "topCost.openRow": "Open this row",
  "topCost.fullList": "Full list",
  "topCost.dueStale": "Date may need updating",
  "topCost.dueToday": "Today",
  "topCost.dueTomorrow": "Tomorrow",
  "topCost.dueInDays": "In {days} days",

  "subs.title": "Subscriptions",
  "subs.subtitle":
    "Full price, your share of shared plans, billing cycle, and next payment date.",
  "subs.add": "Add",
  "subs.loadDemo": "Load demo",
  "subs.clearData": "Clear data",
  "subs.clearConfirm":
    "Clear all subscriptions and preferences on this device?",
  "subs.emptyTitle": "No subscriptions yet",
  "subs.emptyHint":
    "Add a subscription to get started, or load sample data to preview the dashboard.",
  "subs.addSubscription": "Add subscription",
  "subs.loadDemoSet": "Load demo set",
  "subs.filterRegion": "Filter and sort subscriptions",
  "subs.category": "Category",
  "subs.all": "All",
  "subs.sharing": "Sharing",
  "subs.sharingAria": "Sharing filter",
  "subs.shared": "Shared",
  "subs.notShared": "Not shared",
  "subs.sortBy": "Sort by",
  "subs.sortAria": "Sort order",
  "subs.sortNext": "Next payment",
  "subs.sortCost": "Your cost",
  "subs.sortName": "Name",
  "subs.sortCategory": "Category",
  "subs.colService": "Service",
  "subs.colCategory": "Category",
  "subs.colBilling": "Billing",
  "subs.colFullMo": "Full / mo",
  "subs.colYoursMo": "Yours / mo",
  "subs.colNext": "Next",
  "subs.colSplit": "Split",
  "subs.colActions": "Actions",
  "subs.inactive": "(inactive)",
  "subs.reviewBadge": "Review",
  "subs.past": "past",
  "subs.daysSuffix": "{days}d",
  "subs.editAria": "Edit {name}",
  "subs.deleteAria": "Delete {name}",
  "subs.deleteConfirm": "Delete {name}?",
  "subs.billingMonthly": "Monthly",
  "subs.billingYearly": "Yearly",
  "subs.billingCustom": "Every {months} mo",

  "form.addTitle": "Add subscription",
  "form.editTitle": "Edit subscription",
  "form.closeAria": "Close",
  "form.name": "Name",
  "form.provider": "Provider",
  "form.category": "Category",
  "form.billingCycle": "Billing cycle",
  "form.billingMonthly": "Monthly",
  "form.billingYearly": "Yearly",
  "form.billingCustom": "Custom (every N months)",
  "form.everyNMonths": "Every N months",
  "form.totalPrice": "Total price (per bill)",
  "form.currencyIso": "Currency (ISO)",
  "form.nextPayment": "Next payment",
  "form.sharingLegend": "Sharing",
  "form.sharedLabel": "Shared with others",
  "form.shareCount": "People splitting (incl. you)",
  "form.active": "Active",
  "form.reviewFlag": "Flag for review (trimming candidate)",
  "form.notes": "Notes",
  "form.rootError": "Check highlighted fields.",
  "form.cancel": "Cancel",
  "form.save": "Save",

  "boot.ariaBusy": "Loading Slice",
  "boot.loading": "Loading…",
  "boot.tagline": "Subscription clarity",

  "notFound.title": "Page not found",
  "notFound.hint":
    "That route doesn’t exist. Head back to your dashboard.",
  "notFound.cta": "Open dashboard",

  "error.title": "Something went wrong",
  "error.hint": "An unexpected error occurred. You can try again.",
  "error.retry": "Try again",
} as const;

type MessageKey = keyof typeof en;

const nl: Record<MessageKey, string> = {
  "language.toggleAria": "Taal: Nederlands of Engels",
  "header.homeAria": "Slice startpagina",
  "header.navMain": "Hoofdmenu",
  "header.navOverview": "Overzicht",
  "header.navSubscriptions": "Abonnementen",

  "dashboard.title": "Overzicht",
  "dashboard.subtitle":
    "Totalen, grafieken, notities, verlengingen, uren tegen jouw tarief.",
  "dashboard.manageSubs": "Abonnementen beheren",
  "dashboard.summaryStats": "Samenvattende cijfers",
  "dashboard.statMonthYours": "Maand (jij)",
  "dashboard.statFullPlans": "Volledige abonnementen",
  "dashboard.statPerMo": "/mnd",
  "dashboard.statYearYours": "Jaar (jij)",
  "dashboard.statYearlyHint": "×12 op huidige lijst",
  "dashboard.statActive": "Actief",
  "dashboard.statDue30": "vervalt binnen 30 d",
  "dashboard.statSharedPlans": "Gedeelde abonnementen",
  "dashboard.statSplitCount": "Aantal splitsingen per regel",
  "dashboard.workTime": "Werkuren",
  "dashboard.workTimeHint":
    "Uren (en ruwe werkdagen) om jouw abonnementsdeel te dekken tegen jouw tarief.",
  "dashboard.hourlyLabel": "Uurloon netto",
  "dashboard.hourlyPlaceholder": "bijv. 42",
  "dashboard.hourlyAria": "Uurloon voor burnrate",
  "dashboard.hoursPerDay": "Uren / werkdag",
  "dashboard.hoursPerDayAria": "Uren per werkdag voor werkdag-equivalent",
  "dashboard.addRateHint": "Vul een tarief in om uren en werkdagen te zien.",
  "dashboard.hoursPerMonth": "Uren / maand",
  "dashboard.workdaysPerMo": "Werkdagen / mnd ({hours} u)",
  "dashboard.hoursPerYear": "Uren / jaar",
  "dashboard.upcoming": "Komende betalingen",
  "dashboard.upcomingCounts": "Week {week} · 30 d {month}",
  "dashboard.noneActive": "Geen actieve items.",
  "dashboard.dueToday": "Vandaag",
  "dashboard.dueTomorrow": "Morgen",
  "dashboard.dueInDays": "Over {days} d",
  "dashboard.emptyTitle": "Nog geen abonnementen",
  "dashboard.emptyHint":
    "Voeg abonnementen toe op de abonnementenpagina, of laad voorbeelddata om te proberen.",
  "dashboard.emptyCta": "Naar abonnementen",

  "insights.heading": "Korte notities",
  "insights.hint": "Actieve abonnementen; op basis van jouw invoering.",
  "insights.badgeReview": "Beoordelen",
  "insights.badgeCompare": "Vergelijken",
  "insights.badgeInfo": "Info",

  "insights.yearlyLeader.title":
    "Jaartotaal wijkt af van maandleider",
  "insights.yearlyLeader.description":
    "Hoogste jaarkosten voor jou: {annualName} ({annualAmount}/jr). Hoogste maanddeel: {monthlyName}. Jaar­facturatie verandert vaak de volgorde.",
  "insights.yearlyLeader.tip":
    "Open elk abonnement en controleer cyclus en prijs als je gaat opschonen.",

  "insights.sharedLargest.title": "Grootste gedeelde abonnement",
  "insights.sharedLargest.description":
    "{name}: jij betaalt {yours}/mnd; volledige rekening ongeveer {full}/mnd.",
  "insights.sharedLargest.tip":
    "Werk het aantal personen bij als de splitsing is veranderd.",

  "insights.flagged.title": "Gemarkeerd voor beoordeling",
  "insights.flagged.descriptionOne": "1 item: {names}{more}.",
  "insights.flagged.descriptionMany": "{count} items: {names}{more}.",
  "insights.flagged.more": " (+{n} extra)",
  "insights.flagged.tip":
    "Bepaal behouden, verlagen of opzeggen wanneer je even tijd hebt.",

  "insights.cluster.title": "Veel verlengingen binnen twee weken",
  "insights.cluster.description":
    "{count} abonnementen hebben een betaling binnen 14 dagen.",
  "insights.cluster.tip":
    "Scan de vervaldata zodat er niets onverwacht op dezelfde dag valt.",

  "charts.aria": "Uitgavengrafieken",
  "charts.title": "Uitgaven",
  "charts.emptyHint":
    "Voeg abonnementen toe voor verdeling per categorie en ranking.",
  "charts.subtitle":
    "Per categorie en per regel. Percentage = aandeel van jouw maandtotaal.",
  "charts.category": "Categorie",
  "charts.ranking": "Ranking (jouw deel)",
  "charts.noData": "Geen gegevens.",
  "charts.tooltipFullMo": "Volledig {amount}/mnd",
  "charts.barTooltipFullPart": " · volledig {full}",

  "explorer.emptyTitle": "Geen abonnementen",
  "explorer.emptyHint":
    "Voeg minstens één actief abonnement toe om je maandtotaal hier te zien.",
  "explorer.emptyCta": "Abonnementen",
  "explorer.monthlyTitle": "Maandtotaal (jouw deel)",
  "explorer.perMo": "/ mnd",
  "explorer.intro":
    "Balk = deel per abonnement. Beweeg om te benadrukken; klik om vast te zetten en het totaal te zien zonder die regel.",
  "explorer.barAria":
    "Abonnementsdelen als verhouding van het maandtotaal",
  "explorer.srSegment": "{name}, {amount} per maand, {pct} procent",
  "explorer.more": "+{count}",
  "explorer.without": "Zonder",
  "explorer.openRow": "Open regel",
  "explorer.clear": "Wissen",
  "explorer.clickHint": "Klik op een segment om het vast te zetten.",
  "explorer.ofTotal": "{pct}% van dit totaal",

  "topCost.kicker": "Grootste maanddeel",
  "topCost.youPayMo": "Jij betaalt (per maand)",
  "topCost.fullPlan": "Volledig abonnement (maandequivalent)",
  "topCost.nextCharge": "Volgende afschrijving",
  "topCost.sharing": "Delen",
  "topCost.sharingSplit":
    "{count} personen · jouw jaardeel {amount}",
  "topCost.soloYear": "Solo · ~{amount}/jr",
  "topCost.openRow": "Open deze regel",
  "topCost.fullList": "Volledige lijst",
  "topCost.dueStale": "Datum controleren",
  "topCost.dueToday": "Vandaag",
  "topCost.dueTomorrow": "Morgen",
  "topCost.dueInDays": "Over {days} dagen",

  "subs.title": "Abonnementen",
  "subs.subtitle":
    "Volle prijs, jouw deel van gedeelde abonnementen, facturatie en volgende betaling.",
  "subs.add": "Toevoegen",
  "subs.loadDemo": "Demo laden",
  "subs.clearData": "Gegevens wissen",
  "subs.clearConfirm":
    "Alle abonnementen en voorkeuren op dit apparaat wissen?",
  "subs.emptyTitle": "Nog geen abonnementen",
  "subs.emptyHint":
    "Voeg een abonnement toe om te starten, of laad voorbeeld­data voor het dashboard.",
  "subs.addSubscription": "Abonnement toevoegen",
  "subs.loadDemoSet": "Demo-set laden",
  "subs.filterRegion": "Filter en sorteer abonnementen",
  "subs.category": "Categorie",
  "subs.all": "Alles",
  "subs.sharing": "Delen",
  "subs.sharingAria": "Filter delen",
  "subs.shared": "Gedeeld",
  "subs.notShared": "Niet gedeeld",
  "subs.sortBy": "Sorteer op",
  "subs.sortAria": "Sorteervolgorde",
  "subs.sortNext": "Volgende betaling",
  "subs.sortCost": "Jouw kosten",
  "subs.sortName": "Naam",
  "subs.sortCategory": "Categorie",
  "subs.colService": "Dienst",
  "subs.colCategory": "Categorie",
  "subs.colBilling": "Facturatie",
  "subs.colFullMo": "Vol / mnd",
  "subs.colYoursMo": "Jouw / mnd",
  "subs.colNext": "Volgende",
  "subs.colSplit": "Split",
  "subs.colActions": "Acties",
  "subs.inactive": "(inactief)",
  "subs.reviewBadge": "Beoordelen",
  "subs.past": "verleden",
  "subs.daysSuffix": "{days}d",
  "subs.editAria": "Bewerk {name}",
  "subs.deleteAria": "Verwijder {name}",
  "subs.deleteConfirm": "{name} verwijderen?",
  "subs.billingMonthly": "Maandelijks",
  "subs.billingYearly": "Jaarlijks",
  "subs.billingCustom": "Elke {months} mnd",

  "form.addTitle": "Abonnement toevoegen",
  "form.editTitle": "Abonnement bewerken",
  "form.closeAria": "Sluiten",
  "form.name": "Naam",
  "form.provider": "Aanbieder",
  "form.category": "Categorie",
  "form.billingCycle": "Facturatie",
  "form.billingMonthly": "Maandelijks",
  "form.billingYearly": "Jaarlijks",
  "form.billingCustom": "Aangepast (elke N maanden)",
  "form.everyNMonths": "Elke N maanden",
  "form.totalPrice": "Totale prijs (per factuur)",
  "form.currencyIso": "Valuta (ISO)",
  "form.nextPayment": "Volgende betaling",
  "form.sharingLegend": "Delen",
  "form.sharedLabel": "Gedeeld met anderen",
  "form.shareCount": "Personen die mee betalen (incl. jij)",
  "form.active": "Actief",
  "form.reviewFlag": "Markeren voor beoordeling (kandidaat om te schrappen)",
  "form.notes": "Notities",
  "form.rootError": "Controleer de gemarkeerde velden.",
  "form.cancel": "Annuleren",
  "form.save": "Opslaan",

  "boot.ariaBusy": "Slice wordt geladen",
  "boot.loading": "Laden…",
  "boot.tagline": "Helderheid over je abonnementen",

  "notFound.title": "Pagina niet gevonden",
  "notFound.hint": "Die URL bestaat niet. Ga terug naar je dashboard.",
  "notFound.cta": "Dashboard openen",

  "error.title": "Er ging iets mis",
  "error.hint":
    "Er is een onverwachte fout opgetreden. Je kunt het opnieuw proberen.",
  "error.retry": "Opnieuw proberen",
};

export type SliceMessageKey = MessageKey;

export function sliceT(
  locale: AppLocale,
  key: SliceMessageKey,
  vars?: Record<string, string | number>
): string {
  const table = locale === "nl" ? nl : en;
  let out: string = table[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.split(`{${k}}`).join(String(v));
    }
  }
  return out;
}
