// Desktop check on the production build (starts `next start` itself): headless Chrome at 1440x900 with a
// mouse. Prints the GPU, whether the 3D board went live, the hero and plan track heights (pinned scenes),
// whether GSAP/Lenis/three.js loaded, console errors, and saves screenshots down the page.
//   npm run build && node scripts/desktop-check.mjs <outDir> [route without the leading slash]
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const { chromium } = createRequire(path.join(root, "../universal-trades/package.json"))("playwright");
const [outDir, r = ""] = process.argv.slice(2);
const route = "/" + r.replace(/^\/+/, "");
const PORT = 4255;
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
    await new Promise((res) => setTimeout(res, 250));
  }
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  const scripts = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("response", (res) => res.request().resourceType() === "script" && scripts.push(res.text().catch(() => "")));
  await page.goto(ORIGIN + route, { waitUntil: "load" });
  await page.waitForFunction(() => document.querySelector(".hero-canvas")?.dataset.ready === "true", null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    return {
      gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "none",
      live: document.querySelector(".hero-canvas")?.dataset.ready === "true",
      hero: Math.round(document.getElementById("top").offsetHeight),
      plan: Math.round(document.querySelector('[aria-labelledby="plan-title"]').offsetHeight),
      sticky: getComputedStyle(document.querySelector(".plan-sticky")).position,
      lenis: Boolean(window.__lenis),
      headerBg: getComputedStyle(document.querySelector("header")).backgroundColor,
    };
  });
  await page.screenshot({ path: path.join(outDir, "00-hero.png") });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  let n = 1;
  for (let y = 900; y < total; y += 900) {
    await page.evaluate((v) => window.__lenis ? window.__lenis.scrollTo(v, { immediate: true }) : window.scrollTo(0, v), y);
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(outDir, `${String(n++).padStart(2, "0")}.png`) });
  }
  const bodies = await Promise.all(scripts);
  const has = (re) => bodies.some((t) => re.test(t));
  console.log(`${route} 1440x900 · GPU: ${info.gpu} · 3D live: ${info.live} · hero ${info.hero}px · plan ${info.plan}px (${info.sticky}) · Lenis ${info.lenis} · GSAP ${has(/GreenSock|gsap\.com/i)} · three.js ${has(/WebGLRenderer|__THREE__/)}`);
  console.log(`header after scrolling: ${await page.evaluate(() => getComputedStyle(document.querySelector("header")).backgroundColor)} · ${n} screens · ${errors.length ? "errors:\n  " + errors.join("\n  ") : "no console errors"}`);
  await browser.close();
} finally {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
}
