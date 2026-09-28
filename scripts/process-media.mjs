#!/usr/bin/env node
/**
 * ELTO — медиаконвейер.
 *
 * Сырые рендеры из Google Flow кладутся в  media-src/<ключ>.mp4
 * Отсюда получается всё, что действительно отдаётся браузеру:
 *
 *   public/media/<ключ>.mp4          h264, без звука, faststart, короткий GOP
 *   public/media/<ключ>-m.mp4        тот же кадр в телефонном весе
 *   public/media/posters/<ключ>.jpg  первая отрисовка и poster для <video>
 *   public/seq/<ключ>/0001.jpg …     раскодированные кадры для скраба
 *   public/seq/<ключ>-m/…            вдвое меньше кадров, меньше размер
 *   src/data/media.json              счётчики кадров, их читает lib/media.ts
 *
 * Скролл-сцены получают кадровые последовательности; фоновые петли — только
 * mp4. Счётчики пишутся из того, что реально выдал ffmpeg, поэтому код не
 * может разойтись с содержимым диска.
 *
 *   node scripts/process-media.mjs             всё, что лежит в media-src
 *   node scripts/process-media.mjs iskra       только одну сцену
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readdir, rm, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "media-src");
const OUT_MEDIA = path.join(ROOT, "public", "media");
const OUT_POSTER = path.join(OUT_MEDIA, "posters");
const OUT_SEQ = path.join(ROOT, "public", "seq");
const COUNTS = path.join(ROOT, "src", "data", "media.json");

/** ключ → как сцена используется на сайте */
const PLAN = {
  // 01 — искра: капля плазмы → осколки → колонна; кадр адресуется скроллом
  iskra: { seq: true, frames: 96, posterAt: 0 },
  "iskra-portrait": { seq: true, frames: 80, posterAt: 0, portrait: true },
  // 04 — сборка опоры: вертикальный кадр и на десктопе
  "sborka-portrait": { seq: true, frames: 96, posterAt: 0.02, portrait: true },
  // 07 — подъём над лесом колонн, затем город-схема
  vzlet: { seq: true, frames: 64, posterAt: 0, q: 8, w: 1280 },
  "vzlet-portrait": { seq: true, frames: 56, posterAt: 0, portrait: true, q: 8 },
  // тёмный детальный кадр плохо жмётся — меньше кадров и чуть сильнее сжатие
  gorod: { seq: true, frames: 64, posterAt: 0.15, q: 9, w: 1280 },
  "gorod-portrait": { seq: true, frames: 56, posterAt: 0.15, portrait: true, q: 9 },
  // 03 — из листа в опору: плиты-петли
  rez: { loop: true, posterAt: 0.5 },
  gib: { loop: true, posterAt: 0.55 },
  styk: { loop: true, posterAt: 0.6 },
  zinc: { loop: true, posterAt: 0.85 },
};

const DESKTOP_W = 1600;
const MOBILE_W = 900;
const SEQ_W = 1440;
const SEQ_W_M = 820;
// вертикальный кадр не надо тянуть до настольной ширины: он и так узкий
const SEQ_W_PORTRAIT = 720;
const SEQ_W_PORTRAIT_M = 480;
const MOBILE_FRAME_DIVISOR = 2;

async function ffprobeDuration(file) {
  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    file,
  ]);
  return parseFloat(stdout.trim());
}

async function ffmpeg(args) {
  await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    maxBuffer: 1024 * 1024 * 64,
  });
}

/** Безопасный для веба h264: без звука, прогрессивный, faststart, короткий GOP. */
async function encode(src, dest, width, crf) {
  await ffmpeg([
    "-i",
    src,
    "-an",
    "-vf",
    `scale=${width}:-2:flags=lanczos,format=yuv420p`,
    "-c:v",
    "libx264",
    "-profile:v",
    "high",
    "-level",
    "4.1",
    "-preset",
    "slow",
    "-crf",
    String(crf),
    "-g",
    "12",
    "-keyint_min",
    "12",
    "-sc_threshold",
    "0",
    "-movflags",
    "+faststart",
    dest,
  ]);
}

