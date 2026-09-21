#!/usr/bin/env node
/**
 * ELTO — конвейер изображений.
 *
 * Вход:  _source/photos/*            оригиналы, скачанные с elto.kz
 * Выход: public/img/<w>/<name>.webp  и .avif — три ширины
 *        _source/image-meta.json     размеры и тип каждого файла
 *
 * Тип определяется по самому изображению, а не по имени файла: заводской
 * чертёж — это почти бесцветная штриховая графика на белом, фотография —
 * нет. Имена файлов на оригинале для этого непригодны (`uzly_00004.jpg`
 * может быть и тем, и другим).
 *
 *   node scripts/build-images.mjs          всё, чего ещё нет
 *   node scripts/build-images.mjs --force  пересобрать
 */

import sharp from "sharp";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "_source", "photos");
const OUT = path.join(ROOT, "public", "img");
const META = path.join(ROOT, "_source", "image-meta.json");

const WIDTHS = [400, 900, 1600];
const FORCE = process.argv.includes("--force");
const META_ONLY = process.argv.includes("--meta-only");

sharp.cache(false);
sharp.concurrency(Math.max(2, (await import("node:os")).cpus().length - 1));

/**
 * Чертёж или фотография.
 *
 * Отличать по насыщенности нельзя: горячеоцинкованная сталь сама по себе
 * серая, и снятая на белом фоне опора по цвету неотличима от чертежа.
 * Работает структура. У штрихового чертежа почти каждый небелый пиксель —
 * это линия, то есть край; у фотографии небелое — это гладкая заливка тела
 * изделия с тенью. Поэтому считаем долю краёв среди небелых пикселей
 * (Собель на 256 px) вместе с долей чистого белого.
 *
 * Замеры на реальных файлах ELTO: чертежи 0.75–0.85, фотографии 0.13–0.47.
 */
async function classify(img) {
  const { data, info } = await img
    .clone()
    .resize(256, 256, { fit: "inside" })
    .removeAlpha()
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;
  let white = 0;
  let nonWhite = 0;
  let edges = 0;

  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (data[i] > 242) {
        white++;
        continue;
      }
      nonWhite++;
      const gx =
        -data[i - W - 1] - 2 * data[i - 1] - data[i + W - 1] +
        data[i - W + 1] + 2 * data[i + 1] + data[i + W + 1];
      const gy =
        -data[i - W - 1] - 2 * data[i - W] - data[i - W + 1] +
        data[i + W - 1] + 2 * data[i + W] + data[i + W + 1];
      if (Math.hypot(gx, gy) > 90) edges++;
    }
  }

  const n = white + nonWhite || 1;
  const whiteRatio = white / n;
  const edgeRatio = edges / (nonWhite || 1);
  const kind = whiteRatio > 0.5 && edgeRatio > 0.6 ? "drawing" : "photo";
  return {
    kind,
    whiteRatio: +whiteRatio.toFixed(3),
    edgeRatio: +edgeRatio.toFixed(3),
  };
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(`нет ${SRC} — сначала выгрузка оригинала`);
    process.exit(1);
  }
  for (const w of WIDTHS) await mkdir(path.join(OUT, String(w)), { recursive: true });

  const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
  const meta = {};
  let built = 0;
  let skipped = 0;

  const queue = [...files];
  const workers = Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const f = queue.pop();
      const base = f.replace(/\.[^.]+$/, "");
      const src = path.join(SRC, f);
      try {
        const img = sharp(src, { failOn: "none" });
        const m = await img.metadata();
        const cls = await classify(img);
        meta[f] = {
          w: m.width,
          h: m.height,
          kind: cls.kind,
          whiteRatio: cls.whiteRatio,
          edgeRatio: cls.edgeRatio,
        };

        if (META_ONLY) continue;

        // все три ширины собираются всегда: srcset не должен ссылаться на
        // файл, которого нет. Апскейла не будет — withoutEnlargement отдаст
        // исходный размер, и браузер просто выберет его.
        for (const w of WIDTHS) {
          const webp = path.join(OUT, String(w), `${base}.webp`);
          const avif = path.join(OUT, String(w), `${base}.avif`);
          const need = FORCE || !existsSync(webp) || !existsSync(avif);
          if (!need) {
            skipped++;
            continue;
          }
          const base_ = sharp(src, { failOn: "none" })
            .rotate()
            .resize({ width: w, withoutEnlargement: true, fit: "inside" })
            .flatten({ background: "#ffffff" });
          await base_.clone().webp({ quality: 82, effort: 4 }).toFile(webp);
          await base_.clone().avif({ quality: 52, effort: 4 }).toFile(avif);
          built++;
        }
      } catch (e) {
        console.warn(`  ! ${f}: ${e.message}`);
      }
    }
  });
  await Promise.all(workers);

  await writeFile(META, JSON.stringify(meta, null, 1), "utf8");

  const drawings = Object.values(meta).filter((m) => m.kind === "drawing").length;
  console.log(`✓ исходников:  ${files.length}`);
  console.log(`✓ собрано:     ${built} вариантов (пропущено готовых ${skipped})`);
  console.log(`✓ чертежей:    ${drawings}`);
  console.log(`✓ фотографий:  ${files.length - drawings}`);
  console.log(`✓ метаданные:  ${path.relative(ROOT, META)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
