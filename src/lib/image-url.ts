/**
 * Адреса изображений.
 *
 * Все картинки — настоящие файлы завода, пересобранные в webp и avif в трёх
 * ширинах (scripts/build-images.mjs). Здесь только построение адресов: сам
 * компонент лежит в components/ui/Img.
 */

const IMAGE_WIDTHS = [400, 900, 1600] as const;
export type ImageWidth = (typeof IMAGE_WIDTHS)[number];

const imgBase = (file: string) => file.replace(/\.[^.]+$/, "");

export const imgSrc = (file: string, w: ImageWidth = 900) =>
  file ? `/img/${w}/${imgBase(file)}.webp` : "";

export const imgSrcSet = (file: string, ext: "webp" | "avif") =>
  IMAGE_WIDTHS.map((w) => `/img/${w}/${imgBase(file)}.${ext} ${w}w`).join(", ");
