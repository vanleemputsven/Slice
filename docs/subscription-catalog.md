# Subscription catalog prices

The add-a-charge picker shows public list prices so someone can tap a plan instead of typing a number they will look up later. The amount is still theirs to change. A country with no checked price shows the service and asks for the amount. We do not copy a neighbour's price into that gap.

The prices live in `src/lib/subscriptions/catalog.ts`. This page is the record of where each figure came from. Checked again as a set on 26 October 2026. Euro amounts open on Belgium. The figures are list prices, not a person's bill, and they will go stale.

Countries in the picker: Belgium, the Netherlands, France, Germany, the United Kingdom, and the United States. A service with `only` is a local platform and stays in that country. Paramount+ is hidden in Belgium because it is not sold there on its own.

## What is priced

| Service | Regions | What we stored | Source |
| --- | --- | --- | --- |
| Netflix | BE, NL, FR, DE, GB, US | BE Basic €10.99, Standard €16.99, Premium €21.99. No ads plan. NL Basic €9.99, Standard €15.99, Premium €20.99. FR ads €7.99, Standard €14.99, Premium €21.99. DE ads €6.99, Standard €15.99, Premium €21.99. GB ads £7.99, Standard £13.99, Premium £20.99. US ads $8.99, Standard $19.99, Premium $26.99, before sales tax. | [Netflix prices checked 17 October 2026](https://devrunners.com/blog/netflix-price-by-country) against Netflix's plan pages. US amounts match [Netflix Help](https://help.netflix.com/en/node/24926). Ads in Belgium and the Netherlands start 1 March 2027 and had no price yet. |
| Spotify | BE, NL, FR, DE, GB, US | BE and NL: Student €6.99, Individual €13.99, Duo €19.99, Family €23.99. FR €7.07 / €12.14 / €17.20 / €21.24. DE €6.99 / €12.99 / €17.99 / €21.99. GB £5.99 / £12.99 / £17.99 / £21.99. US $6.99 / $12.99 / $18.99 / $21.99. | Belgium Individual and Student re-read on [Spotify Belgium](https://www.spotify.com/be-nl/premium/) on 26 October 2026. Duo and Family in Belgium and the Netherlands, and the other four countries, from [Geonode, collected from Spotify's own pages on 8 October 2026](https://geonode.com/blog/spotify-premium-prices-by-country). |
| Disney+ | BE, NL | Ads €6.99, Standard €10.99 or €109.90 a year, Premium €15.99 or €159.90 a year. | Belgium Standard and Premium: [Disney+ help, 4 May 2026](https://help.disneyplus.com/en-GB/article/disneyplus-en-be-price). The ads tier is the third plan on [Telenet](https://www2.telenet.be/residential/en/products/telenet-tv/disneyplus.html) and in the [19 October 2026 comparison](https://www.comparer-abonnement-tv.be/en/blog/streaming/streaming-subscriptions-in-belgium-what-the-stack-costs). Netherlands: the same monthly and yearly figures in [AndroidPlanet, 26 January 2026](https://www.androidplanet.nl/nieuws/streamingdienst-prijzen-overzicht/). Not re-read from a Dutch Disney page on 26 October. |
| Prime Video | BE | With ads €2.99 a month or €25 a year. Without ads €4.98 a month. | [Comparer Abonnement TV, prices checked 19 October 2026](https://www.comparer-abonnement-tv.be/en/blog/streaming/streaming-subscriptions-in-belgium-what-the-stack-costs). |
| YouTube Premium | BE | Lite €8.99, Student €8.99, Individual €14.99, Family €27.99. | [RTBF, 24 August 2026](https://www.rtbf.be/article/youtube-premium-augmente-ses-prix-en-europe-qu-en-est-il-de-la-belgique-11774465). The Telenet bundle at €13.99 is an operator price and is not the catalog price. Not re-read from YouTube on 26 October. |
| HBO Max | BE, NL | BE €6.99 / €10.99 / €15.99 a month, and €69.90 / €109 / €159 a year. NL €5.99 / €11.99 / €16.99 a month, and €59.90 / €119 / €169 a year. | Belgium monthly tiers match Telenet ("from €6.99") and the 19 October 2026 comparison. Yearly pairings from that comparison. Netherlands from AndroidPlanet, 26 January 2026, not re-read on 26 October. |
| Apple TV | BE, NL, FR | €9.99 a month. | Belgium: Telenet. France: public price on the [Canal+ tariff sheet valid 15 October to 9 November 2026](https://static.canal-plus.net/boutique/infos-legales/Fiches-Tarifaires-Canal.pdf). Netherlands: AndroidPlanet, 26 January 2026. |
| Streamz | BE only | Basic with ads €9.99, Premium €14.99, Premium+ €22.99 a month. Yearly totals €95.88, €143.88 and €215.88. | [Streamz help](https://customerservice.streamz.be/nl/knowledge/hoeveel-kost-streamz). A VTM help article lists the same monthly rates but a yearly total of €83.88 for Basic, which is not 7.99 × 12. The catalog uses Streamz's own total. |
| VTM GO+ | BE only | €4.95 a month, or €3.95 a month on a yearly term. Both are monthly debits. | [VTM GO help](https://customerservice.vtmgo.be/hc/nl/articles/360001284137-Zijn-er-kosten-aan-het-gebruik-van-de-VTM-GO-app). |
| Play Sports | BE only | Play Sports + DAZN Total €34.99 a month. | [Telenet press release for the 2026–2027 season](https://press.telenet.be/play-sports-presenteert-het-meest-complete-sportaanbod-van-belgie). The €24.99 for three months was a launch offer and is not stored. A smaller Play Sports tier is not stored, because the release did not give it a standing price of its own. |
| DAZN | BE price, shown everywhere | Total flexible €29.99 a month. Total on a 12-month term €24.99 a month. Both are monthly debits. | [DAZN Belgium help](https://www.dazn.com/nl-BE/help/articles/16184063399709-dazn-plannen-en-prijzen). The season offer that ended 21 September 2026 is not stored. Other countries are not priced from the Belgian page. |
| Videoland | NL only | Basis €6.99, Plus €11.99, Premium €14.99. | [Videoland](https://www.videoland.com/abonnementen), matching the prices in force since 3 March 2026. |
| NLZIET | NL only | Basis €7.95, Premium €9.95 or €107.40 a year, Extra €11.95 or €131.40 a year. | [NLZIET](https://www.nlziet.nl/nl/over-nlziet/abonnementen/). |
| Canal+ | FR only | Canal+ €24.99 a month, the list price without a lock-in. | Canal+ tariff sheet, indicative price as of 17 September 2026, sheet valid 15 October to 9 November 2026. The €19.99 for the first 12 months of a 24-month term is a promotion and is not stored. |
| Paramount+ | Hidden in BE. Priced in FR. | Standard €7.99 a month, 2 screens. | Public price in the same Canal+ tariff sheet. [CallMePower, October 2026](https://callmepower.be/fr/telecom/guides/comparatifs/prix-abonnements-streaming), says Paramount+ is not sold on its own in Belgium. |
| NOW | GB only | Entertainment £7.99 a month, the flexible price. | [NOW offers](https://www.nowtv.com/offers). The six-month discount is not stored. |
| Crunchyroll | BE | Fan €7.99. | Belgium App Store, collected 23 October 2026, [Puley Belgium price table](https://puley.com/prices/data/countries/be.csv). Not re-opened on 26 October. |
| iCloud+ | BE, NL, FR, DE, GB, US | Euro and US: 50 GB 0.99, 200 GB 2.99, 2 TB 9.99, 6 TB 29.99, 12 TB 59.99. UK: £0.99, £2.99, £8.99, £26.99, £54.99. | [Apple's iCloud+ pricing, published 16 September 2026](https://support.apple.com/en-us/108047). Belgium, the Netherlands, France and Germany use the Euro row. US prices can have sales tax added. |
| Google One | BE | 100 GB €1.99, 200 GB €2.99. | Belgium App Store, 26 October 2026, same Puley table. The Google plans page served US dollars from this check, so the euro figures stay the App Store ones. |
| Notion | BE | Plus €12.99. | Belgium App Store, 25 October 2026, same table. |
| Microsoft 365 | BE price, shown everywhere | Personal €10 a month or €99 a year. Family €13 a month or €129 a year, up to 6 people. | [Microsoft Store Belgium](https://www.microsoft.com/nl-be/microsoft-365/buy/compare-all-microsoft-365-products). |
| ChatGPT | BE | Go €7.99, Plus €22.99. | Belgium App Store, 26 October 2026. The web price can differ. |
| Claude | BE | Pro €22. | Belgium App Store, 26 October 2026. |
| Apple Music | BE price, shown everywhere | Student €6.99, Individual €11.99, Family €19.99 for up to 6 people. | [Apple Music Belgium](https://www.apple.com/befr/apple-music/). |
| PlayStation Plus | BE price, shown everywhere | Essential €9.99 or €71.99 a year. Extra €15.99 or €125.99. Premium €18.99 or €151.99. | [PlatPrices, read from the Belgium PlayStation Store on 23 October 2026](https://platprices.com/ps-plus-prices/belgium/). The three-month cards are not stored. |
| Xbox Game Pass | BE price, shown everywhere | Premium €12.99 a month. Ultimate €20.99 a month. | [Xbox Store Belgium](https://www.xbox.com/nl-BE/games/store/xbox-game-pass-ultimate/cfq7ttc0khs0). Essential had no price on that card, so it is not stored. |

Screen counts on Netflix Standard and Premium (2 and Full HD, 4 and Ultra HD) follow the Belgium plan page. The same shape is used in the other Netflix countries. US Netflix rows say the price is before sales tax, which is how Netflix describes the US price.

Spotify Duo and Family, YouTube Family, Apple Music Family, and Microsoft 365 Family carry a household size. That number prefills the split. It is not applied until the person says they share the bill. A Netflix screen count is not a household.

## Shown without a price

Deezer, TIDAL, Dropbox, and Nintendo Switch Online. RTL+ in Germany, Sky in Germany and the United Kingdom, Hulu and Peacock in the United States. Paramount+ outside Belgium and France. Fitness, mobile, and internet, so a gym or a telecom bill can be tapped and typed. A name that is not in the list can be added on the same screen.

These stay unpriced because a current provider page for that country was not in hand. Guessing a neighbour's price would put the wrong amount on the row.

## Icons

Glyphs come from Simple Icons 16.36.0 (CC0) where that set has the brand. A near-black ink is drawn light on the dark canvas. A saturated color stays, including red, so YouTube, Videoland, and Nintendo keep their own red.

Simple Icons does not ship Disney+, Prime Video, Peacock, Xbox, Nintendo, Hulu, Microsoft 365, ChatGPT, or the local platforms. Those marks are vendored in `src/lib/subscriptions/brand-marks-extra.ts`, each one only to name that service:

- CoreUI Brands 2.0.1, CC0: Xbox, Nintendo, Hulu.
- SVG Logos, CC0: the OpenAI knot for ChatGPT, and the four Microsoft squares.
- selfh.st icons, CC BY 4.0, © selfh.st: Disney+ (light), Prime Video (light), Peacock.
- Arcticons, CC BY-SA 4.0, © Arcticons Team: VTM GO, Videoland, NLZIET, Canal+.

Streamz and Play Sports have no mark in those sets. Custom Brand Icons includes a Streamz glyph under CC BY-NC-SA, which this app does not use. They keep a Lucide pictogram (ISC) on the service color, as do Fitness, Mobile, and Internet, which are categories rather than brands. A name that is not in the catalog still falls back to its initials.
