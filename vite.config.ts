import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import catalog from "./src/data/catalog.json";
import { LANGS, pick, t, type Lang } from "./src/lib/i18n";
import { HOME_DESCRIPTION, QUICK_SECTIONS, heroTitle } from "./src/scenes/hero-copy";

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
 * те же кнопки и входы в разделы, из тех же строк, что и сцена. Стили к этому
 * моменту уже внутри документа (inlineCss), так что кадр совпадает с тем,
 * что потом нарисует React. vercel.json отдаёт эти страницы на /ru, /kk, /en.
 */
function homeHtml(): Plugin {
  type Node = { title: Partial<Record<Lang, string>>; count: number };
  const cats = (catalog as unknown as { categories: Record<string, Node> }).categories;
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  const hero = (lang: Lang) => {
    const title = heroTitle(lang);
    const lines = title.lines
      .map((l) => `<span class="mask"><span>${esc(l)}</span></span>`)
      .join("");
    const where = title.where
      ? `<span class="mask hero__h1-where"><span>${esc(title.where)}</span></span>`
      : "";
    const chips = QUICK_SECTIONS.filter((s) => cats[s])
      .map(
        (s) =>
          `<li><a class="hero__chip" href="/${lang}/catalog/${s}">${esc(pick(cats[s].title, lang))}<span class="mono">${cats[s].count}</span></a></li>`
      )
      .join("");
    return `<section class="scene hero ground-paper hero--boot" data-ground="paper"><div class="hero__stage"><div class="hero__scrim" aria-hidden="true"></div><div class="hero__ui shell"><div class="hero__top"><span class="hero__corner label">${esc(t("hero.place", lang))}</span><span class="hero__corner hero__corner--lit label">${esc(t("hero.since", lang))}</span></div><div class="hero__middle"><div class="hero__lead"><h1 class="hero__h1 display">${lines}${where}</h1><div class="hero__actions"><a class="btn btn--solid" href="/${lang}/catalog">${esc(t("catalog.title", lang))}<span class="btn__arrow" aria-hidden="true">→</span></a><span class="btn">${esc(t("cta.quote", lang))}</span><span class="link-arrow hero__consult"><span>${esc(t("cta.consult", lang))}</span><span aria-hidden="true">→</span></span></div></div></div><nav class="hero__quick"><span class="hero__quick-label label">${esc(t("hero.quick", lang))}</span><ul>${chips}</ul></nav></div></div></section>`;
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
