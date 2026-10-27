# Slice — Jouw deel. Helder.
## Homepageonderzoek en ontwerpvoorstel
26 oktober 2026 · Conceptbeelden, geen geïmplementeerde homepage

## Advies
Maak de homepage een rustige kennismaking met drie vragen: wat betaal ik zelf, wat komt eraan en hoeveel werktijd kost dat? Behoud de donkere identiteit en het koraal. Laat een helder productvoorbeeld de aandacht dragen. De rust komt uit de rangorde, leesbare tekst en het weglaten van concurrerende beweging.

De aanbevolen richting heet **Jouw deel. Helder.** De ontwerpgedachte: Slice maakt van een volledig abonnementsbedrag een persoonlijk aandeel; dat aandeel wordt het centrale voorbeeld op de homepage. De naam Slice krijgt daardoor inhoud, zonder decoratieve snijvlakken overal te gebruiken.

## Wat is geleverd?
- `slice-stijlbord.png`: palet, typografie, componenten en inhoudelijke sfeer.
- `slice-homepage-desktop.png`: volledige desktopcompositie.
- `slice-homepage-mobiel.png`: afzonderlijke mobiele compositie.
- Dit document: onderzoek, copy, ontwerpregels en overdracht.
- `slice-generatieprompts.md`: gebruikte prompts voor hergebruik.

## Onderzoeksbasis
De negen aangeleverde screenshots en de productuitleg zijn gelezen als bronmateriaal. De eerste vier beelden vormen de huidige homepage, de overige beelden het productreferentiekader. Screenshots 6 en 7 tonen dezelfde toestand.

