// Renders the hero fallback stills from the real 3D scene, so the first paint and the WebGL frame
// match. Run after a build, then build again:   node scripts/capture-stills.mjs
import { createRequire } from "node:module";
import path from "node:path";
import { ORIGIN, openBrowser, openPage } from "./offline.mjs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const out = path.resolve(import.meta.dirname, "../src/assets/hero");

const SHOTS = [
  { name: "dim-wide", still: "off", width: 1600, height: 1000 },
  { name: "lit-wide", still: "on", width: 1600, height: 1000 },
  { name: "dim-tall", still: "off", width: 430, height: 860, scale: 2, mobile: true },
  { name: "lit-tall", still: "on", width: 430, height: 860, scale: 2, mobile: true },
];

const browser = await openBrowser();
for (const s of SHOTS) {
  const page = await openPage(browser, s);
  await page.goto(`${ORIGIN}/?still=${s.still}`, { waitUntil: "load" });
  await page.addStyleTag({ content: "header,[data-stage]>*:not(canvas),.fixed{visibility:hidden!important} [data-stage] .hero-canvas{visibility:visible!important;opacity:1!important;transition:none!important}" });
  await page.waitForSelector('canvas[data-ready="true"]', { timeout: 90000 });
  await page.waitForTimeout(2500);
  const png = await page.screenshot();
  await sharp(png).jpeg({ quality: 76, mozjpeg: true, progressive: true }).toFile(path.join(out, `${s.name}.jpg`));
  console.log(s.name, page.errors.slice(0, 3));
  await page.context().close();
}
await browser.close();
