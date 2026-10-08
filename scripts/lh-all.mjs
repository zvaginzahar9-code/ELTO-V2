#!/usr/bin/env node
/**
 * Lighthouse по всем четырём категориям — как PageSpeed Insights.
 *   SITE_URL=https://elto-v2.vercel.app node scripts/lh-all.mjs [--desktop] [--path /ru] [--json out.json]
 */
import { chromium } from "playwright-core";
import lighthouse from "lighthouse";
import fs from "node:fs";

const URL_ = process.env.SITE_URL || "http://localhost:4173";
const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const desktop = process.argv.includes("--desktop");
const pagePath = arg("--path", "/ru");
const PORT = 9223;
const config = {
  extends: "lighthouse:default",
  settings: desktop
    ? { formFactor: "desktop", screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
        throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: Number(process.env.CPU || 1), requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 } }
    : { formFactor: "mobile" },
};
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge", args: [`--remote-debugging-port=${PORT}`, ...(process.env.NO_GPU ? ["--disable-gpu", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] : [])] });
const { lhr } = await lighthouse(URL_ + pagePath, { port: PORT, output: "json", logLevel: "error" }, config);
await browser.close();
const c = lhr.categories;
console.log(`${desktop ? "desktop" : "mobile"} ${pagePath}: perf ${Math.round(c.performance.score * 100)} a11y ${Math.round(c.accessibility.score * 100)} bp ${Math.round(c["best-practices"].score * 100)} seo ${Math.round(c.seo.score * 100)}`);
const a = lhr.audits;
for (const k of ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"])
  console.log(`  ${k}: ${a[k].displayValue}`);
for (const [cat, obj] of Object.entries(c))
  for (const ref of obj.auditRefs) {
    const au = a[ref.id];
    if (ref.weight > 0 && au.score !== null && au.score < 0.9) console.log(`  [${cat}] ${ref.id}: ${au.score} ${au.displayValue || ""}`);
  }
const out = arg("--json");
if (out) fs.writeFileSync(out, JSON.stringify(lhr));
