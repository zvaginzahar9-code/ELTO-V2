import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

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

export default defineConfig({
  plugins: [react(), inlineCss()],
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
  server: { port: 5173, host: true },
});
