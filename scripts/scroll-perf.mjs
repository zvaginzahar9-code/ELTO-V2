/** Замер плавности: сколько кадров теряется во время прокрутки сцен. */
import { chromium } from "playwright-core";

const URL_ = process.env.SITE_URL || "http://localhost:4173";
const browser = await chromium.launch({ channel: "msedge" });

for (const [name, viewport, mobile] of [
  ["десктоп 1440", { width: 1440, height: 900 }, false],
  ["телефон 390", { width: 390, height: 844 }, true],
]) {
  const page = await browser.newPage({ viewport, isMobile: mobile, hasTouch: mobile });
  await page.goto(URL_ + "/ru", { waitUntil: "networkidle" });
  await page.waitForTimeout(3500); // дать кадрам догрузиться на простое

  const result = await page.evaluate(async () => {
    const frames = [];
    let last = performance.now();
    let running = true;
    const tick = (t) => {
      frames.push(t - last);
      last = t;
      if (running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const max = document.documentElement.scrollHeight - innerHeight;
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const y = (max * i) / steps;
      if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
      else scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
    running = false;

    const useful = frames.slice(5);
    const sorted = [...useful].sort((a, b) => a - b);
    const p = (q) => sorted[Math.floor(sorted.length * q)] ?? 0;
    return {
      frames: useful.length,
      median: +p(0.5).toFixed(1),
      p95: +p(0.95).toFixed(1),
      worst: +Math.max(...useful).toFixed(1),
      dropped: useful.filter((d) => d > 33).length,
    };
  });

  console.log(
    `${name}: кадров ${result.frames} · медиана ${result.median} мс · p95 ${result.p95} мс · ` +
      `худший ${result.worst} мс · дольше 33 мс: ${result.dropped}`
  );
  await page.close();
}
await browser.close();
