// Checks src/app/held.css against the real page in headless Chrome (starts `next start` itself):
// for 320, 375 and 430 px in both languages, each held section's --held vs its rendered height, and
// whether a jump straight to #kontakt from the top lands where it should (no drift).
//   npm run build && node scripts/held-check.mjs
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const { chromium } = createRequire(path.join(root, "../universal-trades/package.json"))("playwright");
const PORT = 4254;
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
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  for (const route of ["/", "/en"]) {
    for (const width of [320, 375, 430]) {
      const ctx = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      await page.goto(ORIGIN + route, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(600);
      // Jump straight to the contact form, as the menu or the call bar would
      const jump = await page.evaluate(async () => {
        const el = document.getElementById("kontakt");
        window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 72);
        await new Promise((r) => setTimeout(r, 800));
        return Math.round(el.getBoundingClientRect().top - 72);
      });
      const rows = await page.evaluate(async () => {
        const out = [];
        for (const el of [...document.querySelectorAll("#main > section"), document.querySelector("#main ~ footer")]) {
          const c = getComputedStyle(el);
          const held = parseFloat(c.getPropertyValue("--held"));
          if (!held || c.contentVisibility !== "auto") continue;
          el.scrollIntoView();
          await new Promise((r) => setTimeout(r, 120));
          const edges = parseFloat(c.paddingTop) + parseFloat(c.paddingBottom) + parseFloat(c.borderTopWidth) + parseFloat(c.borderBottomWidth);
          const real = el.getBoundingClientRect().height - edges;
          out.push([el.id || el.getAttribute("aria-labelledby") || el.tagName.toLowerCase(), held, Math.round(real * 10) / 10]);
        }
        return out;
      });
      const worst = rows.reduce((m, [, h, r]) => Math.max(m, Math.abs(h - r) / r), 0);
      const off = rows.filter(([, h, r]) => Math.abs(h - r) > 1).map(([n, h, r]) => `${n} ${h}→${r}`);
      console.log(`${route} ${width}px: ${rows.length} held, worst ${(worst * 100).toFixed(2)}%, jump to #kontakt lands ${jump}px off${off.length ? " · " + off.join(", ") : ""}`);
      await ctx.close();
    }
  }
  await browser.close();
} finally {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
}
