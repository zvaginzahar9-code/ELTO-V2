#!/usr/bin/env node
/**
 * Замер живых метрик в настоящем браузере.
 *
 * Lighthouse даёт оценку, но не говорит, какой именно узел сдвинул раскладку
 * и в каком порядке браузер узнал о ресурсах первого экрана. Здесь снимаются
 * сами события: LCP с описанием элемента, каждый layout-shift с виновниками
 * и waterfall запросов до первой отрисовки.
 *
 *   node scripts/vitals.mjs                    телефон (4x CPU, медленный 4G)
 *   node scripts/vitals.mjs --desktop
 *   node scripts/vitals.mjs --path /ru/catalog
 *   node scripts/vitals.mjs --runs 3
 */

import { chromium } from "playwright-core";

const URL_ = process.env.SITE_URL || "http://localhost:4173";
const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

const desktop = process.argv.includes("--desktop");
const runs = Number(arg("--runs", 1));
const pagePath = arg("--path", "/ru");

/* профили Lighthouse: mobile — 4x CPU и медленный 4G, desktop — без тормозов */
const profile = desktop
  ? { viewport: { width: 1350, height: 940 }, cpu: 1, net: null, dsf: 1 }
  : {
      viewport: { width: 412, height: 823 },
      cpu: 4,
      net: { downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 },
      dsf: 2.625,
    };

const COLLECT = () => {
  const s = { lcp: null, shifts: [], longTasks: [] };
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      const el = e.element;
      s.lcp = {
        time: Math.round(e.startTime),
        size: e.size,
        url: e.url || null,
        tag: el ? el.tagName.toLowerCase() : null,
        cls: el ? el.className?.toString().slice(0, 80) : null,
        text: el ? (el.textContent || "").trim().slice(0, 60) : null,
      };
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });

  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      s.shifts.push({
        value: Number(e.value.toFixed(4)),
        time: Math.round(e.startTime),
        sources: (e.sources || []).map((src) => {
          const n = src.node;
          if (!n) return "?";
          const tag = n.tagName ? n.tagName.toLowerCase() : n.nodeName;
          const cls = n.className?.toString().trim().split(/\s+/).slice(0, 3).join(".") || "";
          return cls ? `${tag}.${cls}` : tag;
        }),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });

  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) s.longTasks.push(Math.round(e.duration));
  }).observe({ type: "longtask", buffered: true });

  window.__vitals = s;
};

const once = async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge" });
  const page = await browser.newPage({
    viewport: profile.viewport,
    deviceScaleFactor: profile.dsf,
    isMobile: !desktop,
    hasTouch: !desktop,
  });

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });
  if (profile.net) {
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, ...profile.net });
  }

  const net = [];
  page.on("response", (r) => {
    const t = r.request().timing();
    net.push({ url: r.url().replace(URL_, ""), start: t ? Math.round(t.startTime) : 0, type: r.request().resourceType() });
  });

  await page.addInitScript(COLLECT);
  await page.goto(URL_ + pagePath, { waitUntil: "load" });
  await page.waitForTimeout(desktop ? 2500 : 5000);

  const v = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const fcp = performance.getEntriesByName("first-contentful-paint")[0];
    return {
      ...window.__vitals,
      fcp: fcp ? Math.round(fcp.startTime) : null,
      domInteractive: nav ? Math.round(nav.domInteractive) : null,
      transfer: Math.round(
        performance.getEntriesByType("resource").reduce((s, r) => s + (r.transferSize || 0), 0) / 1024
      ),
    };
  });

  await browser.close();
  return { ...v, net };
};

for (let i = 0; i < runs; i++) {
  const v = await once();
  const cls = v.shifts.reduce((s, x) => s + x.value, 0);
  console.log(`\n=== ${desktop ? "DESKTOP" : "MOBILE"} ${pagePath} — прогон ${i + 1} ===`);
  console.log(`FCP ${v.fcp} мс · LCP ${v.lcp?.time} мс · CLS ${cls.toFixed(3)} · передано ${v.transfer} КБ`);
  console.log(`LCP-элемент: <${v.lcp?.tag}> ${v.lcp?.cls || ""} ${v.lcp?.url ? "· " + v.lcp.url.split("/").pop() : ""}`);
  if (v.lcp?.text) console.log(`  текст: «${v.lcp.text}»`);
  console.log(`долгих задач: ${v.longTasks.length}${v.longTasks.length ? " — " + v.longTasks.join(", ") + " мс" : ""}`);
  if (v.shifts.length) {
    console.log("сдвиги раскладки:");
    for (const s of v.shifts.sort((a, b) => b.value - a.value).slice(0, 8)) {
      console.log(`  ${s.value.toFixed(4)} на ${s.time} мс ← ${[...new Set(s.sources)].join(", ")}`);
    }
  }
  console.log("первые запросы:");
  for (const r of v.net.slice(0, 12)) console.log(`  ${String(r.start).padStart(5)}  ${r.type.padEnd(10)} ${r.url.slice(0, 70)}`);
}
