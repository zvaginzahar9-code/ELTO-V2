#!/usr/bin/env node
/**
 * ELTO — сборка контента.
 *
 * Вход:  _source/content-all.json   (дословная выгрузка elto.kz, ru/kk/en)
 * Выход: src/data/*.json            лёгкие индексы, попадают в бандл
 *        public/data/**.json        полные записи, грузятся по требованию
 *
 * Скрипт ничего не переписывает: тексты, названия, цифры и таблицы переносятся
 * как есть. Он только чистит вёрстку Drupal и связывает сущности между собой.
 */

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "_source", "content-all.json");
const OUT_SRC = path.join(ROOT, "src", "data");
const OUT_PUB = path.join(ROOT, "public", "data");

const LANGS = ["ru", "kk", "en"];

/* ── чистка вёрстки Drupal ───────────────────────────────────────────── */

const DROP_WRAPPERS =
  /<\/?(?:div|span)\b[^>]*>/gi;

function tidy(html) {
  if (!html) return "";
  let s = html;
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<div class="field-label">[\s\S]*?<\/div>/gi, "");
  s = s.replace(DROP_WRAPPERS, "");
  s = s.replace(/<a\b[^>]*>\s*<\/a>/gi, "");
  s = s.replace(/<(p|strong|em|u|h[1-6]|li)>\s*(?:&nbsp;|\s)*<\/\1>/gi, "");
  s = s.replace(/<br\s*\/?>\s*(<br\s*\/?>\s*)+/gi, "<br>");
  s = s.replace(/\s{2,}/g, " ");
  s = s.replace(/(<\/p>)\s*(<p>)/gi, "$1$2");
  // повторный проход: после снятия обёрток появляются новые пустые абзацы
  s = s.replace(/<(p|strong|em|u|h[1-6]|li)>\s*(?:&nbsp;|\s)*<\/\1>/gi, "");
  return s.trim();
}

/**
 * Служебные подписи полей Drupal, попавшие в текст вместе с содержимым.
 * На странице они ничего не значат («Изображение:», «позиция:», «1»),
 * но в превью выглядят как текст — вырезаем их, ничего больше не трогая.
 */
const FIELD_LABEL =
  /^(изображени[ея]|дополнительное изображение|позиция|описание|сурет|image|position|description)\s*:?\s*$/i;

const stripLabels = (text) =>
  (text || "")
    .split("\n")
    .filter((l) => {
      const s = l.trim();
      return s && !FIELD_LABEL.test(s) && !/^\d{1,3}$/.test(s);
    })
    .join("\n");

/** Первый содержательный абзац — для карточек и превью. */
function lead(text, max = 190) {
  const first = (text || "")
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 40);
  if (!first) return (text || "").slice(0, max).trim();
  return first.length > max ? first.slice(0, max).replace(/\s+\S*$/, "") + "…" : first;
}

const fileOf = (url) => {
  if (!url) return "";
  const base = decodeURIComponent(url.split("?")[0].split("/").pop() || "");
  return base.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 150);
};

/**
 * Чертёж или фотография — из результатов разбора самих изображений
 * (scripts/build-images.mjs). Имена файлов оригинала для этого непригодны.
 */
const METAFILE = path.join(ROOT, "_source", "image-meta.json");
const imageMeta = existsSync(METAFILE) ? JSON.parse(await readFile(METAFILE, "utf8")) : {};
if (!Object.keys(imageMeta).length) {
  console.warn("! нет _source/image-meta.json — сначала `npm run images`;");
  console.warn("  чертежи и фотографии не будут разделены");
}
const isDrawing = (f) => imageMeta[f]?.kind === "drawing";
const sizeOf = (f) => (imageMeta[f] ? { w: imageMeta[f].w, h: imageMeta[f].h } : null);

/* ── сборка ──────────────────────────────────────────────────────────── */

const raw = JSON.parse(await readFile(SRC, "utf8"));

// каталоги-пустышки и служебные представления
const SKIP_CATEGORY = new Set(["index", "catalog", "katalog", "all"]);

