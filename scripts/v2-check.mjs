// /v2 check on the production build (starts `next start` and a stand-in CRM itself, stops both).
//   npm run build && node scripts/v2-check.mjs <outDir>
// Desktop 1440x900 with a mouse, headless Chrome: for /v2, /en/v2 and /for/<test token>/v2 prints every
// three.js request (must be none), whether the hero moves in its first 3 s (screenshots compared), the
// copy that is there at first paint, the business shown, console errors; then flips the lamp and
// scrolls the hand-over. Compares /for/<token> with /for/<token>/v2. Screenshots go to <outDir>.
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const { chromium } = createRequire(path.join(root, "../universal-trades/package.json"))("playwright");
const outDir = process.argv[2] ?? path.join(root, "../_shots/v2");
const PORT = 4257;
const CRM = 4258;
const ORIGIN = `http://localhost:${PORT}`;
const TOKEN = "v2-test-token-0001";

// A lead as the CRM sends it
const lead = {
  lang: "sr",
  name: "Elektro Dunav Petrović",
  shortName: "Elektro Dunav",
  area: "Zrenjanin",
  phone: "+381231234567",
  phoneDisplay: "023 123 4567",
  address: { street: "Kralja Petra I 7", city: "Zrenjanin", region: "Banat", postal: "23000", country: "RS" },
  timezone: "Europe/Belgrade",
  hours: null,
  hoursSummary: "Pon–Sub 7–20, hitno 0–24",
  rating: { value: 4.8, count: 63 },
};
const crm = createServer((req, res) => {
  const ok = req.url === `/api/demos/public/${TOKEN}`;
  res.writeHead(ok ? 200 : 404, { "content-type": "application/json" });
  res.end(ok ? JSON.stringify(lead) : "{}");
}).listen(CRM);

const env = { ...process.env, CRM_API_URL: `http://localhost:${CRM}/api` };
delete env.NODE_USE_SYSTEM_CA;
const server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: root, shell: true, env, stdio: "ignore" });

const THREE = /WebGLRenderer|THREE\.REVISION|__THREE__/;

async function visit(browser, route, name, { flip = false, scroll = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  const reqs = [];
  const bodies = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) => reqs.push(r.url()));
  page.on("response", (r) => r.request().resourceType() === "script" && bodies.push(r.text().then((t) => ({ url: r.url(), t })).catch(() => ({ url: r.url(), t: "" }))));
  const t0 = Date.now();
  await page.goto(ORIGIN + route, { waitUntil: "commit" });
  await page.waitForSelector("#hero-title");
  const first = await page.evaluate(() => {
    const vis = (el) => el && getComputedStyle(el).opacity !== "0" && el.getBoundingClientRect().height > 0;
    const call = document.querySelector('#top a[href^="tel:"]');
    return { h1: document.querySelector("#hero-title").innerText.replace(/\s+/g, " "), h1Visible: vis(document.querySelector("#hero-title")), call: call?.innerText.trim() ?? null, callVisible: vis(call) };
  });
  const shots = [];
  for (const at of [250, 900, 1700, 2900]) {
    const wait = at - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    shots.push(await page.screenshot({ path: path.join(outDir, `${name}-t${at}.png`) }));
  }
  const moved = shots.slice(1).map((b, i) => !b.equals(shots[i]));
  await page.waitForLoadState("load");
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => ({
    header: document.querySelector("header a[aria-label]")?.getAttribute("aria-label"),
    lamp: Boolean(document.querySelector(".lamp-stage")) && getComputedStyle(document.querySelector(".lamp-stage")).display !== "none",
    canvasReady: document.querySelector(".hero-canvas")?.dataset.ready === "true",
    stillImg: document.querySelector(".hero-still img")?.currentSrc.slice(0, 40),
    area: document.querySelector("#top p")?.innerText,
    rating: document.querySelector("#top strong")?.innerText,
    lang: document.documentElement.lang,
    langLinks: [...document.querySelectorAll('[role="group"] a')].map((a) => a.getAttribute("href")),
  }));
  let flipNote = "";
  if (flip) {
    await page.locator(".lamp-switch").click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, `${name}-off.png`) });
    const off = await page.evaluate(() => [document.querySelector(".lamp-stage").dataset.power, document.querySelector(".lamp-switch").getAttribute("aria-label")]);
    await page.locator(".lamp-switch").click();
    await page.waitForTimeout(1200);
    const on = await page.evaluate(() => [document.querySelector(".lamp-stage").dataset.power, document.querySelector(".lamp-switch").getAttribute("aria-label")]);
    flipNote = ` · switch: ${off.join(" / ")} -> ${on.join(" / ")}`;
  }
  if (scroll) {
    for (const f of [0.25, 0.55, 0.9]) {
      const y = await page.evaluate((v) => Math.round(document.getElementById("top").offsetHeight * v - innerHeight * v), f);
      await page.evaluate((v) => (window.__lenis ? window.__lenis.scrollTo(v, { immediate: true }) : window.scrollTo(0, v)), y);
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(outDir, `${name}-scroll-${f}.png`) });
    }
    flipNote += ` · --fly at end: ${await page.evaluate(() => document.getElementById("top").style.getPropertyValue("--fly"))}`;
    // the whole page, a screen at a time
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    let n = 0;
    for (let y = 0; y < total; y += 900) {
      await page.evaluate((v) => (window.__lenis ? window.__lenis.scrollTo(v, { immediate: true }) : window.scrollTo(0, v)), y);
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${name}-page-${String(n++).padStart(2, "0")}.png`) });
    }
  }
  const all = await Promise.all(bodies);
  const three = all.filter((b) => THREE.test(b.t));
  const threeReqs = reqs.filter((u) => /three|panelScene/i.test(u));
  console.log(
    `${route}\n  first paint: "${first.h1}" visible=${first.h1Visible} · Call ${first.call} visible=${first.callVisible}` +
      `\n  hero moved 0.25→0.9→1.7→2.9 s: ${moved.join(", ")} · lamp shown: ${info.lamp} · 3D canvas live: ${info.canvasReady} · still: ${info.stillImg}` +
      `\n  header: ${info.header} · ${info.area} · rating ${info.rating} · lang ${info.lang} · lang links ${info.langLinks.join(" ")}${flipNote}` +
      `\n  requests: ${reqs.length} · three.js scripts: ${three.length} (${three.reduce((s, b) => s + b.t.length, 0)} bytes) · three/panelScene URLs: ${threeReqs.length}` +
      `\n  ${errors.length ? "errors:\n    " + errors.join("\n    ") : "no console errors"}`,
  );
  await ctx.close();
}

try {
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(ORIGIN + "/robots.txt")).ok) break;
    } catch {}
    if (i > 120) throw new Error("server did not start");
    await new Promise((res) => setTimeout(res, 250));
  }
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  await visit(browser, "/v2", "v2", { flip: true, scroll: true });
  await visit(browser, "/en/v2", "en-v2");
  await visit(browser, `/for/${TOKEN}`, "for");
  await visit(browser, `/for/${TOKEN}/v2`, "for-v2", { flip: true });
  await visit(browser, "/", "root");
  await browser.close();
} finally {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
  crm.close();
}
