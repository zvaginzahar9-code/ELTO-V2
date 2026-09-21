#!/usr/bin/env node
/**
 * Responsive QA.
 *
 * Гоняет страницы по всем заявленным ширинам и на каждой ищет то, что
 * глазом на одном экране не видно:
 *
 *   · горизонтальную прокрутку и элементы, торчащие за вьюпорт;
 *   · мелкие цели нажатия на телефоне;
 *   · ошибки в консоли и неудачные запросы;
 *   · текст, вылезающий из своего контейнера.
 *
 *   node scripts/responsive.mjs
 *   node scripts/responsive.mjs --path /ru/catalog --widths 390,768
 */

import { chromium } from "playwright-core";

const URL_ = process.env.SITE_URL || "http://localhost:5173";
const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

const WIDTHS = (arg("--widths") ||
  "320,360,375,390,414,480,768,834,1024,1280,1440,1920,2560")
  .split(",")
  .map(Number);

const PATHS = (arg("--path") ||
  "/ru,/ru/catalog,/ru/catalog/opory-osveshcheniya-granyonye,/ru/product/pmo-s-mobilnoy-koronoy,/ru/about,/ru/contacts,/ru/news,/ru/partners")
  .split(",");

const STOPS = (arg("--at") || "0,0.25,0.5,0.75,1").split(",").map(Number);

/** высота вьюпорта под ширину — так же, как у настоящих устройств */
const heightFor = (w) => (w <= 480 ? 844 : w <= 834 ? 1024 : w <= 1440 ? 900 : 1080);

const PROBE = (isMobile) => {
  const doc = document.documentElement;
  const out = { overflow: 0, wide: [], small: [], spill: [] };

  out.overflow = Math.max(0, doc.scrollWidth - doc.clientWidth);

  const vw = doc.clientWidth;
  const name = (el) => {
    const cls = (el.className || "").toString().split(/\s+/).filter(Boolean).slice(0, 2).join(".");
    const txt = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30);
    return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}${txt ? ` «${txt}»` : ""}`;
  };

  for (const el of document.body.querySelectorAll("*")) {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.bottom < 0 || r.top > innerHeight) continue;

    // торчит за правый край и при этом не в горизонтальной ленте
    if (r.right > vw + 2) {
      let scroller = null;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const ps = getComputedStyle(p);
        if (ps.overflowX === "auto" || ps.overflowX === "scroll" || ps.overflowX === "hidden" ||
            ps.overflow === "hidden" || ps.overflow === "clip" || ps.overflowX === "clip") {
          scroller = p;
          break;
        }
      }
      if (!scroller) out.wide.push(`${name(el)} → ${Math.round(r.right - vw)}px`);
    }

    // текст шире своего контейнера
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (own && el.scrollWidth > el.clientWidth + 2 && s.overflowX === "visible") {
      out.spill.push(`${name(el)} → ${el.scrollWidth - el.clientWidth}px`);
    }

    // цели нажатия на телефоне
    if (isMobile && (el.tagName === "A" || el.tagName === "BUTTON")) {
      const interactive = el.getAttribute("aria-hidden") !== "true";
      if (interactive && (r.height < 30 || r.width < 30) && (el.textContent || "").trim()) {
        out.small.push(`${name(el)} → ${Math.round(r.width)}×${Math.round(r.height)}`);
      }
    }
  }
  const uniq = (a) => [...new Set(a)].slice(0, 6);
  return { overflow: out.overflow, wide: uniq(out.wide), small: uniq(out.small), spill: uniq(out.spill) };
};

const browser = await chromium.launch({
  channel: "msedge",
  args: ["--autoplay-policy=no-user-gesture-required"],
});

const report = [];

for (const width of WIDTHS) {
  const isMobile = width <= 480;
  const page = await browser.newPage({
    viewport: { width, height: heightFor(width) },
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: 1,
  });

  const problems = [];
  page.on("pageerror", (e) => problems.push("JS: " + String(e).slice(0, 140)));
  page.on("console", (m) => m.type() === "error" && problems.push("console: " + m.text().slice(0, 140)));
  page.on("requestfailed", (r) => {
    if (!r.url().startsWith("data:")) problems.push(`запрос: ${r.url().slice(0, 110)}`);
  });

  for (const p of PATHS) {
    await page.goto(URL_ + p, { waitUntil: "networkidle", timeout: 90_000 });
    await page.waitForTimeout(1400);

    for (const stop of STOPS) {
      await page.evaluate((s) => {
        const y = (document.documentElement.scrollHeight - innerHeight) * s;
        if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
        else scrollTo(0, y);
      }, stop);
      await page.waitForTimeout(350);

      const r = await page.evaluate(PROBE, isMobile);
      if (r.overflow || r.wide.length || r.small.length || r.spill.length) {
        report.push({ width, path: p, stop, ...r });
      }
    }
  }

  if (problems.length) {
    report.push({ width, path: "(вкладка)", stop: "-", problems: [...new Set(problems)].slice(0, 6) });
  }
  await page.close();
}

await browser.close();

if (!report.length) {
  console.log("responsive: замечаний нет");
} else {
  console.log(`замечаний: ${report.length}\n`);
  for (const r of report) {
    console.log(`${r.width}px  ${r.path} @${r.stop}`);
    if (r.overflow) console.log(`   горизонтальная прокрутка: ${r.overflow}px`);
    for (const w of r.wide || []) console.log(`   за краем: ${w}`);
    for (const s of r.spill || []) console.log(`   текст шире контейнера: ${s}`);
    for (const s of r.small || []) console.log(`   мелкая цель: ${s}`);
    for (const p of r.problems || []) console.log(`   ${p}`);
    console.log();
  }
}
