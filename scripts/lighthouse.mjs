#!/usr/bin/env node
/**
 * Прогон Lighthouse по собранному сайту.
 *
 * Запускает настоящий браузер и настоящий аудит — тот же, что в DevTools,
 * с теми же профилями телефона и десктопа. Несколько прогонов берутся
 * медианой: одиночный замер на холодном браузере скачет на десятки очков.
 *
 *   node scripts/lighthouse.mjs                    телефон, 3 прогона
 *   node scripts/lighthouse.mjs --desktop
 *   node scripts/lighthouse.mjs --runs 5 --path /ru/catalog
 *   SITE_URL=https://example.com node scripts/lighthouse.mjs
 */

import { chromium } from "playwright-core";
import lighthouse from "lighthouse";

const URL_ = process.env.SITE_URL || "http://localhost:4173";
const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

const desktop = process.argv.includes("--desktop");
const runs = Number(arg("--runs", 3));
const pagePath = arg("--path", "/ru");
const PORT = 9222;

const config = {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["performance"],
    formFactor: desktop ? "desktop" : "mobile",
    screenEmulation: desktop
      ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }
      : { mobile: true, width: 412, height: 823, deviceScaleFactor: 2.625, disabled: false },
    throttling: desktop
      ? { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 }
      : { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4, requestLatencyMs: 562.5, downloadThroughputKbps: 1474.56, uploadThroughputKbps: 675 },
  },
};

const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "msedge",
  args: [`--remote-debugging-port=${PORT}`],
});

const took = [];
for (let i = 0; i < runs; i++) {
  const { lhr } = await lighthouse(URL_ + pagePath, { port: PORT, output: "json", logLevel: "error" }, config);
  const a = lhr.audits;
  took.push({
    score: Math.round(lhr.categories.performance.score * 100),
    fcp: a["first-contentful-paint"].numericValue,
    lcp: a["largest-contentful-paint"].numericValue,
    tbt: a["total-blocking-time"].numericValue,
    cls: a["cumulative-layout-shift"].numericValue,
    si: a["speed-index"].numericValue,
    lhr,
  });
}

await browser.close();

const median = (key) => {
  const v = took.map((t) => t[key]).sort((a, b) => a - b);
  return v[Math.floor(v.length / 2)];
};

const s = (ms) => `${(ms / 1000).toFixed(2)} с`;
console.log(`\n=== LIGHTHOUSE ${desktop ? "DESKTOP" : "MOBILE"} · ${URL_}${pagePath} · медиана ${runs} прогонов ===`);
console.log(`Performance  ${median("score")}   (прогоны: ${took.map((t) => t.score).join(", ")})`);
console.log(`FCP  ${s(median("fcp"))}`);
console.log(`LCP  ${s(median("lcp"))}`);
console.log(`TBT  ${Math.round(median("tbt"))} мс`);
console.log(`CLS  ${median("cls").toFixed(3)}`);
console.log(`Speed Index  ${s(median("si"))}`);

/* что именно Lighthouse предлагает починить дальше */
const worst = took[Math.floor(took.length / 2)].lhr.audits;
const opps = Object.values(worst)
  .filter((a) => a.details?.type === "opportunity" && a.numericValue > 50)
  .sort((a, b) => b.numericValue - a.numericValue)
  .slice(0, 6);
if (opps.length) {
  console.log("\nчто осталось:");
  for (const o of opps) console.log(`  ${String(Math.round(o.numericValue)).padStart(5)} мс  ${o.title}`);
}
const lcpEl = worst["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet;
if (lcpEl) console.log(`\nLCP-элемент: ${lcpEl.slice(0, 120)}`);
