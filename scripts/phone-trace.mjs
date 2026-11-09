// Traces a phone load of the production build (375 px, 4x CPU, slow 4G) and breaks down every main-thread
// task over 50 ms. Starts `next start` itself.   npm run build && node scripts/phone-trace.mjs [route without the leading slash]
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const { chromium } = createRequire(path.join(root, "../universal-trades/package.json"))("playwright");
const route = "/" + (process.argv[2] ?? "").replace(/^\/+/, "");
const PORT = 4253;
const ORIGIN = `http://localhost:${PORT}`;
const env = { ...process.env, CRM_FIXTURES: "1" };
delete env.NODE_USE_SYSTEM_CA;
const server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: root, shell: true, env, stdio: "ignore" });

const KINDS = ["Layout", "UpdateLayoutTree", "Paint", "PrePaint", "Layerize", "ParseHTML", "EvaluateScript", "v8.compile", "v8.produceCache", "FunctionCall", "TimerFire", "FireIdleCallback", "FireAnimationFrame", "EventDispatch", "Decode Image", "HitTest", "RunMicrotasks", "IntersectionObserverController::computeIntersections", "Commit", "ParseAuthorStyleSheet"];

try {
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(ORIGIN + "/robots.txt")).ok) break;
    } catch {}
    if (i > 120) throw new Error("server did not start");
    await new Promise((r) => setTimeout(r, 250));
  }
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  // Experiments: NOFONTS=1 blocks the web fonts; STYLE="css" is injected at the top of <head>
  if (process.env.NOFONTS) await page.route(/\.woff2$/, (r) => r.abort());
  if (process.env.STYLE)
    await page.route(ORIGIN + route, async (r) => {
      const res = await r.fetch();
      const html = (await res.text()).replace("<head>", `<head><style>${process.env.STYLE}</style>`);
      await r.fulfill({ response: res, body: html });
    });
  const tmp = path.join(process.env.TEMP ?? ".", "kolo-phone-trace.json");
  await browser.startTracing(page, { path: tmp, categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "v8.execute", "blink.user_timing", ...(process.env.PROFILE ? ["disabled-by-default-v8.cpu_profiler"] : [])] });
  await page.goto(ORIGIN + route, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(5000);
  await browser.stopTracing();
  await browser.close();

  const { traceEvents } = JSON.parse(fs.readFileSync(tmp, "utf8"));
  const xs = traceEvents.filter((e) => e.ph === "X" && e.dur);
  const nav = traceEvents.find((e) => e.name === "navigationStart")?.ts ?? xs[0].ts;
  const tid = xs.filter((e) => e.name === "RunTask" && e.dur > 50000).sort((a, b) => b.dur - a.dur)[0]?.tid;
  const tasks = xs.filter((e) => e.name === "RunTask" && e.tid === tid && e.dur > 50000);
  // CPU profile samples as [timestamp µs, "function file:line"]
  const samples = [];
  if (process.env.PROFILE) {
    const nodes = new Map();
    let at = 0;
    for (const e of traceEvents) {
      if (e.name === "Profile") at = e.args.data.startTime;
      if (e.name !== "ProfileChunk") continue;
      const d = e.args.data.cpuProfile ?? {};
      for (const nd of d.nodes ?? []) nodes.set(nd.id, `${nd.callFrame.functionName || "(anon)"} ${(nd.callFrame.url || "").split("/").pop()}:${nd.callFrame.lineNumber}`);
      const deltas = e.args.data.timeDeltas ?? [];
      (d.samples ?? []).forEach((id, i) => {
        at += deltas[i] ?? 0;
        samples.push([at, nodes.get(id) ?? String(id)]);
      });
    }
  }
  let sum = 0;
  for (const t of tasks) {
    sum += t.dur / 1000 - 50;
    const kids = xs.filter((e) => e.tid === tid && e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e !== t);
    const by = {};
    for (const k of kids) if (KINDS.includes(k.name)) by[k.name] = (by[k.name] ?? 0) + k.dur / 1000;
    const what = [...new Set(kids.filter((k) => k.args?.data?.url || k.args?.data?.functionName).map((k) => (k.args.data.url || "").split("/").pop() + (k.args.data.functionName ? ":" + k.args.data.functionName : "")))].slice(0, 6);
    const lays = kids.filter((k) => k.name === "Layout" && k.dur > 10000).map((k) => `${Math.round(k.dur / 1000)}ms/${k.args?.beginData?.dirtyObjects ?? "?"}of${k.args?.beginData?.totalObjects ?? "?"}obj`);
    console.log(`task @${Math.round((t.ts - nav) / 1000)} ms, ${Math.round(t.dur / 1000)} ms: ${Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([k, v]) => `${k} ${v.toFixed(0)}`).join(", ")}`);
    if (what.length) console.log("   ", what.join(" "));
    if (lays.length) console.log("    layouts:", lays.join(" "));
    // PROFILE=1: where the JavaScript time in this task went (self time by function)
    if (process.env.PROFILE) {
      const self = {};
      for (const [ts, frame] of samples) if (ts >= t.ts && ts <= t.ts + t.dur) self[frame] = (self[frame] ?? 0) + 1;
      const top = Object.entries(self).sort((a, b) => b[1] - a[1]).slice(0, 12);
      const n = Object.values(self).reduce((a, b) => a + b, 0) || 1;
      console.log("    js:", top.map(([f, c]) => `${f} ${Math.round((c / n) * 100)}%`).join(" | "));
    }
  }
  console.log(`blocking (sum of long tasks over 50 ms): ${Math.round(sum)} ms`);
} finally {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
}
