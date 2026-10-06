/**
 * Формы аргоновой дуги — по одной на сцену главной.
 *
 * Координаты — доли экрана: [0, 0] левый верх, [1, 1] правый низ. Точки
 * за краем экрана нормальны: лента входит в кадр и уходит из него.
 * `local` — прогресс самой сцены 0→1, пока она стоит в кадре; через него
 * лента живёт и внутри сцены, а не только на стыках.
 */

import { NIGHT, PEARL, type ArcShape, type ShapeFn } from "@/motion/arc";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Герой: лента прорезает кадр за панелью изделия и уходит вверх вправо. */
export const heroArc: ShapeFn = (l) => ({
  pts: [
    [1.18, lerp(1.02, 1.1, l)],
    [lerp(0.2, 0.08, l), lerp(1.0, 0.92, l)],
    [lerp(0.42, 0.5, l), lerp(0.02, -0.05, l)],
    [1.2, lerp(0.1, -0.05, l)],
  ],
  spread: lerp(0.15, 0.22, l),
  twist: lerp(1.6, 2.2, l),
  wave: 0.05,
  alpha: 1,
  ground: NIGHT,
  dark: 1,
  taper: 0.55,
});

/**
 * Манифест: лента стягивается в ствол и загибается кронштейном —
 * свет буквально рисует опору освещения. Частые полуобороты дают грани.
 */
export const poleArc: ShapeFn = (l) => ({
  pts: [
    [0.7, 1.12],
    [0.7, lerp(0.34, 0.26, l)],
    [0.7, lerp(0.06, -0.02, l)],
    [lerp(0.86, 0.9, l), lerp(0.16, 0.12, l)],
  ],
  spread: lerp(0.05, 0.034, l),
  twist: 7,
  wave: 0.04,
  alpha: 1,
  ground: NIGHT,
  dark: 1,
  taper: 0.18,
});

/** Производство: на жемчуге лента ложится линией реза под кадром. */
export const cutArc: ShapeFn = (l) => ({
  pts: [
    [-0.12, 0.9],
    [lerp(0.25, 0.35, l), 0.8],
    [lerp(0.65, 0.75, l), 0.95],
    [1.12, 0.86],
  ],
  spread: 0.06,
  twist: lerp(3, 6, l),
  wave: 0.05,
  alpha: 0.95,
  ground: PEARL,
  dark: 0,
  taper: 0.4,
});

/** Сборка: ось света, по которой детали встают в изделие. */
export const axisArc: ShapeFn = (l) => ({
  pts: [
    [0.815, 1.15],
    [0.815, 0.66],
    [0.815, 0.33],
    [0.815, -0.15],
  ],
  spread: lerp(0.09, 0.05, l),
  twist: 3,
  wave: 0.08,
  alpha: 0.7,
  ground: PEARL,
  dark: 0,
  taper: 0.6,
});

/** Перед слоганом: все нити стягиваются в знак в центре кадра. */
export const sealArc: ShapeFn = (l) => ({
  pts: [
    [-0.25, lerp(0.95, 0.7, l)],
    [0.18, 0.62],
    [0.46, 0.5],
    [0.5, 0.5],
  ],
  spread: lerp(0.2, 0.12, l),
  twist: 1.2,
  wave: 0.04,
  alpha: lerp(1, 0.6, l),
  ground: NIGHT,
  dark: 1,
  taper: 1,
});

/** Каталог: широкий тихий веер вдоль левого края, под списком. */
export const fanArc: ShapeFn = (l) => ({
  pts: [
    [-0.1, 1.15],
    [0.1, lerp(0.7, 0.55, l)],
    [-0.02, 0.3],
    [0.22, -0.15],
  ],
  spread: 0.13,
  twist: 1.4,
  wave: 0.1,
  alpha: 0.55,
  ground: PEARL,
  dark: 0,
  taper: 0.7,
});

/** Город: лента уходит за горизонт — сцену держит видео, свет гаснет. */
export const horizonArc: ShapeFn = () => ({
  pts: [
    [-0.15, 0.64],
    [0.35, 0.56],
    [0.65, 0.56],
    [1.15, 0.64],
  ],
  spread: 0.3,
  twist: 0.6,
  wave: 0.1,
  alpha: 0.35,
  ground: NIGHT,
  dark: 1,
  taper: 0.85,
});

/** Партнёры и новости: одна тонкая гравированная диагональ. */
export const quietArc: ShapeFn = (l) => ({
  pts: [
    [1.1, lerp(0.15, 0.05, l)],
    [0.75, 0.35],
    [0.95, 0.75],
    [0.6, 1.15],
  ],
  spread: 0.08,
  twist: 2,
  wave: 0.06,
  alpha: 0.5,
  ground: PEARL,
  dark: 0,
  taper: 0.6,
});

/** Финал: лента обнимает карточку заявки и уходит в подвал. */
export const finaleArc: ShapeFn = (l): ArcShape => ({
  pts: [
    [-0.15, lerp(0.25, 0.4, l)],
    [0.42, lerp(-0.05, 0.1, l)],
    [0.58, 1.05],
    [1.15, lerp(0.7, 0.9, l)],
  ],
  spread: 0.24,
  twist: 1.8,
  wave: 0.05,
  alpha: 0.9,
  ground: NIGHT,
  dark: 1,
  taper: 0.5,
});
