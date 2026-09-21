/** Проверка семантики: alt, доступные имена, порядок и видимость фокуса. */
import { chromium } from "playwright-core";

const URL_ = process.env.SITE_URL || "http://localhost:4173";
const PATHS = (process.argv[2] || "/ru,/ru/catalog,/ru/product/pmo-s-mobilnoy-koronoy,/ru/contacts").split(",");

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const p of PATHS) {
  await page.goto(URL_ + p, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const issues = await page.evaluate(() => {
    const out = [];
    const visible = (el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== "none" && s.visibility !== "hidden" && r.width > 1 && r.height > 1;
    };
    const label = (el) =>
      (el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || "").trim();

    for (const img of document.querySelectorAll("img")) {
      if (!img.hasAttribute("alt")) out.push(`img без alt: ${img.currentSrc || img.src}`.slice(0, 110));
    }
    for (const el of document.querySelectorAll("a, button")) {
      if (!visible(el)) continue;
      if (el.getAttribute("aria-hidden") === "true") continue;
      if (!label(el)) out.push(`${el.tagName.toLowerCase()} без имени: ${el.outerHTML.slice(0, 90)}`);
    }
    for (const a of document.querySelectorAll("a[target=_blank]")) {
      const rel = a.getAttribute("rel") || "";
      if (!rel.includes("noreferrer") && !rel.includes("noopener"))
        out.push(`внешняя ссылка без rel: ${a.href}`.slice(0, 110));
    }
    const h1 = document.querySelectorAll("h1");
    if (h1.length !== 1) out.push(`заголовков h1: ${h1.length}`);
    if (!document.querySelector("main")) out.push("нет <main>");
    return out;
  });

  // фокус: проходим по первым элементам и смотрим, виден ли контур
  const focus = await page.evaluate(async () => {
    const list = [...document.querySelectorAll("a, button, input")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    });
    const bad = [];
    for (const el of list.slice(0, 12)) {
      el.focus();
      const s = getComputedStyle(el);
      const ring = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
      if (!ring) bad.push((el.textContent || el.tagName).trim().slice(0, 28));
    }
    return bad;
  });

  console.log(`${p}: ${issues.length ? issues.length + " замечаний" : "семантика в порядке"}`);
  for (const i of [...new Set(issues)].slice(0, 8)) console.log("   " + i);
  if (focus.length) console.log("   без видимого фокуса: " + focus.join(", "));
}

await browser.close();
