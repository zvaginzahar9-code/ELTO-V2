/**
 * Адреса.
 *
 * Меню, крошки и перекрёстные ссылки берутся из выгрузки оригинала, поэтому
 * все ссылки там — старые друпаловские пути. Здесь они переводятся в маршруты
 * нового сайта, а подписи остаются такими, какие были на elto.kz.
 */

import { productBySlug, catalog } from "./data";
import type { Lang } from "./i18n";

/** Страницы «о компании» и «контакты» на трёх языках оригинала. */
const ABOUT = new Set(["o-nas", "about-us", "біз-туралы", "biz-turaly"]);
const CONTACTS = new Set(["kontakty", "contacts", "bailanys", "байланыстар"]);

const SECTIONS: Record<string, string> = {
  partners: "partners",
  vacancy: "vacancy",
  gallery: "gallery",
  news: "news",
  usefullinf: "info",
  catalog: "catalog",
};

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/** Старый путь elto.kz → маршрут нового сайта. */
export function toRoute(href: string, lang: Lang): string {
  if (!href) return `/${lang}`;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;

  const clean = decode(href.split("?")[0].split("#")[0]).replace(/\/+$/, "");
  const parts = clean.split("/").filter(Boolean);
  // первый сегмент — язык оригинала; свой язык мы знаем и так
  if (parts[0] === "ru" || parts[0] === "kk" || parts[0] === "en") parts.shift();

  if (!parts.length) return `/${lang}`;

  const [head, ...rest] = parts;
  const slug = rest.join("/");

  if (head === "katalog" || head === "catalog") {
    if (!slug) return `/${lang}/catalog`;
    return catalog.categories[slug] ? `/${lang}/catalog/${slug}` : `/${lang}/catalog`;
  }

  if (head === "content") {
    const s = slug.toLowerCase();
    if (ABOUT.has(s)) return `/${lang}/about`;
    if (CONTACTS.has(s)) return `/${lang}/contacts`;
    if (productBySlug.has(slug)) return `/${lang}/product/${slug}`;
    if (catalog.categories[slug]) return `/${lang}/catalog/${slug}`;
    return `/${lang}/info/${slug}`;
  }

  if (SECTIONS[head]) return `/${lang}/${SECTIONS[head]}`;

  return `/${lang}/${head}${slug ? `/${slug}` : ""}`;
}

export const productPath = (lang: Lang, slug: string) => `/${lang}/product/${slug}`;
export const categoryPath = (lang: Lang, slug: string) => `/${lang}/catalog/${slug}`;
export const infoPath = (lang: Lang, slug: string) => `/${lang}/info/${slug}`;

/** Переписать внутренние ссылки в HTML оригинала на новые маршруты. */
export function rewriteLinks(html: string, lang: Lang): string {
  return html.replace(/href="([^"]+)"/g, (m, href: string) => {
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) {
      if (href.startsWith("https://elto.kz/") || href.startsWith("http://elto.kz/")) {
        return `href="${toRoute(href.replace(/^https?:\/\/elto\.kz/, ""), lang)}"`;
      }
      return m;
    }
    if (/\.(pdf|docx?|xlsx?|dwg|zip|rar)$/i.test(href)) {
      return `href="https://elto.kz${href.startsWith("/") ? "" : "/"}${href}"`;
    }
    return `href="${toRoute(href, lang)}"`;
  });
}
