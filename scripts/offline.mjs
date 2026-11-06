// Opens the production build in headless Chromium without starting a server: every request is
// answered straight from .next (prerendered HTML, static chunks, images). Used by capture-stills
// and for screenshots. Needs `npm run build` first. Playwright comes from a neighbouring demo.
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.join(root, "../universal-trades/package.json"));
const { chromium } = require("playwright");

const TYPES = { ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".html": "text/html", ".ico": "image/x-icon" };
export const ORIGIN = "http://kolo.test";

async function answer(route) {
  const url = new URL(route.request().url());
  if (url.origin !== ORIGIN) return route.abort();
  let file;
  if (url.pathname === "/") file = ".next/server/app/index.html";
  else if (url.pathname === "/_next/image") file = ".next/" + decodeURIComponent(url.searchParams.get("url")).replace(/^\/_next\//, "");
  else if (url.pathname.startsWith("/_next/")) file = ".next/" + decodeURIComponent(url.pathname).replace(/^\/_next\//, "");
  else file = `.next/server/app${url.pathname}.html`;
  try {
    const body = await readFile(path.join(root, file));
    return route.fulfill({ status: 200, contentType: TYPES[path.extname(file)] ?? "application/octet-stream", body });
  } catch {
    return route.fulfill({ status: 404, body: "" });
  }
}

export async function openBrowser() {
  return chromium.launch({ executablePath: process.env.CHROME_PATH ?? path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright/chromium-1234/chrome-win64/chrome.exe"), args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
}

export async function openPage(browser, { width, height, mobile = false, reduced = false, scale = 1 }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, hasTouch: mobile, isMobile: mobile, reducedMotion: reduced ? "reduce" : "no-preference" });
  await ctx.route("**/*", answer);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  page.errors = errors;
  return page;
}
