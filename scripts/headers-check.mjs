#!/usr/bin/env node
/**
 * Проверка боевых заголовков на собранном сайте.
 *
 * CSP нельзя написать «на глаз»: политика, которую не прогнали по живым
 * страницам, либо дырявая, либо ломает карту, шрифты или видео. Поэтому
 * здесь dist поднимается статикой ровно с теми заголовками, что лежат в
 * vercel.json, и по сайту проходит браузер, собирая нарушения политики и
 * заблокированные запросы.
 *
 *   node scripts/headers-check.mjs
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const HERE = path.resolve(import.meta.dirname, "..");
const DIST = path.join(HERE, "dist");
const PORT = 4180;

const config = JSON.parse(await readFile(path.join(HERE, "vercel.json"), "utf8"));

/** Заголовки для пути — так же, как их накладывает Vercel: по порядку правил. */
const headersFor = (url) => {
  const out = {};
  for (const rule of config.headers) {
    const re = new RegExp(`^${rule.source.replace("(.*)", ".*")}$`);
    if (re.test(url)) for (const h of rule.headers) out[h.key] = h.value;
  }
  return out;
};

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
};

const STATIC = /^\/(assets|img|seq|media|docs|fonts|data)\//;

const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(DIST, url);

  try {
    const s = await stat(file);
    if (s.isDirectory()) throw new Error("dir");
  } catch {
    // SPA: всё, что не статика и не файл, отдаётся индексом
    if (STATIC.test(url)) {
      res.writeHead(404).end("not found");
      return;
    }
    file = path.join(DIST, "index.html");
  }

  const body = await readFile(file).catch(() => null);
  if (!body) {
    res.writeHead(404).end("not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": TYPES[path.extname(file)] || "application/octet-stream",
    ...headersFor(url),
  });
  res.end(body);
});

await new Promise((r) => server.listen(PORT, r));
const base = `http://localhost:${PORT}`;

const PATHS = [
  "/ru",
  "/ru/catalog",
  "/ru/catalog/opory-osveshcheniya-granenye",
  "/ru/product/pmo-s-mobilnoy-koronoy",
  "/ru/news",
  "/ru/info/priglashaem-vas-posetit-kazavtodor",
  "/ru/info/my-prinyali-uchastie-v-vystavke",
  "/ru/contacts",
  "/ru/about",
];

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge" });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

const problems = [];
page.on("console", (m) => {
  const t = m.text();
  if (/Content Security Policy|Refused to|blocked|violat/i.test(t)) problems.push(`CSP: ${t.slice(0, 180)}`);
});
page.on("requestfailed", (r) => {
  const err = r.failure()?.errorText || "";
  if (/BLOCKED|CSP/i.test(err)) problems.push(`блокировка: ${err} ${r.url().slice(0, 90)}`);
});
page.on("response", (r) => {
  if (r.status() >= 400) problems.push(`${r.status()} ${r.url().replace(base, "").slice(0, 90)}`);
});
page.on("pageerror", (e) => problems.push(`JS: ${String(e).slice(0, 140)}`));

for (const p of PATHS) {
  await page.goto(base + p, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 800) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 110));
    }
  });
  await page.waitForTimeout(500);
}

/* карта тянет тайлы со стороннего домена — отдельная проверка, что они дошли */
await page.goto(base + "/ru/contacts", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
const tiles = await page.$$eval(".omap__tile", (n) => ({
  всего: n.length,
  загружено: n.filter((i) => i.complete && i.naturalWidth > 0).length,
}));

const shown = await page.evaluate(() => ({
  шрифты: document.fonts.status,
  семейство: getComputedStyle(document.body).fontFamily.split(",")[0],
}));

console.log("=== заголовки на /ru ===");
for (const [k, v] of Object.entries(headersFor("/ru"))) console.log(`  ${k}: ${v.slice(0, 120)}${v.length > 120 ? "…" : ""}`);
console.log(`\nтайлы карты: ${tiles.загружено} из ${tiles.всего}`);
console.log(`шрифты: ${shown.шрифты}, гарнитура тела: ${shown.семейство}`);
console.log(
  problems.length
    ? `\nПРОБЛЕМЫ (${problems.length}):\n` + [...new Set(problems)].slice(0, 20).join("\n")
    : "\nнарушений CSP, блокировок и ошибок не найдено"
);

await browser.close();
server.close();
