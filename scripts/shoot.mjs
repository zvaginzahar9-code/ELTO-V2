#!/usr/bin/env node
/**
 * Визуальный контроль.
 *
 * Открывает настоящий сайт в настоящем браузере и фотографирует его.
 *
 *   node scripts/shoot.mjs                     проход по главной
 *   node scripts/shoot.mjs --scene hero        девять остановок внутри сцены,
 *                                              по её собственному прогрессу
 *   node scripts/shoot.mjs --path /ru/catalog  произвольная страница
 *   node scripts/shoot.mjs --mobile            то же на телефоне
 *
 * Снимать закреплённые сцены по offset документа бессмысленно: пин не
 * отображается на прокрутку линейно. Поэтому остановки считаются от границ
 * самой сцены, которые сайт сообщает через window.__scenes.
 */

import { chromium } from "playwright-core";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const OUT = process.env.SHOT_DIR || path.resolve(import.meta.dirname, "../.shots");
const URL_ = process.env.SITE_URL || "http://localhost:5173";

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const mobile = process.argv.includes("--mobile");
const keep = process.argv.includes("--keep");
const scene = arg("--scene");
const pagePath = arg("--path", "/ru");

const STOPS = arg("--at")
  ? arg("--at").split(",").map(Number)
  : scene
    ? [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87, 1]
    : [0, 0.05, 0.1, 0.16, 0.22, 0.28, 0.34, 0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82, 0.88, 0.94, 1];

const viewport = {
  width: Number(arg("--width", mobile ? 414 : 1680)),
  height: Number(arg("--height", mobile ? 896 : 950)),
};

const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "msedge",
  args: ["--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage({
  viewport,
  deviceScaleFactor: 1,
  isMobile: mobile,
  hasTouch: mobile,
});

const problems = [];
page.on("pageerror", (e) => problems.push("pageerror: " + String(e)));
page.on("console", (m) => m.type() === "error" && problems.push("console: " + m.text()));
page.on("requestfailed", (r) => {
  const u = r.url();
  if (!u.startsWith("data:")) problems.push(`404/fail: ${u}`);
});

if (!keep) await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

await page.goto(URL_ + pagePath, { waitUntil: "networkidle", timeout: 90_000 });
await page.waitForTimeout(2200);

const prefix = `w${viewport.width}${scene ? `-${scene}` : pagePath.replace(/\W+/g, "-")}`;

let range = null;
if (scene) {
  range = await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    return { start: top, end: top + rect.height - window.innerHeight };
  }, scene);
  if (!range) {
    console.error(`сцена #${scene} не найдена`);
    await browser.close();
    process.exit(1);
  }
  console.log(`#${scene}: ${Math.round(range.start)} → ${Math.round(range.end)} px`);
}

for (const p of STOPS) {
  await page.evaluate(
    ([r, prog]) => {
      const y = r
        ? r.start + (r.end - r.start) * prog
        : (document.documentElement.scrollHeight - window.innerHeight) * prog;
      const lenis = window.__lenis;
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    },
    [range, p]
  );
  await page.waitForTimeout(650);
  const name = `${prefix}-${String(Math.round(p * 100)).padStart(3, "0")}.jpg`;
  await page.screenshot({ path: path.join(OUT, name), quality: 82, type: "jpeg" });
  process.stdout.write(`· ${name}\n`);
}

await browser.close();

if (problems.length) {
  console.log("\nзамечания браузера:");
  [...new Set(problems)].slice(0, 25).forEach((p) => console.log("  " + p));
} else {
  console.log("\nбраузер не сообщил ни об одной ошибке");
}
