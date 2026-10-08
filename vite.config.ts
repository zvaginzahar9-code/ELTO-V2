import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import siteData from "./src/data/site.json";
import { LANGS, t, type Lang } from "./src/lib/i18n";
import {
  HOME_DESCRIPTION,
  PHONE_HERO_ALT,
  PHONE_HERO_CAPTION,
  PHONE_HERO_AVIF,
  PHONE_HERO_WEBP,
  heroTitle,
} from "./src/scenes/hero-copy";

/**
 * Стили — внутрь документа.
 *
 * Отдельный файл стилей блокирует первую отрисовку: браузер не покажет
 * ничего, пока не скачает его целиком, а на мобильной сети один такой круг
 * стоит больше полусекунды. Сайт рисуется на клиенте и живёт одним
 * документом, поэтому кэшировать стили отдельно смысла нет — дешевле
 * отдать их сразу вместе с HTML. Сжатые это около десяти килобайт.
 */
function inlineCss(): Plugin {
  return {
    name: "elto-inline-css",
    enforce: "post",
    apply: "build",
    generateBundle(_options, bundle) {
      const html = Object.values(bundle).find(
        (a) => a.type === "asset" && a.fileName.endsWith(".html")
      );
      if (!html || html.type !== "asset") return;

      let source = String(html.source);

      for (const [name, asset] of Object.entries(bundle)) {
        if (asset.type !== "asset" || !asset.fileName.endsWith(".css")) continue;
        const link = new RegExp(`<link[^>]+href="/${asset.fileName}"[^>]*>`);
        if (!link.test(source)) continue;
        source = source.replace(link, `<style>${String(asset.source)}</style>`);
        delete bundle[name];
      }

      html.source = source;
    },
  };
}

/**
 * Адрес сайта в статическом HTML: превью для мессенджеров берут картинку
 * только по абсолютной ссылке, а скрипты они не выполняют.
 */
function siteUrl(): Plugin {
  const url = (process.env.SITE_ORIGIN || "https://elto.vercel.app").replace(/\/+$/, "");
  return {
    name: "elto-site-url",
    transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", url),
  };
}

/**
 * Первый экран главной — прямо в HTML.
 *
 * Сайт рисуется на клиенте, и на телефоне заголовок героя появлялся только
 * после загрузки бандла: он и был самым поздним крупным элементом (LCP).
 * Поэтому сборка кладёт рядом с index.html страницы home-ru/kk/en.html, где
 * вместо стартового кадра стоит настоящая разметка героя — тот же заголовок,
 * те же кнопки, из тех же строк, что и сцена. Стили к этому
 * моменту уже внутри документа (inlineCss), так что кадр совпадает с тем,
 * что потом нарисует React. vercel.json отдаёт эти страницы на /ru, /kk, /en.
 */
function homeHtml(): Plugin {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  const hero = (lang: Lang) => {
    const title = heroTitle(lang);
    const lines = title.lines
      .map((l, i) => `<span class="mask" style="--i:${i}"><span>${esc(l)}</span></span>`)
      .join("");
    const where = title.where
      ? `<span class="mask hero__where" style="--i:3"><span>${esc(title.where)}<span class="hero__dock" aria-hidden="true"></span></span></span>`
      : "";

    // телефон получает свой первый экран — тот же, что рисует src/phone/PhoneHome.tsx;
    // фото привязано к ширине телефона, иначе широкий экран качал бы его впустую
    const photo = `<picture><source media="(max-width: 860px)" type="image/avif" srcset="${PHONE_HERO_AVIF}" sizes="100vw"><source media="(max-width: 860px)" type="image/webp" srcset="${PHONE_HERO_WEBP}" sizes="100vw"><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="${esc(PHONE_HERO_ALT)}" width="1080" height="1350" fetchpriority="high"></picture>`;
    const phone = `<div class="ph ph--boot"><section class="ph-hero" data-ground="paper"><div class="ph-hero__text"><h1 class="ph-hero__h1">${esc(title.lines.join(" "))}</h1>${title.where ? `<p class="ph-hero__where">${esc(title.where)}</p>` : ""}<div class="ph-hero__actions"><a class="ph-btn ph-btn--ink" href="/${lang}/catalog">${esc(t("cta.catalog", lang))}</a><span class="ph-btn">${esc(t("cta.quote", lang))}</span></div></div><figure class="ph-hero__photo">${photo}<figcaption>${esc(PHONE_HERO_CAPTION)}</figcaption></figure></section></div>`;
    // подпись первого экрана — вторая строка слайдера оригинала, как в сцене героя
    const slider = (siteData as unknown as { home: Record<string, Record<string, { text?: string }>> }).home;
    const sub = ((slider[lang]?.["w-slider"] ?? slider.ru?.["w-slider"])?.text || "")
      .split("\n")[1]?.trim().replace(/\s+kz$/i, "").replace(/\s+[-–—]\s+/g, " - ") || "";
    const arrow = `<span class="pill__icon" aria-hidden="true"></span>`;
    return phone + `<section class="scene hero hero--boot" data-ground="paper"><div class="hero__stage"><div class="hero__ui shell"><div class="hero__lead"><h1 class="hero__h1">${lines}${where}</h1><p class="hero__sub hero__fade">${esc(sub)}</p><div class="hero__actions hero__fade"><a class="pill pill--argon" href="/${lang}/catalog"><span class="pill__label">${esc(t("catalog.title", lang))}</span>${arrow}</a><span class="pill pill--glass"><span class="pill__label">${esc(t("cta.quote", lang))}</span>${arrow}</span></div></div><div class="hero__deck"></div></div></div></section>`;
  };

  return {
    name: "elto-home-html",
    enforce: "post",
    apply: "build",
    generateBundle(_options, bundle) {
      const index = Object.values(bundle).find(
        (a) => a.type === "asset" && a.fileName === "index.html"
      );
      if (!index || index.type !== "asset") return;
      const source = String(index.source);
      if (!/<!--boot-->[\s\S]*<!--\/boot-->/.test(source)) {
        this.error("в index.html нет меток <!--boot--> … <!--/boot-->");
      }

      for (const lang of LANGS) {
        const title = `${heroTitle(lang).full} — Энергосистемы ЭЛТО`;
        const html = source
          .replace(/<!--boot-->[\s\S]*<!--\/boot-->/, hero(lang))
          // фото первого экрана телефона — в очередь сразу из шапки, а не после скриптов
          .replace(
            "</head>",
            `<link rel="preload" as="image" type="image/avif" imagesrcset="${PHONE_HERO_AVIF}" imagesizes="100vw" media="(max-width: 860px)" fetchpriority="high"></head>`
          )
          .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
          .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
          .replace(
            /(<meta\s+name="description"\s+content=")[^"]*(")/,
            `$1${esc(HOME_DESCRIPTION[lang])}$2`
          );
        this.emitFile({ type: "asset", fileName: `home-${lang}.html`, source: html });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineCss(), siteUrl(), homeHtml()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  build: {
    target: "es2022",
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("animejs") || id.includes("lenis")) return "motion";
            if (id.includes("react-router")) return "router";
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    // рабочие папки генерации и сырые исходники — не часть сайта
    watch: {
      ignored: ["**/.flow/**", "**/media-src/**", "**/_source/**", "**/.shots/**"],
    },
  },
});