function langBundle(lang) {
  const L = raw.langs[lang];
  if (!L) return null;

  /* товары */
  const products = new Map();
  for (const p of L.products) {
    if (!p.slug || p.slug === "index") continue;
    const images = (p.images || []).map(fileOf).filter(Boolean);
    products.set(p.slug, {
      slug: p.slug,
      title: p.h1 || p.title,
      lead: lead(stripLabels(p.body)),
      body: stripLabels(p.body),
      html: tidy(p.body_html),
      tables: p.tables || [],
      photos: images.filter((f) => !isDrawing(f)),
      drawings: images.filter(isDrawing),
      images,
      dims: Object.fromEntries(images.map((f) => [f, sizeOf(f)]).filter(([, d]) => d)),
      docs: p.docs || [],
      related: (p.related || []).map((r) => ({
        slug: r.slug,
        title: r.title,
        image: fileOf(r.image),
      })),
      description: p.description || "",
      categories: [],
    });
  }

  /* категории */
  const categories = new Map();
  for (const c of L.categories) {
    if (!c.slug || SKIP_CATEGORY.has(c.slug)) continue;
    const items = (c.items || [])
      .map((i) => ({ slug: i.slug, title: i.title, image: fileOf(i.image) }))
      .filter((i) => i.slug);
    if (!items.length && !c.h1) continue;
    categories.set(c.slug, {
      slug: c.slug,
      title: c.h1 || c.title,
      items,
      description: c.description || "",
    });
  }

  /* дерево каталога — порядок и состав как на оригинале */
  const treeSlugs = (L.chrome?.catalog_tree || [])
    .map((t) => t.slug)
    .filter((s) => categories.has(s));

  /* Хлебные крошки товара — авторитетный источник иерархии:
     Главная / Каталог / <раздел> / <подраздел> / <изделие>.
     Страницы таксономии показывают только первую страницу пагинации,
     поэтому принадлежность берём из крошек, а списки лишь дополняем ими. */
  const norm = (s) => (s || "").toLowerCase().replace(/[\s\u00a0]+/g, " ").replace(/ё/g, "е").trim();
  const byTitle = new Map();
  for (const [slug, c] of categories) byTitle.set(norm(c.title), slug);

  const parentFromCrumbs = new Map();
  for (const p of L.products) {
    const prod = products.get(p.slug);
    if (!prod) continue;
    const crumbs = (p.breadcrumb || []).map((c) => c.text);
    const start = crumbs.findIndex((t) => /^(каталог|catalog|каталог.)$/i.test(norm(t)));
    if (start < 0) continue;
    // всё между «Каталог» и названием самого изделия — это разделы
    const chain = crumbs
      .slice(start + 1)
      .filter((t) => norm(t) !== norm(prod.title))
      .map((t) => byTitle.get(norm(t)))
      .filter(Boolean);
    chain.forEach((slug, i) => {
      if (!prod.categories.includes(slug)) prod.categories.push(slug);
      if (i > 0 && !parentFromCrumbs.has(slug) && chain[i - 1] !== slug) {
        parentFromCrumbs.set(slug, chain[i - 1]);
      }
      const cat = categories.get(slug);
      if (cat && !cat.items.some((it) => it.slug === prod.slug)) {
        cat.items.push({ slug: prod.slug, title: prod.title, image: prod.images[0] || "" });
      }
    });
  }

  /* родитель: из крошек, иначе — раздел с наибольшим пересечением по позициям */
  const topSets = new Map(
    treeSlugs.map((s) => [s, new Set(categories.get(s).items.map((i) => i.slug))])
  );
  for (const [slug, cat] of categories) {
    if (treeSlugs.includes(slug)) {
      cat.parent = null;
      continue;
    }
    if (parentFromCrumbs.has(slug)) {
      cat.parent = parentFromCrumbs.get(slug);
      continue;
    }
    cat.parent = null;
    let best = null;
    let bestN = 0;
    for (const [top, set] of topSets) {
      const n = cat.items.reduce((a, i) => a + (set.has(i.slug) ? 1 : 0), 0);
      if (n > bestN) {
        bestN = n;
        best = top;
      }
    }
    cat.parent = bestN > 0 ? best : null;
  }

  /* обратная связь товар → категории (списки таксономии) */
  for (const [slug, cat] of categories) {
    for (const it of cat.items) {
      const p = products.get(it.slug);
      if (p && !p.categories.includes(slug)) p.categories.push(slug);
    }
  }

  /* крошки одного изделия могут противоречить крошкам другого — рвём циклы,
     иначе обход предков зациклится */
  const ancestors = (slug) => {
    const chain = [];
    const seen = new Set([slug]);
    let cur = categories.get(slug)?.parent;
    while (cur && !seen.has(cur)) {
      seen.add(cur);
      chain.push(cur);
      cur = categories.get(cur)?.parent;
    }
    if (cur) categories.get(chain[chain.length - 1] ?? slug).parent = null;
    return chain;
  };
  for (const slug of categories.keys()) ancestors(slug);

  /* изделие, попавшее в подраздел, принадлежит и его родителю */
  for (const p of products.values()) {
    for (const slug of [...p.categories]) {
      for (const up of ancestors(slug)) {
        if (!p.categories.includes(up)) p.categories.push(up);
        const parentCat = categories.get(up);
        if (parentCat && !parentCat.items.some((it) => it.slug === p.slug)) {
          parentCat.items.push({ slug: p.slug, title: p.title, image: p.images[0] || "" });
        }
      }
    }
  }

  /* обложка раздела: первая позиция с фотографией */
  for (const [, cat] of categories) {
    const withImg = cat.items.find((i) => i.image);
    cat.image = withImg ? withImg.image : "";
    cat.count = cat.items.length;
    cat.children = [...categories.values()]
      .filter((c) => c.parent === cat.slug)
      .map((c) => c.slug);
  }

  /* страницы */
  const pages = new Map();
  for (const p of L.pages) {
    if (!p.slug) continue;
    pages.set(p.slug, {
      slug: p.slug,
      title: p.h1 || p.title,
      lead: lead(stripLabels(p.body)),
      body: stripLabels(p.body),
      html: tidy(p.body_html),
      tables: p.tables || [],
      images: (p.images || []).map(fileOf).filter(Boolean),
      docs: p.docs || [],
      description: p.description || "",
    });
  }

  return { products, categories, pages, tree: treeSlugs, chrome: L.chrome || {}, home: L.home || {} };
}

