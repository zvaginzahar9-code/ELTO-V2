#!/usr/bin/env node
/**
 * sitemap.xml и robots.txt.
 *
 * Сайт рисуется на клиенте, поэтому поисковику нужен явный список страниц:
 * разделы, все изделия, разделы каталога и материалы — на трёх языках,
 * с hreflang-ссылками между версиями.
 *
 * Адрес сайта берётся из SITE_ORIGIN (по умолчанию — текущий адрес на Vercel).
 *
 *   SITE_ORIGIN=https://elto.kz node scripts/build-sitemap.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const HERE = path.resolve(import.meta.dirname, "..");
const SITE = (process.env.SITE_ORIGIN || "https://elto.vercel.app").replace(/\/+$/, "");
const LANGS = ["ru", "kk", "en"];

const read = async (p) => JSON.parse(await readFile(path.join(HERE, p), "utf8"));
const catalog = await read("src/data/catalog.json");
const products = await read("src/data/products.json");
const views = await read("src/data/views.json");

const paths = [
  "",
  "/catalog",
  "/about",
  "/contacts",
  "/news",
  "/partners",
  "/vacancy",
  "/gallery",
  "/info",
];
for (const slug of Object.keys(catalog.categories)) paths.push(`/catalog/${slug}`);
for (const p of products) paths.push(`/product/${p.s}`);

/* материалы — те, что стоят в списках оригинала и ведут на страницу материала */
const info = new Set();
for (const lang of LANGS) {
  for (const list of Object.values(views[lang] || {})) {
    for (const item of list) {
      const m = /\/content\/([^/?#]+)$/.exec(item.href || "");
      if (m && !products.some((p) => p.s === m[1])) info.add(decodeURIComponent(m[1]));
    }
  }
}
for (const slug of info) paths.push(`/info/${encodeURIComponent(slug)}`);

const esc = (s) => s.replace(/&/g, "&amp;");
const urls = paths.flatMap((p) =>
  LANGS.map((lang) => {
    const alts = LANGS.map(
      (l) =>
        `    <xhtml:link rel="alternate" hreflang="${l}" href="${esc(`${SITE}/${l}${p}`)}"/>`
    ).join("\n");
    return `  <url>\n    <loc>${esc(`${SITE}/${lang}${p}`)}</loc>\n${alts}\n  </url>`;
  })
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;

await writeFile(path.join(HERE, "public/sitemap.xml"), xml);
await writeFile(
  path.join(HERE, "public/robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`
);

console.log(`sitemap.xml: ${urls.length} адресов для ${SITE}`);
