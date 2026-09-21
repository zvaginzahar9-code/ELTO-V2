/** Что и сколько грузит страница при первом открытии. */
import { chromium } from "playwright-core";

const URL_ = process.env.SITE_URL || "http://localhost:4173";
const browser = await chromium.launch({ channel: "msedge" });

for (const [name, viewport, mobile] of [
  ["десктоп", { width: 1440, height: 900 }, false],
  ["телефон", { width: 390, height: 844 }, true],
]) {
  const page = await browser.newPage({ viewport, isMobile: mobile, hasTouch: mobile });
  const byType = new Map();
  let total = 0;

  page.on("response", async (r) => {
    try {
      const h = r.headers();
      const len = Number(h["content-length"] || 0);
      const type = (h["content-type"] || "").split(";")[0] || "?";
      const size = len || (await r.body().catch(() => Buffer.alloc(0))).length;
      total += size;
      byType.set(type, (byType.get(type) || 0) + size);
    } catch { /* поток мог закрыться — не страшно */ }
  });

  const t0 = Date.now();
  await page.goto(URL_ + "/ru", { waitUntil: "load", timeout: 90_000 });
  const loaded = Date.now() - t0;
  await page.waitForTimeout(3500);

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const paint = performance.getEntriesByType("paint");
    return {
      dom: Math.round(nav?.domContentLoadedEventEnd ?? 0),
      fcp: Math.round(paint.find((p) => p.name === "first-contentful-paint")?.startTime ?? 0),
      nodes: document.querySelectorAll("*").length,
    };
  });

  const mb = (b) => (b / 1048576).toFixed(2);
  console.log(`\n${name}: загрузка ${loaded} мс · DOMContentLoaded ${metrics.dom} мс · FCP ${metrics.fcp} мс`);
  console.log(`  узлов в DOM: ${metrics.nodes}`);
  console.log(`  всего за 3.5 с: ${mb(total)} МБ`);
  for (const [t, s] of [...byType].sort((a, b) => b[1] - a[1]).slice(0, 6)) {
    console.log(`    ${t.padEnd(26)} ${mb(s)} МБ`);
  }
  await page.close();
}
await browser.close();
