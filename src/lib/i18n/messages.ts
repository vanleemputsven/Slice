import type { AppLocale } from "@/lib/i18n/locale";

const en = {
  "language.toggleAria": "Language: Dutch or English",
  "header.homeAria": "Slice home",
  "header.navMain": "Main",
  "header.navOverview": "Overview",
  "header.navSubscriptions": "Subscriptions",
  "header.greetingNamed": "Hi, {name}",

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

  "auth.signInTitle": "Sign in",
  "auth.signUpTitle": "Create account",
  "auth.kickerSignIn": "Welcome back",
  "auth.kickerSignUp": "Join Slice",
  "auth.blurb":
    "One account for your subscriptions, splits, and work-time view.",
  "auth.modeTabsAria": "Sign in or register",
  "auth.email": "Email",
  "auth.emailPlaceholder": "you@example.com",
  "auth.password": "Password",
  "auth.passwordHelp": "At least 8 characters.",
  "auth.passwordConfirm": "Confirm password",
  "auth.passwordConfirmRequired": "Enter the same password again (8+ characters).",
  "auth.passwordMismatch": "Those passwords do not match.",
  "auth.showPassword": "Show password",
  "auth.hidePassword": "Hide password",
  "auth.signInCta": "Sign in",
  "auth.signUpCta": "Create account",
  "auth.loading": "Hold on…",
  "auth.noAccount": "New here?",
  "auth.hasAccount": "Already have an account?",
  "auth.switchSignUp": "Create an account",
  "auth.switchSignIn": "Sign in instead",
  "auth.backToSlice": "Back to Slice",
  "auth.signInFailed": "Could not sign in. Check your email and password.",
  "auth.signUpFailed": "Could not sign up. You may already have an account.",
  "auth.confirmEmail":
    "Check your inbox to confirm your email, then sign in.",
  "auth.callbackError": "Authentication did not complete. Please try again.",
  "auth.configError":
    "App configuration is incomplete. Set your Supabase environment variables.",
  "auth.continueWithGoogle": "Continue with Google",
  "auth.googleSignInFailed":
    "Google sign-in did not start. Check Supabase and Google OAuth settings.",
  "auth.orDivider": "or",
  "welcome.kicker": "You're in",
  "welcome.stepLabel": "Step {current} of {total}",
  "welcome.stepProgressAria": "Onboarding progress",
  "welcome.next": "Next",
  "welcome.back": "Back",
  "welcome.narrativeP1":
    "Welcome. Slice keeps subscriptions, splits, and totals in one clear list.",
  "welcome.narrativeP2":
    "Next, a few optional choices—you can skip or change them later.",
  "welcome.narrativeName":
    "If you’d like, tell us what we should call you. A first name, a nickname—whatever sounds like you when we say hello in the corner of the screen.",
  "welcome.narrativeLocale":
    "Pick the language for menus and numbers.",
  "welcome.narrativeCurrency":
    "We’ll show amounts in one currency on your dashboard first. You can always adjust this when life moves across borders—or across banks.",
  "welcome.narrativeClosing":
    "When you’re ready, step through. If you’d rather tiptoe in without sharing a thing yet, that’s perfectly fine too.",
  "welcome.title": "Before we open the dashboard",
  "welcome.subtitle":
    "A few gentle details—only if you like. Everything is optional, and you can change it later.",
  "welcome.nameLabel": "What should we call you?",
  "welcome.namePlaceholder": "First name or nickname",
  "welcome.nameHint":
    "Optional. We’ll use this for a warmer tone here and there—never for receipts.",
  "welcome.nameTooLong": "Please keep it to 80 characters or fewer.",
  "welcome.localeLabel": "Language in Slice",
  "welcome.currencyLabel": "Currency for amounts",
  "welcome.currencyHint": "You can refine this anytime in your overview.",
  "welcome.submit": "Save and continue",
  "welcome.skip": "Skip for now",
  "welcome.skipHint":
    "Totally fine—you can add this later from your overview whenever you like.",
  "welcome.errorSave": "Could not save. Check your connection and try again.",
  "header.signOut": "Sign out",
  "header.syncErrorAria": "Data sync notice",
  "header.dismissError": "Dismiss",
  "data.loadFailed":
    "Could not load your data. Refresh the page or try again later.",
  "data.saveFailed":
    "Could not save changes. Check your connection and try again.",

  "boot.ariaBusy": "Loading Slice",
  "boot.loading": "Loading…",
  "boot.almostReady": "Finishing up…",
  "boot.progressPercent": "{pct}% loaded",
  "boot.tagline": "Subscription clarity",

  "landing.navFeatures": "Features",
  "landing.navDemo": "Quick scan",
  "landing.navHow": "How it works",
  "landing.navSecurity": "Security",
  "landing.navLogin": "Sign in",
  "landing.navDashboard": "Dashboard",
  "landing.heroKicker": "Know what you really pay",
  "landing.heroTitle": "Subscriptions, without the fog.",
  "landing.heroLead":
    "One list for renewals, your share of shared plans, and how many hours that share costs at your rate.",
  "landing.ctaStart": "Get started free",
  "landing.ctaDashboard": "Open dashboard",
  "landing.ctaScroll": "Answer a few questions",
  "landing.heroSlideshowAria": "Slice product screenshots",
  "landing.heroSlideshowSlideStatus": "Slide {current} of {total}",
  "landing.heroScreenshotAlt": "Slice application screenshot {n}",
  "landing.heroSlideshowGoTo": "Show screenshot {n}",
  "landing.heroSlideshowDots": "Choose screenshot",
  "landing.demoTitle": "Quick scan",
  "landing.demoHint":
    "Four short steps. Your answers stay in the browser until you leave the page.",
  "landing.demoTeaserLine": "Something short waits here.",
  "landing.demoTeaserHint": "Scroll closer—it only appears when you mean it.",
  "landing.wizardAria": "Quick questionnaire",
  "landing.wizardStepLabel": "Question {current} of {total}",
  "landing.wizardStepDone": "Your snapshot",
  "landing.wizardQ1Title": "About how many subscriptions renew?",
  "landing.wizardQ1Hint":
    "A rough count is fine: monthly or yearly renewals you pay for.",
  "landing.wizardCount1": "1–2",
  "landing.wizardCount2": "3–5",
  "landing.wizardCount3": "6–10",
  "landing.wizardCount4": "More than 10",
  "landing.wizardQ2Title": "Which categories do they mostly fall into?",
  "landing.wizardQ2Hint": "Select all categories that match your renewals.",
  "landing.wizardCatStream": "Streaming & media",
  "landing.wizardCatSoftware": "Apps & cloud",
  "landing.wizardCatMobile": "Phone & internet",
  "landing.wizardCatFitness": "Sport & wellness",
  "landing.wizardCatNews": "News & learning",
  "landing.wizardCatOther": "Other",
  "landing.wizardQ3Title": "What is your monthly spend (your share)?",
  "landing.wizardQ3Hint": "Your total for all of them together, not per subscription.",
  "landing.wizardBand1": "Under €50/mo",
  "landing.wizardBand2": "€50–€100/mo",
  "landing.wizardBand3": "€100–€200/mo",
  "landing.wizardBand4": "Over €200/mo",
  "landing.wizardNext": "Next",
  "landing.wizardBack": "Back",
  "landing.wizardStartOver": "Start over",
  "landing.wizardPickOne": "Pick one option to continue.",
  "landing.wizardPickCategories": "Pick at least one category.",
  "landing.wizardDoneTitle": "That adds up fast",
  "landing.wizardDoneBody":
    "Renewals, shared plans, and totals are easier when they live in one list. Create a free account and track it properly in Slice.",
  "landing.wizardDoneSignedInTitle": "You are already in",
  "landing.wizardDoneSignedInBody":
    "Open your dashboard to add or edit subscriptions and see charts.",
  "landing.wizardDoneCta": "Create account",
  "landing.wizardSummaryIntro": "Snapshot:",
  "landing.wizardSummaryLine1": "{range} subscription renewals",
  "landing.wizardSummaryLine3": "Monthly ballpark (your share): {band}",
  "landing.featuresTitle": "What you get",
  "landing.featureSubsTitle": "Cycles line up",
  "landing.featureSubsBody":
    "Week, month, year, or custom: everything is converted to monthly first so totals match your bank feed.",
  "landing.featureShareTitle": "Splits stay honest",
  "landing.featureShareBody":
    "Shared row, headcount on the row, your share and the gross amount in one place.",
  "landing.featureChartsTitle": "See the shape",
  "landing.featureChartsBody":
    "Category share, ranking, and a bar you can peel back to ask what if this row vanished.",
  "landing.featureWorkTitle": "Hours, not vibes",
  "landing.featureWorkBody":
    "Same field as the dashboard: net rate in, hours and rough workdays out.",
  "landing.howTitle": "How it works",
  "landing.howStep1Title": "Add your plans",
  "landing.howStep1Body":
    "Streaming, cloud, gym, insurance: anything that renews on a schedule.",
  "landing.howStep2Title": "Flag shared costs",
  "landing.howStep2Body":
    "Roommates, family bundles, team tools: keep the split count on each row so totals stay correct.",
  "landing.howStep3Title": "Read the dashboard",
  "landing.howStep3Body":
    "Totals, insights, renewals, and charts follow your list. No spreadsheet required.",
  "landing.securityTitle": "Private by design",
  "landing.securityRls":
    "Row-level security in Postgres: every row is scoped to your account.",
  "landing.securityAuth":
    "Supabase Auth. Sessions are checked on routes that need a login.",
  "landing.securityData":
    "Data lives with your account, not in a link anyone can open.",
  "landing.footerTagline": "Less guessing. Sounder totals.",
  "landing.footerCopyright":
    "© {year} Sven Van Leemput. All rights reserved.",
  "landing.logoAria": "Slice home",
  "landing.tickerAria": "Quick links on this page",
  "landing.tickerItemCta": "Start free and track properly",
  "landing.tickerItemCtaDash": "Open your live dashboard",

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
  "header.greetingNamed": "Hoi, {name}",

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

  "auth.signInTitle": "Inloggen",
  "auth.signUpTitle": "Account aanmaken",
  "auth.kickerSignIn": "Welkom terug",
  "auth.kickerSignUp": "Word lid van Slice",
  "auth.blurb":
    "Eén account voor je abonnementen, splits en werkuren-beeld.",
  "auth.modeTabsAria": "Inloggen of registreren",
  "auth.email": "E-mail",
  "auth.emailPlaceholder": "jij@voorbeeld.nl",
  "auth.password": "Wachtwoord",
  "auth.passwordHelp": "Minimaal 8 tekens.",
  "auth.passwordConfirm": "Bevestig wachtwoord",
  "auth.passwordConfirmRequired": "Vul hetzelfde wachtwoord opnieuw in (min. 8 tekens).",
  "auth.passwordMismatch": "Deze wachtwoorden komen niet overeen.",
  "auth.showPassword": "Wachtwoord tonen",
  "auth.hidePassword": "Wachtwoord verbergen",
  "auth.signInCta": "Inloggen",
  "auth.signUpCta": "Account aanmaken",
  "auth.loading": "Even geduld…",
  "auth.noAccount": "Nieuw hier?",
  "auth.hasAccount": "Heb je al een account?",
  "auth.switchSignUp": "Account aanmaken",
  "auth.switchSignIn": "Inloggen",
  "auth.backToSlice": "Terug naar Slice",
  "auth.signInFailed": "Inloggen mislukt. Controleer e-mail en wachtwoord.",
  "auth.signUpFailed":
    "Registreren mislukt. Mogelijk bestaat dit account al.",
  "auth.confirmEmail":
    "Bevestig je e-mail via de link die we hebben gestuurd, en log daarna in.",
  "auth.callbackError": "Authenticatie mislukt. Probeer het opnieuw.",
  "auth.configError":
    "Configuratie ontbreekt. Stel de Supabase-omgevingsvariabelen in.",
  "auth.continueWithGoogle": "Doorgaan met Google",
  "auth.googleSignInFailed":
    "Inloggen met Google lukte niet. Controleer Supabase en Google OAuth.",
  "auth.orDivider": "of",
  "welcome.kicker": "Fijn dat je er bent",
  "welcome.stepLabel": "Stap {current} van {total}",
  "welcome.stepProgressAria": "Voortgang kennismaking",
  "welcome.next": "Volgende",
  "welcome.back": "Terug",
  "welcome.narrativeP1":
    "Welkom bij Slice. Abonnementen, splits en totalen op één heldere plek.",
  "welcome.narrativeP2":
    "Straks een paar korte, optionele keuzes—overslaan of later aanpassen kan altijd.",
  "welcome.narrativeName":
    "Zeg ons gerust hoe we je mogen noemen. Voornaam, koosnaam—wat voelt als jij wanneer we even hallo zeggen in de hoek van je scherm.",
  "welcome.narrativeLocale":
    "Welke taal wil je voor menu’s en cijfers?",
  "welcome.narrativeCurrency":
    "We tonen bedragen eerst in één valuta op je dashboard. Later bijstellen mag altijd—werk, land en bank veranderen nu eenmaal mee.",
  "welcome.narrativeClosing":
    "Als het goed voelt, ga je verder. Liever stilletjes binnenkomen zonder iets te delen? Dat kan ook—geen drama.",
  "welcome.title": "Even kennismaken—alleen als jij dat wilt",
  "welcome.subtitle":
    "Met een paar zachte vragen maken we Slice wat persoonlijker. Niets is verplicht; je past het later overal aan.",
  "welcome.nameLabel": "Hoe mogen we je noemen?",
  "welcome.namePlaceholder": "Voornaam of roepnaam",
  "welcome.nameHint":
    "Optioneel. We gebruiken dit voor een warmere toon—niet voor facturen of export.",
  "welcome.nameTooLong": "Houd het bij maximaal 80 tekens.",
  "welcome.localeLabel": "Taal in Slice",
  "welcome.currencyLabel": "Valuta voor bedragen",
  "welcome.currencyHint": "Je kunt dit altijd bijstellen in je overzicht.",
  "welcome.submit": "Opslaan en verder",
  "welcome.skip": "Nu overslaan",
  "welcome.skipHint":
    "Helemaal oké—je vult het aan wanneer het uitkomt.",
  "welcome.errorSave":
    "Opslaan lukte niet. Controleer je verbinding en probeer opnieuw.",
  "header.signOut": "Uitloggen",
  "header.syncErrorAria": "Melding over synchronisatie",
  "header.dismissError": "Sluiten",
  "data.loadFailed":
    "Je gegevens konden niet worden geladen. Vernieuw de pagina of probeer later opnieuw.",
  "data.saveFailed":
    "Opslaan mislukt. Controleer je verbinding en probeer opnieuw.",

  "boot.ariaBusy": "Slice wordt geladen",
  "boot.loading": "Laden…",
  "boot.almostReady": "Nog even…",
  "boot.progressPercent": "{pct}% geladen",
  "boot.tagline": "Helderheid over je abonnementen",

  "landing.navFeatures": "Functies",
  "landing.navDemo": "Korte scan",
  "landing.navHow": "Zo werkt het",
  "landing.navSecurity": "Beveiliging",
  "landing.navLogin": "Inloggen",
  "landing.navDashboard": "Dashboard",
  "landing.heroKicker": "Wat je écht kwijt bent",
  "landing.heroTitle": "Abonnementen zonder mist.",
  "landing.heroLead":
    "Eén lijst: verlengingen, jouw deel van gedeelde plannen, en hoeveel uur dat deel kost tegen jouw tarief.",
  "landing.ctaStart": "Gratis beginnen",
  "landing.ctaDashboard": "Dashboard openen",
  "landing.ctaScroll": "Beantwoord een paar vragen",
  "landing.heroSlideshowAria": "Productscreenshots van Slice",
  "landing.heroSlideshowSlideStatus": "Afbeelding {current} van {total}",
  "landing.heroScreenshotAlt": "Screenshot {n} van de Slice-app",
  "landing.heroSlideshowGoTo": "Toon screenshot {n}",
  "landing.heroSlideshowDots": "Kies screenshot",
  "landing.demoTitle": "Korte scan",
  "landing.demoHint":
    "Vier korte stappen. Je antwoorden blijven in je browser tot je de pagina sluit.",
  "landing.demoTeaserLine": "Iets korts wacht hier.",
  "landing.demoTeaserHint":
    "Scroll dichterbij—het verschijnt pas als je het echt wilt.",
  "landing.wizardAria": "Korte vragenlijst",
  "landing.wizardStepLabel": "Vraag {current} van {total}",
  "landing.wizardStepDone": "Jouw momentopname",
  "landing.wizardQ1Title": "Ongeveer hoeveel abonnementen lopen er bij jou door?",
  "landing.wizardQ1Hint":
    "Grof is oké: alles dat maandelijks of jaarlijks verlengt.",
  "landing.wizardCount1": "1–2",
  "landing.wizardCount2": "3–5",
  "landing.wizardCount3": "6–10",
  "landing.wizardCount4": "Meer dan 10",
  "landing.wizardQ2Title": "Welke soorten komen het meest voor?",
  "landing.wizardQ2Hint": "Kies alles wat past bij jouw verlengingen.",
  "landing.wizardCatStream": "Streaming & media",
  "landing.wizardCatSoftware": "Apps & cloud",
  "landing.wizardCatMobile": "Telefoon & internet",
  "landing.wizardCatFitness": "Sport & welzijn",
  "landing.wizardCatNews": "Nieuws & leren",
  "landing.wizardCatOther": "Anders",
  "landing.wizardQ3Title": "Wat is jouw maandelijkse uitgave (jouw deel)?",
  "landing.wizardQ3Hint": "Jouw totaal voor alles samen, niet per abonnementregel.",
  "landing.wizardBand1": "Onder €50/mnd",
  "landing.wizardBand2": "€50–€100/mnd",
  "landing.wizardBand3": "€100–€200/mnd",
  "landing.wizardBand4": "Meer dan €200/mnd",
  "landing.wizardNext": "Verder",
  "landing.wizardBack": "Terug",
  "landing.wizardStartOver": "Opnieuw beginnen",
  "landing.wizardPickOne": "Kies een optie om verder te gaan.",
  "landing.wizardPickCategories": "Kies minimaal één soort.",
  "landing.wizardDoneTitle": "Dat loopt snel op",
  "landing.wizardDoneBody":
    "Verlengingen, gedeelde plannen en totalen beheer je beter op één plek. Maak een gratis account en vul het in Slice bij.",
  "landing.wizardDoneSignedInTitle": "Je bent al ingelogd",
  "landing.wizardDoneSignedInBody":
    "Open je dashboard om abonnementen toe te voegen of aan te passen en grafieken te zien.",
  "landing.wizardDoneCta": "Account aanmaken",
  "landing.wizardSummaryIntro": "Jouw scan in het kort:",
  "landing.wizardSummaryLine1": "{range} terugkerende abonnementen",
  "landing.wizardSummaryLine3": "Globaal per maand (jouw deel): {band}",
  "landing.featuresTitle": "Wat je ermee doet",
  "landing.featureSubsTitle": "Oplijnen van cycli",
  "landing.featureSubsBody":
    "Week, maand, jaar of maatwerk: eerst naar maandbedrag, dan pas totalen en splits.",
  "landing.featureShareTitle": "Eerlijke splits",
  "landing.featureShareBody":
    "Gedeelde regel, aantal mensen op die regel, jouw deel en het bruto­bedrag samen.",
  "landing.featureChartsTitle": "Vorm van je uitgaven",
  "landing.featureChartsBody":
    "Aandeel per categorie, ranglijst, en een staaf om te vragen: wat als deze regel wegvalt?",
  "landing.featureWorkTitle": "Uren, niet gevoel",
  "landing.featureWorkBody":
    "Zelfde veld als in het dashboard: netto tarief erin, uren en ruwe werkdagen eruit.",
  "landing.howTitle": "Zo werkt het",
  "landing.howStep1Title": "Voeg je plannen toe",
  "landing.howStep1Body":
    "Streaming, cloud, sportschool, verzekering: alles dat volgens een verlengingsritme loopt.",
  "landing.howStep2Title": "Markeer gedeelde kosten",
  "landing.howStep2Body":
    "Huisgenoten, familiebundel, teamtools: houd het aantal splitsingen op elke regel zodat de som klopt.",
  "landing.howStep3Title": "Lees het dashboard",
  "landing.howStep3Body":
    "Totalen, inzichten, verlengingen en grafieken volgen je lijst. Geen spreadsheet nodig.",
  "landing.securityTitle": "Privé by design",
  "landing.securityRls":
    "Row-level security in Postgres: elke rij hoort bij jouw account.",
  "landing.securityAuth":
    "Supabase Auth. Sessies worden gecontroleerd op routes die een login vragen.",
  "landing.securityData":
    "Gegevens horen bij jouw account, niet bij een link die iedereen kan openen.",
  "landing.footerTagline": "Minder gissen. Betere totalen.",
  "landing.footerCopyright":
    "© {year} Sven Van Leemput. Alle rechten voorbehouden.",
  "landing.logoAria": "Slice startpagina",
  "landing.tickerAria": "Snelkoppelingen op deze pagina",
  "landing.tickerItemCta": "Gratis starten en goed bijhouden",
  "landing.tickerItemCtaDash": "Naar je live dashboard",

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
