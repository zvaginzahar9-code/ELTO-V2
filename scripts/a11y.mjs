/** Проверка сайта в режиме «меньше движения» и с клавиатуры. */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const URL_ = process.env.SITE_URL || "http://localhost:4173";
const OUT = path.resolve(import.meta.dirname, "../.shots");
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});

await page.goto(URL_ + "/ru", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

for (const [name, stop] of [["hero", 0.02], ["production", 0.34], ["catalog", 0.55], ["geo", 0.74]]) {
  await page.evaluate((s) => {
    const y = (document.documentElement.scrollHeight - innerHeight) * s;
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
    else scrollTo(0, y);
  }, stop);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, `rm-${name}.jpg`), quality: 82, type: "jpeg" });
}

// ничего не должно остаться невидимым из-за незапущенной анимации
const hidden = await page.evaluate(() =>
  [...document.querySelectorAll("h1,h2,h3,p,li,a,span")]
    .filter((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const text = (el.textContent || "").trim();
      return text.length > 3 && r.width > 4 && r.height > 4 &&
        (s.visibility === "hidden" || parseFloat(s.opacity) < 0.05);
    })
    .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0,2).join(".")} «${(el.textContent||"").trim().slice(0,40)}»`)
    .slice(0, 12)
);
console.log(hidden.length ? "невидимый текст без анимации:" : "текст виден весь");
for (const h of [...new Set(hidden)]) console.log("  " + h);

await browser.close();
