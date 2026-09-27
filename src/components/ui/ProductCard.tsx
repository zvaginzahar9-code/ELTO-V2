/**
 * Карточка изделия.
 *
 * Кадр вертикальный — по пропорции самих опор. Под названием — то, что
 * важно инженеру: есть ли таблицы характеристик, а в результатах поиска —
 * какие обозначения совпали. Изображение чуть поднимается при наведении:
 * изделие встаёт, а не увеличивается.
 */

import { Link } from "react-router-dom";
import Img from "@/components/ui/Img";
import { prefetchProduct, type ProductBrief } from "@/lib/data";
import { productPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";

type Props = {
  product: ProductBrief;
  lang: Lang;
  index?: number;
  /** обозначения из таблиц, совпавшие с поиском */
  marks?: string[];
};

export default function ProductCard({ product, lang, index, marks }: Props) {
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
          {product.n > 0 && (
            <span className="card__spec mono">{t("card.specs", lang)}</span>
          )}
        </div>
        <h3 className="card__h">{pick(product.t, lang)}</h3>
        {marks && marks.length > 0 && (
          <p className="card__marks">
            <span className="label">{t("search.byMark", lang)}</span>
            {marks.map((m) => (
              <span className="card__mark mono" key={m}>
                {m}
              </span>
            ))}
          </p>
        )}
        <span className="card__go mono" aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  );
}
