/**
 * СЦЕНА 04 — СТОЙКА
 *
 * Семнадцать разделов каталога в порядке оригинала. Раздел не «появляется» —
 * он поднимается снизу вверх, как поднимают опору: превью раскрывается
 * маской от основания к вершине. Отсюда и вертикальный формат кадра —
 * пропорции изделий ELTO, а не квадрат карточки.
 *
 * Названия, порядок и счётчики позиций — из выгрузки каталога оригинала.
 */

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import Img from "@/components/ui/Img";
import { topCategories } from "@/lib/data";
import { categoryPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";

export default function CatalogScene({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  return (
    <section id="catalog" className="scene cat ground-paper" data-ground="paper">
      <div className="shell cat__inner">
        <header className="cat__head">
          <span className="index">04 — {t("home.catalog", lang)}</span>
          <Reveal as="h2" className="cat__title display" kind="lines">
            {t("catalog.title", lang)}
          </Reveal>
          <Link className="btn cat__all" to={`/${lang}/catalog`}>
            {t("catalog.all", lang)}
          </Link>
        </header>

        <div className="cat__body">
          <ul className="cat__list" ref={listRef}>
            {topCategories.map((c, i) => (
              <li
                key={c.slug}
                className={"cat__row" + (i === active ? " is-active" : "")}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <Link className="cat__link" to={categoryPath(lang, c.slug)}>
                  <span className="cat__no mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="cat__name title">{pick(c.title, lang)}</span>
                  <span className="cat__count mono">{c.count}</span>
                </Link>

                {/* на телефоне превью живёт внутри строки */}
                <div className="cat__thumb" aria-hidden="true">
                  <Img file={c.image} alt="" sizes="30vw" fit="contain" />
                </div>
              </li>
            ))}
          </ul>

          <div className="cat__stage" aria-hidden="true">
            {topCategories.map((c, i) => (
              <figure
                key={c.slug}
                className={"cat__shot" + (i === active ? " is-on" : "")}
              >
                <Img
                  file={c.image}
                  alt=""
                  sizes="(max-width: 980px) 0px, 34vw"
                  fit="contain"
                />
                <figcaption className="label">{pick(c.title, lang)}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