async function poster(src, dest, duration, at) {
  await ffmpeg([
    "-ss",
    String(Math.max(0, duration * at)),
    "-i",
    src,
    "-frames:v",
    "1",
    "-vf",
    `scale=${DESKTOP_W}:-2:flags=lanczos`,
    "-q:v",
    "4",
    dest,
  ]);
}

/** Ровный шаг по всему клипу — скраб не должен повторять кадры. */
async function sequence(src, dir, duration, frames, width, quality) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const fps = frames / duration;
  await ffmpeg([
    "-i",
    src,
    "-vf",
    `fps=${fps.toFixed(6)},scale=${width}:-2:flags=lanczos`,
    "-frames:v",
    String(frames),
    "-q:v",
    String(quality),
    path.join(dir, "%04d.jpg"),
  ]);
  return (await readdir(dir)).filter((f) => f.endsWith(".jpg")).length;
}

const mb = (b) => (b / 1024 / 1024).toFixed(2);

async function main() {
  const only = process.argv.slice(2);
  await mkdir(OUT_POSTER, { recursive: true });
  await mkdir(OUT_SEQ, { recursive: true });

  let sources = [];
  try {
    sources = (await readdir(SRC)).filter((f) => /\.(mp4|webm|mov)$/i.test(f));
  } catch {
    console.error(`нет media-src/ — положите сырые рендеры Flow в ${SRC}`);
    process.exit(1);
  }

  const counts = existsSync(COUNTS)
    ? JSON.parse(await (await import("node:fs/promises")).readFile(COUNTS, "utf8"))
    : {};
  let totalBytes = 0;

  for (const file of sources) {
    const key = path.parse(file).name;
    if (only.length && !only.includes(key)) continue;
    const plan = PLAN[key];
    if (!plan) {
      console.warn(`· ${key}: нет записи в PLAN — пропущено`);
      continue;
    }

    const src = path.join(SRC, file);
    const duration = await ffprobeDuration(src);
    console.log(`\n▸ ${key}  (${duration.toFixed(2)} с)`);

    await poster(
      src,
      path.join(OUT_POSTER, `${key}.jpg`),
      duration,
      plan.posterAt ?? 0.5
    );
    console.log(`  постер   готов`);

    if (plan.loop) {
      await encode(src, path.join(OUT_MEDIA, `${key}.mp4`), DESKTOP_W, 21);
      await encode(src, path.join(OUT_MEDIA, `${key}-m.mp4`), MOBILE_W, 26);
      const a = await stat(path.join(OUT_MEDIA, `${key}.mp4`));
      const b = await stat(path.join(OUT_MEDIA, `${key}-m.mp4`));
      totalBytes += a.size + b.size;
      // отметка для сайта: петля существует
      counts[`${key}-loop`] = 1;
      console.log(`  mp4      ${mb(a.size)} МБ · телефон ${mb(b.size)} МБ`);
    }

    if (plan.seq) {
      const wide = plan.w ?? (plan.portrait ? SEQ_W_PORTRAIT : SEQ_W);
      const narrow = plan.portrait ? SEQ_W_PORTRAIT_M : SEQ_W_M;
      const n = await sequence(
        src,
        path.join(OUT_SEQ, key),
        duration,
        plan.frames,
        wide,
        plan.q ?? 7
      );
      const nm = await sequence(
        src,
        path.join(OUT_SEQ, `${key}-m`),
        duration,
        Math.round(plan.frames / MOBILE_FRAME_DIVISOR),
        narrow,
        (plan.q ?? 7) + 2
      );
      counts[key] = n;
      counts[`${key}-m`] = nm;

      let seqBytes = 0;
      for (const d of [key, `${key}-m`]) {
        const dir = path.join(OUT_SEQ, d);
        for (const f of await readdir(dir))
          seqBytes += (await stat(path.join(dir, f))).size;
      }
      totalBytes += seqBytes;
      console.log(`  кадры    ${n} + ${nm} шт · ${mb(seqBytes)} МБ`);
    }
  }

  await writeFile(COUNTS, JSON.stringify(counts, null, 1) + "\n", "utf8");
  console.log(`\n✓ записано ${path.relative(ROOT, COUNTS)}`);
  console.log(`✓ суммарный вес отданного браузеру: ${mb(totalBytes)} МБ\n`);
}

main().catch((err) => {
  console.error(err.stderr?.toString?.() || err);
  process.exit(1);
});
