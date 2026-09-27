#!/usr/bin/env node
/**
 * Поиск налезаний.
 *
 * Глазом такие места ловятся плохо: одно перекрытие видно только на своей
 * ширине и только на своей позиции прокрутки. Поэтому страница обходится
 * программно — сравниваются прямоугольники видимых текстовых элементов,
 * и в отчёт попадают те, что реально пересекаются.
 *
 *   node scripts/overlap.mjs                       главная на пяти ширинах
 *   node scripts/overlap.mjs --path /ru/catalog
 */

import { chromium } from "playwright-core";

const URL_ = process.env.SITE_URL || "http://localhost:5173";
const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

const paths = (arg("--path") || "/ru").split(",");
const widths = (arg("--widths") || "1680,1366,1024,768,414").split(",").map(Number);
const stops = (arg("--at") || "0,0.08,0.16,0.24,0.32,0.4,0.48,0.56,0.64,0.72,0.8,0.88,0.96")
  .split(",")
  .map(Number);

/** Внутри страницы: пары видимых текстовых блоков, чьи рамки пересеклись. */
const PROBE = () => {
  /**
   * Видимая часть элемента.
   *
   * Считать по собственному getBoundingClientRect нельзя: строка заголовка
   * может быть уведена трансформом под свою маску, слой карточки — погашен
   * прозрачностью родителя. И то и другое на экране не видно, а рамки
   * пересекаются. Поэтому поднимаемся по предкам, перемножаем прозрачность
   * и обрезаем рамку всеми, у кого скрыто переполнение.
   */
  const visibleRect = (el) => {
    let r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 6) return null;

    let opacity = 1;
    for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
      const s = getComputedStyle(node);
      if (s.visibility === "hidden" || s.display === "none") return null;
      opacity *= parseFloat(s.opacity) || 0;
      if (opacity < 0.06) return null;

      if (node !== el && (s.overflow === "hidden" || s.overflowY === "hidden" || s.clipPath !== "none")) {
        const c = node.getBoundingClientRect();
        const left = Math.max(r.left, c.left);
        const top = Math.max(r.top, c.top);
        const right = Math.min(r.right, c.right);
        const bottom = Math.min(r.bottom, c.bottom);
        if (right - left < 4 || bottom - top < 4) return null;
        r = { left, top, right, bottom, width: right - left, height: bottom - top };
      }
    }

    if (r.bottom <= 0 || r.top >= innerHeight) return null;
    return r;
  };

  // Шапка и полноэкранное меню намеренно лежат поверх страницы и имеют
  // собственный плотный фон — они не «налезают», а перекрывают.
  const overlay = (el) => el.closest(".nav, .menu, .foot, .dock, .sheet");

  const nodes = [];
  for (const el of document.querySelectorAll(
    "h1,h2,h3,h4,p,span,a,li,td,th,button,figcaption,address"
  )) {
    const own = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 1
    );
    if (!own || overlay(el)) continue;
    const r = visibleRect(el);
    if (r) nodes.push({ el, r });
  }

  const related = (a, b) => a.contains(b) || b.contains(a);
  const name = (el) => {
    const cls = (el.className || "").toString().split(/\s+/).filter(Boolean).slice(0, 2).join(".");
    const txt = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 34);
    return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""} «${txt}»`;
  };

  const hits = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const A = nodes[i];
      const B = nodes[j];
      if (related(A.el, B.el)) continue;
      const w = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
      const h = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
      if (w <= 2 || h <= 2) continue;
      // строки текста наезжают друг на друга небольшой площадью, но читаются
      // от этого одинаково плохо — порог держим низким
      const area = w * h;
      if (area < 200) continue;
      hits.push({ a: name(A.el), b: name(B.el), area: Math.round(area) });
    }
  }
  return hits;
};

const browser = await chromium.launch({ channel: "msedge" });
const seen = new Map();

for (const width of widths) {
  const page = await browser.newPage({
    viewport: { width, height: width < 600 ? 896 : 950 },
    isMobile: width < 600,
    hasTouch: width < 600,
  });
  for (const p of paths) {
    await page.goto(URL_ + p, { waitUntil: "networkidle", timeout: 90_000 });
    await page.waitForTimeout(2000);
    for (const stop of stops) {
      await page.evaluate((s) => {
        const y = (document.documentElement.scrollHeight - innerHeight) * s;
        if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
        else scrollTo(0, y);
      }, stop);
      await page.waitForTimeout(400);
      for (const hit of await page.evaluate(PROBE)) {
        const key = `${width}|${hit.a}|${hit.b}`;
        if (!seen.has(key)) seen.set(key, { width, path: p, stop, ...hit });
      }
    }
  }
  await page.close();
}

await browser.close();

const rows = [...seen.values()].sort((a, b) => b.area - a.area);
if (!rows.length) {
  console.log("налезаний не найдено");
} else {
  console.log(`налезаний: ${rows.length}\n`);
  for (const r of rows.slice(0, 40)) {
    console.log(`${r.width}px  ${r.path} @${r.stop}`);
    console.log(`   ${r.a}`);
    console.log(`   ${r.b}`);
    console.log(`   площадь ${r.area}\n`);
  }
}
