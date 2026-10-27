import fs from "node:fs";

const dir = `${process.env.TEMP}/logo-check`;

function read(file) {
  const text = fs.readFileSync(`${dir}/${file}`, "utf8");
  const viewBox = text.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error(`No viewBox in ${file}`);
  const paths = [...text.matchAll(/\bd="([^"]*)"/g)].map((match) => match[1]);
  const fills = [...text.matchAll(/fill="([^"]+)"/g)].map((match) => match[1]);
  return { viewBox, paths, fills };
}

function mark({ hex, viewBox, paths, stroke, fills }) {
  const entry = { hex, viewBox, path: paths[0] };
  if (paths.length > 1) entry.paths = paths;
  if (stroke) entry.stroke = stroke;
  if (fills) entry.fills = fills;
  return entry;
}

const disney = read("disney-light.svg");
const prime = read("prime-light.svg");
const peacock = read("selfhst-peacock.svg");
const xbox = read("cib-xbox.svg");
const nintendo = read("cib-nintendo.svg");
const hulu = read("cib-hulu.svg");
const microsoft = read("logos-microsoft-icon.svg");
const openai = read("logos-openai-icon.svg");
const vtmgo = read("arcticons-vtmgo.svg");
const videoland = read("arcticons-videoland.svg");
const nlziet = read("arcticons-nlziet.svg");
const canal = read("arcticons-mycanal.svg");

const marks = {
  disney: mark({ hex: "FFFFFF", viewBox: disney.viewBox, paths: disney.paths }),
  prime: mark({ hex: "FFFFFF", viewBox: prime.viewBox, paths: prime.paths }),
  peacock: mark({
    hex: "6C4AB6",
    viewBox: peacock.viewBox,
    paths: peacock.paths,
    fills: [...peacock.fills, "#F6F7FB"],
  }),
  xbox: mark({ hex: "107C10", viewBox: xbox.viewBox, paths: xbox.paths }),
  nintendo: mark({ hex: "E60012", viewBox: nintendo.viewBox, paths: nintendo.paths }),
  hulu: mark({ hex: "1CE783", viewBox: hulu.viewBox, paths: hulu.paths }),
  microsoft365: mark({
    hex: "00ADEF",
    viewBox: microsoft.viewBox,
    paths: microsoft.paths,
    fills: microsoft.fills,
  }),
  chatgpt: mark({ hex: "10A37F", viewBox: openai.viewBox, paths: openai.paths }),
  vtmgo: mark({ hex: "FFE14A", viewBox: vtmgo.viewBox, paths: vtmgo.paths, stroke: 1.75 }),
  videoland: mark({
    hex: "E30613",
    viewBox: videoland.viewBox,
    paths: videoland.paths,
    stroke: 1.75,
  }),
  nlziet: mark({ hex: "C084FC", viewBox: nlziet.viewBox, paths: nlziet.paths, stroke: 1.75 }),
  canal: mark({ hex: "F4F1EA", viewBox: canal.viewBox, paths: canal.paths, stroke: 1.75 }),
};

const header = `/**
 * Logos Simple Icons 16.36.0 does not ship. Each one is used only to name that service.
 *
 * CoreUI Brands 2.0.1, CC0 — Xbox, Nintendo, Hulu.
 * https://github.com/coreui/coreui-icons
 *
 * SVG Logos, CC0 — OpenAI knot for ChatGPT, and the four Microsoft squares.
 * https://github.com/gilbarbara/logos
 *
 * selfh.st icons, CC BY 4.0 — Disney+ (light), Prime Video (light), Peacock.
 * © selfh.st, https://github.com/selfhst/icons
 * https://creativecommons.org/licenses/by/4.0/
 *
 * Arcticons, CC BY-SA 4.0 — VTM GO, Videoland, NLZIET, Canal+.
 * © Arcticons Team, https://github.com/Arcticons-Team/Arcticons
 * https://creativecommons.org/licenses/by-sa/4.0/
 */
export const EXTRA_BRAND_MARKS = `;

fs.writeFileSync(
  new URL("../src/lib/subscriptions/brand-marks-extra.ts", import.meta.url),
  `${header}${JSON.stringify(marks, null, 2)};\n`,
);
console.log("wrote", Object.keys(marks).join(", "));
