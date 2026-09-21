/**
 * Изображение ELTO.
 *
 * Браузеру отдаются все три ширины в avif и webp — пусть выбирает сам.
 * Пропорции проставляются заранее, чтобы страница не прыгала после загрузки:
 * в каталоге на экране бывает по два десятка карточек, и любой сдвиг там
 * виден сразу.
 */

import { useState } from "react";
import { imgSrc, imgSrcSet } from "@/lib/image-url";

type Props = {
  file: string;
  alt: string;
  sizes?: string;
  className?: string;
  width?: number;
  height?: number;
  /** первый экран — грузим сразу, всё остальное лениво */
  priority?: boolean;
  fit?: "cover" | "contain";
};

export default function Img({
  file,
  alt,
  sizes = "(max-width: 860px) 92vw, 45vw",
  className,
  width,
  height,
  priority = false,
  fit = "contain",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  if (!file) return null;

  return (
    <picture className={className} data-loaded={loaded ? "true" : "false"}>
      <source type="image/avif" srcSet={imgSrcSet(file, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={imgSrcSet(file, "webp")} sizes={sizes} />
      <img
        src={imgSrc(file, 900)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        style={{ objectFit: fit }}
      />
    </picture>
  );
}