Via de GitHub-plugin is [vanleemputsven/Slice](https://github.com/vanleemputsven/Slice) bekeken, branch main, tree-commit `962828052862d865fa4024c5f8dc53b7bdaa8e74`. Onderzocht: package.json, AGENTS.md, README, src/app/page.tsx, src/app/layout.tsx, src/app/globals.css, de eerste 220 regels van src/components/marketing/home-landing.tsx, src/app/demo/page.tsx en de volledige bestandslijst.

Bevestigd in de code:
- Next.js 16, React 19, Tailwind 4, Framer Motion en Supabase zijn aanwezig.
- De homepage gebruikt onder andere een canvasachtergrond, pointer-spotlight, scrolltransformatie, slideshow en ticker.
- De kleuren komen uit globals.css; de werkelijke fontconfiguratie gebruikt Figtree, Syne en JetBrains Mono. Het generieke README noemt nog Geist en is op dit punt geen betrouwbare bron.
- De primaire bestemming wisselt tussen /login en /dashboard.
- Er bestaat een /demo-route.
- Er is een AGENTS.md met Next.js-aanwijzingen. In de onderzochte GitHub-tree staat geen SKILL.md. Eventuele niet-gecommitteerde lokale projectskills zijn hiermee niet onderzocht.

De repository is alleen gelezen. Er is geen code gewijzigd of gepubliceerd.

## Wat de huidige homepage onrustig maakt
1. **Te veel gelijktijdige visuele signalen.** Rood licht, raster, glazen vlakken, meerdere kaders, slideshow-indicatoren en ticker vragen allemaal aandacht. Het productvoorbeeld wordt daarbij juist donker en klein.
2. **De teksten vragen interpretatie.** “Hours, not vibes” en “Cycles line up” vertellen minder direct wat iemand kan doen dan “Ook in uren” en “Jouw deel per maand”.
3. **Een herhaald kaartritme maakt alles even belangrijk.** Vier features, drie stappen en drie beveiligingsblokken hebben vrijwel dezelfde visuele nadruk.
4. **Het logo verdwijnt.** De donkere letters van Slice hebben op de zwarte achtergrond weinig visuele aanwezigheid.
5. **Privacy wordt als techniek uitgelegd.** Postgres, row-level security en sessiechecks horen bij technische documentatie. Op de homepage moet iemand begrijpen wat dat voor diens eigen overzicht betekent.
6. **De eerste actie is onvoldoende menselijk.** Een nieuwe bezoeker wil een overzicht maken; “Dashboard” beschrijft een bestemming zonder het resultaat te verduidelijken.

## Actuele referenties en wat we ervan meenemen
Dit is gericht referentieonderzoek, geen representatief gebruikersonderzoek of bewijs van een universele trend.

| Bron, bekeken op 26 oktober 2026 | Waarneming | Vertaling naar Slice |
| --- | --- | --- |
| [Copilot Money](https://www.copilot.money/) — homepage gelezen en visueel bekeken | Grote resultaatgerichte headline; productuitleg met herkenbare bedragen en dagelijkse situaties. De huidige hero gebruikt ook veel zwevende gekleurde elementen. | Neem de duidelijke uitkomst en concrete productvoorbeelden mee. De drukke hero past niet bij de gewenste rust voor Slice. |
| [Bobby](https://bobbyapp.co/) — homepage gelezen en visueel bekeken | Een korte uitleg van abonnementen bijhouden en een prominente productdemonstratie. | Beperk de eerste boodschap tot één taak. Toon een leesbare uitsnede van het product, zonder groot telefoonframe. |
| [Monarch](https://www.monarch.com/) — homepage-inhoud onderzocht | Overzicht en duidelijkheid worden verbonden aan uitgaven, aankomende posten en persoonlijke doelen. De inhoud bestrijkt veel meer dan abonnementen. | Spreek over wat iemand begrijpt en kan overzien. Houd Slice inhoudelijk klein: eigen invoer, persoonlijke aandelen en geplande afschrijvingen. |
| [W3C: tekstcontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Voor gewone tekst geldt doorgaans minimaal 4,5:1; voor grote tekst 3:1. | Donkere tekst op koraal en goed leesbare secundaire tekst. |
| [W3C: aanraakdoelen](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | WCAG 2.2 AA noemt 24 × 24 CSS-pixels, met uitzonderingen. | Voor Slice kiezen we ruimer: belangrijke knoppen en plus/min-doelen 44–48 pixels. |

Geen beelden, testimonials of claims van concurrenten zijn overgenomen. Bankkoppeling, automatische detectie, pushmeldingen en besparingsgaranties worden niet aan Slice toegeschreven.

## Gekozen ontwerpvaardigheden
**design-taste-frontend** is gebruikt voor artdirection, inhoud vóór vorm, het vermijden van stockkaartgrids en kritische visuele beoordeling. De drie getrokken richtingen waren Borrowed category, Page is the object en Quiet instrument. Gekozen: **Quiet instrument**, seed **1831176669**. Een persoonlijke administratie vraagt hier precisie en rust; een modecampagne of nagebootste kassabon zou de uitleg verdringen.

**imagegen** is gebruikt voor de gevraagde rasterconcepten, via de ingebouwde beeldgenerator. Het stijlbord kreeg een gerichte correctieronde voor de betekenis van het gedeelde bedrag en de componentkeuze.

De gebruiker vroeg afbeeldingen en onderbouwing. Daarom zijn de bouw-, browserinspectie- en animatietests van de frontend-skill niet uitgevoerd. De generieke richting bevatte ook testimonials en fotografie; die zijn niet gebruikt omdat er geen echte klantuitspraken of relevante productfotografie zijn. Er is geen fictief bewijs toegevoegd. De compositieprincipes zijn toegepast op een beeldconcept, geen live interface.

## Stijlregels
### Kleur
| Rol | Waarde | Toepassing |
| --- | --- | --- |
| Canvas | #0B0C0F | Hoofdachtergrond |
| Productvlak | #14161C | Voorbeelden, rekentool |
| Tweede productvlak | #1C1F27 | Velden en actieve gebieden |
| Hoofdtekst | #F6F7FB | Koppen en belangrijke inhoud |
| Secundaire tekst | #B5BCCC | Toelichting, datums |
| Koraal | #FF584D | Primaire actie, jouw aandeel |
| Tekst op koraal | #0B0C0F | Knoppen en labels |

Koraal blijft een herkenbaar merkaccent. Gebruik het doelgericht; geen rode gloed over hele secties. Laat kleur nooit als enige uitleg dienen: elk bedrag krijgt een label.

Berekend op de opgegeven effen kleuren: #0B0C0F op #FF584D is ongeveer **6,29:1**; #F6F7FB op #FF584D ongeveer **2,90:1**. #B5BCCC op het canvas geeft ongeveer **10,27:1**. Dit zijn berekeningen van kleurparen, geen audit van alle pixels in de gegenereerde beelden.

### Typografie
Gebruik **Figtree** als hoofdlettertype van de marketingpagina. Het is al aanwezig en geeft de pagina een vriendelijker, rustiger ritme. Gebruik gewichten 400, 500 en 600/700. Bedragen krijgen tabular figures; lijn ze rechts uit in lijsten. Geen monospace labels in marketingtekst. De bestaande JetBrains Mono mag binnen authentieke dashboardbeelden blijven bestaan.

Richtwaarden voor implementatie:
- H1: circa 64–72 px desktop, 34–38 px mobiel, maximaal twee regels waar de breedte dit toelaat.
- Sectiekoppen: 32–36 px desktop, 26–30 px mobiel.
- Body: 18 px desktop, 17 px mobiel, regelhoogte circa 1,5.
- Bijschriften: 14–15 px; geen essentiële uitleg in zeer kleine letters.
- Regelbreedte voor lopende tekst: circa 45–65 tekens.

### Compositie
Een leeslijn met een dominant productvoorbeeld. Header maximaal 1120 px breed; hoofdinhoud circa 960 px, lopende tekst 560–680 px. Productvoorbeelden mogen breder zijn dan de tekst. De desktopafbeelding werkt middenin met twee kolommen voor uitleg en bewijs; mobiel worden die gestapeld.

Desktop tussen secties circa 96–120 px; mobiel 56–72 px. Binnen secties 16–32 px. Links en rechts gelijke marges: 24 px mobiel en een gecentreerde container op desktop.

Vlakken zijn effen. Een kaart bestaat alleen als die echte productinhoud groepeert. Geen identieke marketingkaarten met pictogrammen erboven. Dunne rijen mogen binnen een echte gegevenslijst, maar niet als decoratief paginaraster.

## Inhoud en definitieve copy
### Navigatie
Logo · Zo werkt het · NL/EN · Inloggen.

De desktopafbeelding bevat ook “Vragen”. Laat die link alleen staan als de hieronder beschreven FAQ wordt toegevoegd; anders schrappen. Geen dood navigatie-item.

### Hero
**Abonnementen, helder.**

Zie wat jij betaalt, wat eraan komt en hoeveel werktijd het kost. Jij vult in, Slice rekent mee.

Primair: **Maak mijn overzicht**  
Secundair: **Bekijk een voorbeeld**  
Toelichting: **Geen bankkoppeling nodig.**

Voor bestaande ingelogde gebruikers wordt de primaire actie **Open mijn overzicht**.

### Productbewijs
**Jouw deel per maand**  
**€67,50**

Streaming €12,50 · Teamtools €6,00 · Fitness €49,00  
Bijschrift: **Voorbeeldgegevens — 3 abonnementen.**

De getoonde maandbedragen zijn illustratief. Ze zijn geen persoonlijke gegevens en worden niet automatisch toegevoegd. Gebruik deze eenvoudige set overal consistent. De €134,48 uit de aangeleverde dashboardscreenshot hoort bij een andere, grotere voorbeeldset.

### Delen
**Samen delen. Jouw deel zien.**

Vul het volledige bedrag in en met hoeveel personen je deelt. Slice rekent jouw aandeel uit.

Rekentool: maandprijs €25,00; personen 2, inclusief jezelf; resultaat €12,50 voor jou. De andere helft is €12,50. Noem dit geen betaling of onderlinge afrekening: de tool maakt alleen het aandeel inzichtelijk.

### Vooruitkijken
**Weet wat eraan komt.**

Bekijk je geplande afschrijvingen voor de komende 14 dagen.

Voorbeeld op 26 oktober 2026: Streaming op 28 oktober €12,50; Teamtools op 28 oktober €6,00; Fitness op 1 november €49,00. Totaal €67,50. Voor een live demo datums relatief genereren of expliciet als vaste voorbeeldperiode tonen.

### Werktijd
**Ook in uren.**

**3 u 23 min**

Bij €20 netto per uur kost €67,50 per maand ongeveer 3 uur en 23 minuten werk.

Berekening: 67,50 / 20 = 3,375 uur = 3 uur 22,5 minuten. Rond op minuten af voor deze marketingweergave. Het uurloon is door de gebruiker opgegeven; het is geen aanname over diens inkomen.

### Afsluiting
**Begin met één abonnement.**

Voeg een dienst, bedrag en datum toe. Delen kan meteen.

**Maak mijn overzicht**

Je vult je gegevens zelf in. Je overzicht hoort bij je account.

### Optionele compacte FAQ
Deze tekst staat niet in de afbeeldingen. Voeg haar alleen toe als “Vragen” in de navigatie blijft.
- **Koppelt Slice mijn bank?** Nee. Je vult zelf je abonnementen, bedragen en datums in.
- **Wat als ik jaarlijks betaal?** Slice rekent jouw aandeel om naar een maandbedrag voor het overzicht. Bij afschrijvingen zie je het bedrag van de betreffende betaling. €120 per jaar gedeeld met twee is €5 per maand en €60 per afschrijving.
- **Zegt Slice abonnementen op?** Nee. Slice helpt je overzicht te houden. Opzeggen regel je bij de aanbieder.

## Interactie en mobiele afspraken
- De kleine deelcalculator is de enige speelse interactie. Een wijziging in personen of maandprijs past het bedrag en de verhouding aan. Geen account nodig voor het proberen.
- Minimaal één persoon; alleen hele personen. Geen negatieve prijs. Lege of ongeldige invoer geeft een korte melding naast het veld. Bedragen met komma accepteren.
- Demo-invoer blijft los van accountgegevens. Nooit automatisch opslaan of bestaande abonnementen overschrijven.
- Voor “Bekijk een voorbeeld” is /demo een bestaande mogelijke bestemming; controleer de inhoud en werking bij implementatie.
- De bestaande uitgebreide scan blijft bereikbaar via de demopagina of een secundaire route, in plaats van als lange extra taak onderaan de homepage. Behoud de bestaande sessie- en importregels.
- Mobiel: body en daarna voorbeeld, geen horizontale tabel, bedrag rechts met voldoende ruimte, volledige knopbreedte. Bij weinig ruimte prijs en personen onder elkaar.
- Labels blijven zichtbaar; geen uitleg die uitsluitend bij hover verschijnt.
- NL/EN en inloggen moeten bij 320 px passen; eventueel een tweede headerregel. Geen kleine aanraakdoelen om alles geforceerd op één rij te houden.
- Focus zichtbaar, calculator met toetsenbord bruikbaar, resultaat discreet aankondigen voor schermlezers.
- Beweging functioneel: knopfeedback circa 150 ms, verandering van verdeling circa 200 ms. Geen automatische slideshow, ticker, cursorachtergrond of parallax. Reduced motion respecteren.
- Content direct zichtbaar, ook als scripts uitvallen.

## Overdracht voor de bouw
Werk vooral in HomeLanding en de marketingcomponenten. Behoud authenticatie, taalvoorkeuren, onboarding en de berekeningsregels. Laat het ingelogde dashboard buiten deze homepagewijziging.

Gebruik het originele SVG-logo uit de repo; maak het woordmerk licht op donker. De gegenereerde markeringen zijn benaderingen en vormen geen nieuw logo.

Begin met de inhoud en statische layout. Verwijder daarna de concurrerende achtergrondeffecten uit de homepage. Pas de calculator in als afgebakend onderdeel. Scope nieuwe stijlen op marketing zodat wijzigingen aan knoppen of fonts niet onbedoeld het dashboard veranderen.

Verifieer bij de bouw op 1440, 768, 390 en 320 px: geen horizontale overflow, correcte tekstafbreking, focusvolgorde, beide talen, inloggen/ingelogde CTA, calculatorvalidatie, reduced motion en de juiste demo-route. Bewaak het verschil tussen maandbedrag en werkelijke afschrijving.

## Visuele beoordeling en grenzen
De afbeeldingen zijn handmatig bekeken op hiërarchie, leesbaarheid, bedragen en samenhang. De sterkste verbetering is dat de belofte en het voorbeeld direct leesbaar worden. De deelcalculator geeft het merk een eigen inhoudelijk moment. De mobiele versie is een echte stapeling en geen verkleinde desktop.

De eerste stijlbordversie beeldde het volledige bedrag misleidend af als één helft. Dat is in de definitieve versie gecorrigeerd naar twee gelijke delen van €12,50.

Nog precies vast te leggen tijdens uitvoering:
- De generator tekent hier en daar subtiele textuur, verlopen en glans ondanks de instructie voor effen vlakken. Gebruik de effen kleurwaarden uit dit document.
- De knopvorm is in de pagina-afbeeldingen minder rond dan op het stijlbord. Definitieve afspraak: pilvorm, straal 999 px.
- De percentages in de desktopbalk zijn overbodig en gebruiken een punt. Laat ze weg; de bedragen in de lijst vertellen genoeg.
- Het stijlbord toont lichte tekst op een koraalvlak. Gebruik daar donkere tekst of zet de labels buiten de balk.
- De demonstraties zijn geen nauwkeurige reproducties van de huidige componenten. Lettervormen en logo's zijn benaderd.
- De mobiele afbeelding oogt op ware 390px-breedte op enkele plekken compacter dan de doelmaten. De opgegeven CSS-maten zijn leidend.
- “Geen schattingen” op het stijlbord is alleen een stijltekst. Gebruik dit niet als productclaim: er is immers een scan met bandbreedtes. De copysectie hierboven is de definitieve tekstbron.
- Er is geen werkende homepage, gebruikersproef of gemeten conversieverbetering opgeleverd. Een browserinspectie, toegankelijkheidsaudit en werkende-interactietest horen bij de bouwfase.

Subjectieve ontwerpbeoordeling: hiërarchie 8/10, inhoudelijke duidelijkheid 9/10, merkcontinuïteit 8/10, eigenheid 7,5/10, overdraagbaarheid 8/10. Dit zijn eigen ontwerpinschattingen, geen gebruikersmetingen. De richting is bewust rustig; de onderscheidende waarde moet tijdens de bouw vooral uit de correcte, direct bruikbare deelcalculator komen.

