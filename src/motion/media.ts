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
});

const shot = (key: string) => ({
  seq: seq(key),
  mobileSeq: seq(`${key}-m`),
  poster: `/media/posters/${key}.jpg`,
});

/**
 * Сцена, у которой есть отдельная вертикальная версия.
 *
 * Нужна не всем: кадр трассы переживает обрезку в 9:16, потому что дорога
 * и так уходит вглубь кадра. А подъём вдоль мачты — нет: от него остаётся
 * середина ствола, и сцена перестаёт читаться.
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
 * Что снимает каждая сцена. Среда и атмосфера — сгенерированы; сами изделия
 * на сайте всегда показываются настоящими фотографиями ELTO.
 */
export const MEDIA = {
  /** 01 — подъём вдоль мачты: кадр адресуется скроллом */
  podem: shotWithPortrait("podem"),
  /** 05 — ночная трасса, освещённая опорами: кадр адресуется скроллом */
  trassa: shot("trassa"),

  /** 02 — линия производства, четыре плиты-петли */
  plazma: loop("plazma"),
  gibka: loop("gibka"),
  svarka: loop("svarka"),
  cink: loop("cink"),
} as const;

export const hasShot = (key: keyof typeof MEDIA) => {
  const m = MEDIA[key] as { seq?: SequenceSpec };
  return (m.seq?.count ?? 0) > 1;
};
