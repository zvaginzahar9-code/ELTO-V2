/**
 * Данные сайта.
 *
 * Лёгкие индексы (каталог, список изделий, подвал) лежат в бандле — они нужны
 * навигации сразу. Полные карточки изделий и страниц забираются по требованию
 * из public/data, чтобы первая загрузка не тащила 2 МБ текста.
 */

import catalogRaw from "@/data/catalog.json";
import productsRaw from "@/data/products.json";
import pagesRaw from "@/data/pages.json";
import siteRaw from "@/data/site.json";
import type { Lang } from "./i18n";

export type Localized = Partial<Record<Lang, string>>;

export type CategoryNode = {
  slug: string;
  title: Localized;
  parent?: string | null;
  children: string[];
  image: string;
  count: number;
  items: string[];
};

export type ProductBrief = {
  /** slug */
  s: string;
  /** title */
  t: Localized;
  /** главное изображение */
  i: string;
  /** категории */
  c: string[];
  /** число таблиц характеристик */
  n: number;
  /** первый абзац описания */
  d: string;
};

export type PageBrief = { s: string; t: Localized; d: string; i: string };

export type ProductFull = {
  slug: string;
  title: Localized;
  lead: string;
  body: Record<Lang, string>;
  html: Record<Lang, string>;
  tables: string[][][];
  photos: string[];
  drawings: string[];
  images: string[];
  dims: Record<string, { w: number; h: number }>;
  docs: { text: string; href: string }[];
  related: { slug: string; title: string; image: string }[];
  categories: string[];
  description: string;
};

export type PageFull = {
  slug: string;
  title: Localized;
  lead: string;
  body: Record<Lang, string>;
  html: Record<Lang, string>;
  tables: string[][][];
  images: string[];
  docs: { text: string; href: string }[];
  description: string;
};

export const catalog = catalogRaw as unknown as {
  tree: (CategoryNode & { items: string[] })[];
  categories: Record<string, CategoryNode>;
};

export const products = productsRaw as unknown as ProductBrief[];
export const pages = pagesRaw as unknown as PageBrief[];

export const site = siteRaw as unknown as {
  menu: Record<Lang, { text: string; href: string; children: unknown[] }[]>;
  contacts: Record<Lang, { text: string; links: { text: string; href: string }[] } | null>;
  social: { text: string; href: string }[];
  copyright: Record<Lang, string>;
  home: Record<Lang, Record<string, HomeBlock>>;
};

export type HomeBlock = {
  text: string;
  images: string[];
  slides?: { image: string; text: string }[];
  items?: { title: string; href: string; image: string; teaser: string }[];
  logos?: string[];
};

export const productBySlug = new Map(products.map((p) => [p.s, p]));

/* ── загрузка полных записей ─────────────────────────────────────── */

const cache = new Map<string, Promise<unknown>>();

function load<T>(url: string): Promise<T> {
  let hit = cache.get(url) as Promise<T> | undefined;
  if (!hit) {
    hit = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return r.json() as Promise<T>;
    });
    cache.set(url, hit as Promise<unknown>);
  }
  return hit;
}

export const loadProduct = (slug: string) => load<ProductFull>(`/data/p/${slug}.json`);
export const loadPage = (slug: string) => load<PageFull>(`/data/page/${slug}.json`);

/** Заранее прогреть карточку, на которую пользователь вот-вот нажмёт. */
export const prefetchProduct = (slug: string) => {
  loadProduct(slug).catch(() => {});
};

/* ── выборки ─────────────────────────────────────────────────────── */

export const topCategories = catalog.tree;

export const categoryOf = (slug: string): CategoryNode | undefined =>
  catalog.categories[slug];

export const productsIn = (slug: string): ProductBrief[] => {
  const cat = catalog.categories[slug];
  if (!cat) return [];
  return cat.items.map((s) => productBySlug.get(s)).filter(Boolean) as ProductBrief[];
};

/** Ближайший (самый узкий) раздел изделия — для хлебных крошек. */
export const leafCategoryOf = (p: ProductBrief): CategoryNode | undefined => {
  const nodes = p.c.map((c) => catalog.categories[c]).filter(Boolean);
  return nodes.find((n) => n.parent) ?? nodes[0];
};
