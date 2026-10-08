/**
 * Мета-теги страницы.
 *
 * Сайт рисуется на клиенте, и без этого у всех 400 страниц был бы один
 * заголовок и одно описание из index.html. Компонент ничего не рендерит:
 * он обновляет теги, которые уже лежат в <head>, и создаёт недостающие —
 * так в документе не появляются дубликаты.
 *
 * Адреса строятся от текущего домена: canonical указывает на ту же страницу
 * того же сайта, hreflang — на её версии на трёх языках.
 */

import { useEffect } from "react";
import { LANGS, t, type Lang } from "@/lib/i18n";

type Props = {
  lang: Lang;
  /** путь без языка: "/catalog", "/product/…" */
  path: string;
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "product";
  /** страница 404 и служебные — вне индекса */
  noindex?: boolean;
};

const OG_LOCALE: Record<Lang, string> = { ru: "ru_RU", kk: "kk_KZ", en: "en_US" };

function meta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function link(rel: string, href: string, hreflang?: string) {
  const sel = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function Seo({
  lang,
  path,
  title,
  description,
  image,
  type = "website",
  noindex = false,
}: Props) {
  useEffect(() => {
    const origin = window.location.origin;
    const url = `${origin}/${lang}${path === "/" ? "" : path}`;
    const brand = t("brand.name", lang);
    const full = title.includes(brand) ? title : `${title} — ${brand}`;
    const text = (description || t("brand.claim", lang)).replace(/\s+/g, " ").trim().slice(0, 300);

    document.title = full;
    if (text) {
      meta("name", "description", text);
      meta("property", "og:description", text);
    }
    meta("property", "og:title", full);
    meta("property", "og:type", type === "product" ? "website" : type);
    meta("property", "og:url", url);
    meta("property", "og:locale", OG_LOCALE[lang]);
    meta("property", "og:image", `${origin}${image || "/og.jpg"}`);
    meta("name", "twitter:card", "summary_large_image");
    meta("name", "robots", noindex ? "noindex, follow" : "index, follow");

    link("canonical", url);
    for (const l of LANGS)
      link("alternate", `${origin}/${l}${path === "/" ? "" : path}`, l);
    link("alternate", `${origin}/ru${path === "/" ? "" : path}`, "x-default");
  }, [lang, path, title, description, image, type, noindex]);

  return null;
}
