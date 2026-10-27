import fs from "node:fs";

const dir = `${process.env.TEMP}/logo-check`;
const files = [
  "disney-light.svg",
  "prime-light.svg",
  "selfhst-peacock.svg",
  "cib-xbox.svg",
  "cib-nintendo.svg",
  "cib-hulu.svg",
  "cib-microsoft.svg",
  "logos-openai-icon.svg",
  "arcticons-vtmgo.svg",
  "arcticons-videoland.svg",
  "arcticons-nlziet.svg",
  "arcticons-mycanal.svg",
];

for (const file of files) {
  const text = fs.readFileSync(`${dir}/${file}`, "utf8");
  const viewBox = text.match(/viewBox="([^"]+)"/)?.[1] ?? "?";
  const fills = [...new Set([...text.matchAll(/fill="([^"]+)"/g)].map((match) => match[1]))];
  const strokes = [...new Set([...text.matchAll(/stroke="([^"]+)"/g)].map((match) => match[1]))];
  const paths = (text.match(/<path/g) ?? []).length;
  console.log(`${file} vb=${viewBox} paths=${paths} fills=${fills.join("|")} strokes=${strokes.join("|")}`);
}
