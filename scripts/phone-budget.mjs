// Phone budget on the production build. Starts `next start` itself, measures, stops it.
//   npm run build && node scripts/phone-budget.mjs [route…]   routes without the leading slash; default: "" and en
// Headless Chrome at 375 px, 4x CPU slowdown, slow 4G (Lighthouse's numbers: 150 ms RTT, 1.6 Mbps),
// scrolled top to bottom. Prints JS (compressed), fonts, three.js bytes, LCP, CLS, TBT, errors.
// Playwright is borrowed from ../universal-trades.
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const { chromium } = createRequire(path.join(root, "../universal-trades/package.json"))("playwright");
const routes = (process.argv.slice(2).length ? process.argv.slice(2) : ["", "en"]).map((r) => "/" + r.replace(/^\/+/, ""));
const width = Number(process.env.WIDTH ?? 375);
const height = 812;
const PORT = 4251;
const ORIGIN = `http://localhost:${PORT}`;

const env = { ...process.env, CRM_FIXTURES: "1" };
delete env.NODE_USE_SYSTEM_CA;
const server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: root, shell: true, env, stdio: "ignore" });
const stop = () => {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
};

async function measure(browser, route) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const info = new Map();
  const sizes = new Map();
  const finishedAt = new Map();
  cdp.on("Network.responseReceived", (e) => info.set(e.requestId, { url: e.response.url, type: e.type }));
  cdp.on("Network.loadingFinished", (e) => {
    sizes.set(e.requestId, e.encodedDataLength);
    finishedAt.set(e.requestId, e.timestamp);
  });
  let loadTs = Infinity;
  await cdp.send("Page.enable");
  cdp.on("Page.loadEventFired", (e) => (loadTs = e.timestamp));
  const bodies = [];
  page.on("response", (r) => {
    if (r.request().resourceType() === "script") bodies.push(r.text().then((t) => ({ url: r.url(), t })).catch(() => ({ url: r.url(), t: "" })));
  });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.addInitScript(() => {
    window.__m = { lcp: 0, lcpEl: "", cls: 0, tasks: [], fcp: 0 };
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (e.name === "first-contentful-paint") window.__m.fcp = e.startTime;
    }).observe({ type: "paint", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__m.lcp = e.startTime;
        window.__m.lcpEl = e.element ? e.element.tagName + (e.element.className ? "." + String(e.element.className).split(" ")[0] : "") : e.url;
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__m.tasks.push([Math.round(e.startTime), Math.round(e.duration)]);
    }).observe({ type: "longtask", buffered: true });
  });

  await page.goto(ORIGIN + route, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(5000);
  const first = await page.evaluate(() => ({ ...window.__m, tasks: [...window.__m.tasks] }));
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1500);
  const m = await page.evaluate(() => window.__m);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const screens = (h / height).toFixed(1);

  let jsFirst = 0;
  let js = 0;
  let all = 0;
  const fonts = [];
  for (const [id, n] of sizes) {
    const it = info.get(id);
    if (!it) continue;
    all += n;
    if (it.type === "Script") {
      js += n;
      if (finishedAt.get(id) <= loadTs) jsFirst += n;
    }
    if (it.type === "Font") fonts.push([path.basename(new URL(it.url).pathname), n]);
  }
  const scripts = await Promise.all(bodies);
  const three = scripts.filter((b) => /WebGLRenderer|THREE\.REVISION|__THREE__/.test(b.t));
  const tbt = first.tasks.reduce((s, [st, d]) => s + Math.max(0, Math.min(d, st + d - first.fcp) - 50), 0);
  const kb = (n) => (n / 1024).toFixed(1) + " KB";

  console.log(`\n${route} @ ${width}px (4x CPU, slow 4G)`);
  console.log(`JS first load ${kb(jsFirst)} · all JS after scrolling ${kb(js)} · everything ${kb(all)}`);
  console.log(`fonts: ${fonts.length} files, ${kb(fonts.reduce((s, [, n]) => s + n, 0))} (${fonts.map(([f, n]) => `${f} ${kb(n)}`).join(", ")})`);
  console.log(`three.js bytes: ${three.reduce((s, b) => s + b.t.length, 0)}`);
  console.log(`FCP ${Math.round(first.fcp)} ms · LCP ${Math.round(first.lcp)} ms (${first.lcpEl}) · CLS on load ${first.cls.toFixed(3)}, after scrolling ${m.cls.toFixed(3)} · TBT ${Math.round(tbt)} ms`);
  console.log(`long tasks [start, ms]: ${JSON.stringify(m.tasks)}`);
  console.log(`page ${screens} screens · horizontal overflow ${overflow}px · ${errors.length ? "errors:\n  " + errors.join("\n  ") : "no console errors"}`);
  await ctx.close();
}

try {
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(ORIGIN + "/robots.txt")).ok) break;
    } catch {}
    if (i > 120) throw new Error("server did not start");
    await new Promise((r) => setTimeout(r, 250));
  }
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  for (const r of routes) await measure(browser, r);
  await browser.close();
} finally {
  stop();
}
