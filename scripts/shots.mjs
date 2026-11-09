// Screenshots of the production build, one per screen from top to bottom (starts `next start` itself).
//   npm run build && node scripts/shots.mjs <outDir> [route without the leading slash: "" or en] [width=375] [height=812]
// Headless Chrome; phones (< 1024 px) are emulated with touch. Also prints overflow and console errors.
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const { chromium } = createRequire(path.join(root, "../universal-trades/package.json"))("playwright");
const [outDir, r = "", w = "375", h = "812"] = process.argv.slice(2);
const route = "/" + r.replace(/^\/+/, "");
const width = Number(w);
const height = Number(h);
const phone = width < 1024;
const PORT = 4252;
const ORIGIN = `http://localhost:${PORT}`;

const env = { ...process.env, CRM_FIXTURES: "1" };
delete env.NODE_USE_SYSTEM_CA;
const server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: root, shell: true, env, stdio: "ignore" });
try {
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(ORIGIN + "/robots.txt")).ok) break;
    } catch {}
    if (i > 120) throw new Error("server did not start");
    await new Promise((r) => setTimeout(r, 250));
  }
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(ORIGIN + route, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  // Walk down first so every section has arrived, then shoot each screen
  for (let y = 0; y < total; y += height / 2) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(1200);
  let n = 0;
  for (let y = 0; y < total; y += height) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(phone ? 450 : 900);
    await page.screenshot({ path: path.join(outDir, `${String(n++).padStart(2, "0")}.png`) });
  }
  const tops = await page.evaluate(() => [...document.querySelectorAll("#main > section")].map((s) => `${s.id || s.getAttribute("aria-labelledby")}@${Math.round(s.getBoundingClientRect().top + scrollY)}`));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`${route} ${width}x${height}: ${n} screens (${total}px), overflow ${overflow}px`);
  console.log("sections:", tops.join(" "));
  console.log(errors.length ? "errors:\n  " + errors.join("\n  ") : "no console errors");
  await browser.close();
} finally {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
}