const bundles = {};
for (const l of LANGS) {
  const b = langBundle(l);
  if (b) bundles[l] = b;
}

/* ── русская версия — источник структуры; kk/en накладываются сверху ──── */

const ru = bundles.ru;
if (!ru) throw new Error("нет русской версии — нечего собирать");

/** Перевод названия, если он есть на оригинале; иначе русский оригинал. */
function translations(kind, slug, field = "title") {
  const out = {};
  for (const l of LANGS) {
    const b = bundles[l];
    if (!b) continue;
    const rec = b[kind].get(slug);
    if (rec && rec[field]) out[l] = rec[field];
  }
  return out;
}

await rm(OUT_PUB, { recursive: true, force: true });
await mkdir(path.join(OUT_PUB, "p"), { recursive: true });
await mkdir(path.join(OUT_PUB, "page"), { recursive: true });
await mkdir(OUT_SRC, { recursive: true });

/* полные записи товаров — по требованию */
let written = 0;
for (const [slug, p] of ru.products) {
  const record = {
    ...p,
    title: translations("products", slug),
    html: Object.fromEntries(
      LANGS.map((l) => [l, bundles[l]?.products.get(slug)?.html || p.html]).filter(Boolean)
    ),
    body: Object.fromEntries(
      LANGS.map((l) => [l, bundles[l]?.products.get(slug)?.body || p.body])
    ),
  };
  await writeFile(path.join(OUT_PUB, "p", `${slug}.json`), JSON.stringify(record), "utf8");
  written++;
}

for (const [slug, p] of ru.pages) {
  const record = {
    ...p,
    title: translations("pages", slug),
    html: Object.fromEntries(
      LANGS.map((l) => [l, bundles[l]?.pages.get(slug)?.html || p.html])
    ),
    body: Object.fromEntries(
      LANGS.map((l) => [l, bundles[l]?.pages.get(slug)?.body || p.body])
    ),
  };
  await writeFile(path.join(OUT_PUB, "page", `${slug}.json`), JSON.stringify(record), "utf8");
}

/* лёгкий индекс товаров — попадает в бандл, нужен каталогу и поиску */
const index = [...ru.products.values()].map((p) => ({
  s: p.slug,
  t: translations("products", p.slug),
  i: p.photos[0] || p.images[0] || "",
  c: p.categories,
  n: p.tables.length,
  d: p.lead,
}));

