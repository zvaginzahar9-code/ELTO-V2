/**
 * Единственный источник правды о сгенерированных сценах.
 *
 * Счётчики кадров пишет scripts/process-media.mjs прямо из того, что выдал
 * ffmpeg, поэтому скраберы и прелоадер не могут разойтись с тем, что лежит
 * на диске. Ещё не отрендеренная сцена сообщает count = 0, и страница
 * спокойно остаётся на постере.
 */

import counts from "@/data/media.json";
import type { SequenceSpec } from "./sequence";

const table = counts as Record<string, number | undefined>;

const seq = (key: string): SequenceSpec => ({
  dir: `/seq/${key}`,
  count: table[key] ?? 0,
  // сцены первого экрана нарезаны в webp — конвейер отмечает это в media.json
  ext: table[`${key}:webp`] ? "webp" : "jpg",
});

const shot = (key: string) => ({
  seq: seq(key),
  mobileSeq: seq(`${key}-m`),
  poster: `/media/posters/${key}.jpg`,
});

/**
 * Сцена с отдельной вертикальной версией. На телефоне кадр 16:9 обрезается
 * до середины, и сцены, построенные по вертикали (колонна, сборка опоры),
 * перестают читаться — поэтому для них сгенерированы свои кадры 9:16.
 */
const shotWithPortrait = (key: string) => ({
  ...shot(key),
  portraitSeq: seq(`${key}-portrait`),
  portraitMobileSeq: seq(`${key}-portrait-m`),
  portraitPoster: `/media/posters/${key}-portrait.jpg`,
});

const loop = (key: string) => ({
  video: `/media/${key}.mp4`,
  mobile: `/media/${key}-m.mp4`,
  poster: `/media/posters/${key}.jpg`,
});

/**
 * Сцены мира ARGON: жемчужная пустота, жидкий хром, плазма аргоновой дуги.
 * Это метафоры, а не съёмка завода; изделия на сайте всегда показываются
 * настоящими фотографиями ELTO.
 */
export const MEDIA = {
  /** 01 — искра: капля плазмы разбивается в осколки, из них растёт колонна */
  iskra: shotWithPortrait("iskra"),
  /** 04 — сборка: детали опоры собираются в изделие по оси света */
  sborka: shotWithPortrait("sborka"),
  /** 07 — взлёт: камера поднимается из леса колонн над туманом к сетке огней */
  vzlet: shotWithPortrait("vzlet"),
  /** 07 — город: камера снижается к городу, чьи улицы стали схемой света */
  gorod: shotWithPortrait("gorod"),

  /** 03 — из листа в опору: четыре плиты-петли */
  rez: loop("rez"),
  gib: loop("gib"),
  styk: loop("styk"),
  zinc: loop("zinc"),
} as const;

export const hasShot = (key: keyof typeof MEDIA) => {
  const m = MEDIA[key] as { seq?: SequenceSpec };
  return (m.seq?.count ?? 0) > 1;
};
