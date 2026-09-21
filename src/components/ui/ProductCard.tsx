/**
 * Карточка изделия.
 *
 * Не «фото · название · описание · цена · подробнее». Кадр вертикальный —
 * по пропорции самих опор; снизу лежит индекс и число таблиц характеристик,
 * чтобы инженер сразу видел, где есть данные. Изображение чуть поднимается
 * при наведении: изделие встаёт, а не увеличивается.
 */

import { Link } from "react-router-dom";
import Img from "@/components/ui/Img";
import { prefetchProduct, type ProductBrief } from "@/lib/data";
import { productPath } from "@/lib/routes";
import { pick, type Lang } from "@/lib/i18n";

type Props = {
  product: ProductBrief;
  lang: Lang;
  index?: number;
};

export default function ProductCard({ product, lang, index }: Props) {
  return (
    <li className="card">
      <Link
        to={productPath(lang, product.s)}
        onMouseEnter={() => prefetchProduct(product.s)}
        onFocus={() => prefetchProduct(product.s)}
      >
        <div className="card__shot">
          <Img
            file={product.i}
            alt={pick(product.t, lang)}
            sizes="(max-width: 700px) 46vw, (max-width: 1100px) 30vw, 22vw"
            fit="contain"
            /* верхний ряд карточек попадает в первый экран: он и есть LCP */
            priority={index !== undefined && index < 4}
          />
          {index !== undefined && (
            <span className="card__no mono">{String(index + 1).padStart(3, "0")}</span>
          )}
        </div>
        <h3 className="card__h">{pick(product.t, lang)}</h3>
        {product.n > 0 && (
          <span className="card__spec label">
            {product.n === 1 ? "таблица характеристик" : "таблиц характеристик: " + product.n}
          </span>
        )}
      </Link>
    </li>
  );
}