/* каталог */
const catalog = {
  tree: ru.tree.map((slug) => {
    const c = ru.categories.get(slug);
    return {
      slug,
      title: translations("categories", slug),
      image: c.image,
      count: c.count,
      children: c.children,
      items: c.items.map((i) => i.slug),
    };
  }),
  categories: Object.fromEntries(
    [...ru.categories.values()].map((c) => [
      c.slug,
      {
        slug: c.slug,
        title: translations("categories", c.slug),
        parent: c.parent,
        children: c.children,
        image: c.image,
        count: c.count,
        items: c.items.map((i) => i.slug),
      },
    ])
  ),
};

/**
 * Блоки главной попадают в бандл, поэтому из них выбрасывается всё, что
 * там не нужно: лента новостей на 76 позиций весит больше, чем вся
 * остальная обвязка, а на главной показываются шесть первых.
 */
function trimHome(home) {
  const out = {};
  for (const [key, block] of Object.entries(home || {})) {
    out[key] = {
      ...block,
      images: (block.images || []).slice(0, 14).map(fileOf),
      ...(block.slides ? { slides: block.slides.map((s) => ({ ...s, image: fileOf(s.image) })) } : {}),
      ...(block.logos ? { logos: block.logos.slice(0, 14).map(fileOf) } : {}),
      ...(block.items
        ? {
            items: block.items.slice(0, 8).map((i) => ({
              title: i.title,
              href: i.href,
              image: fileOf(i.image),
              teaser: lead(i.teaser, 140),
            })),
          }
        : {}),
    };
    // текст блока нужен только слайдеру — в нём лежит слоган компании
    if (key !== "w-slider") out[key].text = "";
  }
  return out;
}

/* сайт: меню, контакты, соцсети, блоки главной */
const site = {
  menu: Object.fromEntries(LANGS.map((l) => [l, bundles[l]?.chrome?.menu || []])),
  contacts: Object.fromEntries(LANGS.map((l) => [l, bundles[l]?.chrome?.contacts || null])),
  social: ru.chrome.social || [],
  copyright: Object.fromEntries(LANGS.map((l) => [l, bundles[l]?.chrome?.copyright?.text || ""])),
  home: Object.fromEntries(LANGS.map((l) => [l, trimHome(bundles[l]?.home)])),
};

/* списковые разделы оригинала: новости, партнёры, вакансии, галерея, полезное */
const VIEWSFILE = path.join(ROOT, "_source", "views.json");
const viewsRaw = existsSync(VIEWSFILE) ? JSON.parse(await readFile(VIEWSFILE, "utf8")) : {};
const views = {};
for (const lang of LANGS) {
  const byView = viewsRaw[lang] || {};
  views[lang] = Object.fromEntries(
    Object.entries(byView).map(([view, items]) => [
      view,
      items.map((it) => ({
        slug: it.slug,
        title: it.title,
        href: it.href,
        image: fileOf(it.image),
        lead: lead(
          (it.teaser || "")
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l && l !== it.title && !/^(читать далее|толығырақ|read more)$/i.test(l))
            .join("\n")
        ),
      })),
    ])
  );
}
await writeFile(path.join(OUT_SRC, "views.json"), JSON.stringify(views), "utf8");

const pagesIndex = [...ru.pages.values()].map((p) => ({
  s: p.slug,
  t: translations("pages", p.slug),
  d: p.lead,
  i: p.images[0] || "",
}));

await writeFile(path.join(OUT_SRC, "catalog.json"), JSON.stringify(catalog, null, 1), "utf8");
await writeFile(path.join(OUT_SRC, "products.json"), JSON.stringify(index), "utf8");
await writeFile(path.join(OUT_SRC, "pages.json"), JSON.stringify(pagesIndex), "utf8");
await writeFile(path.join(OUT_SRC, "site.json"), JSON.stringify(site, null, 1), "utf8");

const orphan = [...ru.products.values()].filter((p) => !p.categories.length);

console.log(`✓ товаров:        ${written} (полные записи в public/data/p)`);
console.log(`✓ страниц:        ${ru.pages.size}`);
console.log(`✓ категорий:      ${ru.categories.size}, из них верхнего уровня ${ru.tree.length}`);
console.log(`✓ без категории:  ${orphan.length}${orphan.length ? " → " + orphan.slice(0, 8).map((p) => p.slug).join(", ") : ""}`);
console.log(`✓ с таблицами:    ${[...ru.products.values()].filter((p) => p.tables.length).length}`);
console.log(`✓ с чертежами:    ${[...ru.products.values()].filter((p) => p.drawings.length).length}`);
