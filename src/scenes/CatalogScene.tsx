/**
 * СЦЕНА 04 — СТОЙКА
 *
 * Семнадцать разделов каталога в порядке оригинала. Раздел не «появляется» —
 * он поднимается снизу вверх, как поднимают опору: превью раскрывается
 * маской от основания к вершине. Отсюда и вертикальный формат кадра —
 * пропорции изделий ELTO, а не квадрат карточки.
 *
 * Ниже — второй вход для тех, кто не знает маркировку: подбор по задаче.
 *
 * Названия, порядок и счётчики позиций — из выгрузки каталога оригинала.
 */

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import Img from "@/components/ui/Img";
import TaskPicker from "@/components/ui/TaskPicker";
import { topCategories } from "@/lib/data";
import { categoryPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import { useArcStop } from "@/motion/use-arc";
import { fanArc } from "./arc-shapes";

export default function CatalogScene({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0);
  const [all, setAll] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const root = useRef<HTMLElement>(null);
  useArcStop(root, fanArc);

  return (
    <section id="catalog" ref={root} className="scene cat ground-paper" data-ground="paper">
      <div className="shell cat__inner">
        <header className="cat__head">
          <span className="index">{t("home.catalog", lang)}</span>
          <Reveal as="h2" className="cat__title display" kind="lines">
            {(() => {
              const [first, ...rest] = t("catalog.title", lang).split(" ");
              return rest.length ? (
                <>
                  {first} <em>{rest.join(" ")}</em>
                </>
              ) : (
                first
              );
            })()}
          </Reveal>
          <Link className="btn btn--ink cat__all" to={`/${lang}/catalog`}>
            {t("catalog.all", lang)}
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </header>

        <h3 className="cat__mode label">{t("search.know", lang)}</h3>

        <div className="cat__body">
          <ul className={"cat__list" + (all ? " is-all" : "")} ref={listRef}>
            {topCategories.map((c, i) => (
              <li
                key={c.slug}
                className={"cat__row" + (i === active ? " is-active" : "")}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <Link className="cat__link" to={categoryPath(lang, c.slug)}>
                  {/* на телефоне строка становится плиткой, и превью — её лицо */}
                  <span className="cat__thumb" aria-hidden="true">
                    <Img file={c.image} alt="" sizes="(max-width: 860px) 44vw, 0px" fit="contain" />
                  </span>
                  <span className="cat__no mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="cat__name title">{pick(c.title, lang)}</span>
                  <span className="cat__count mono">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* семнадцать плиток подряд — это три экрана; на телефоне сначала восемь */}
          {!all && (
            <button
              type="button"
              className="btn cat__more"
              onClick={() => setAll(true)}
            >
              {t("catalog.showAll", lang)}
              <span className="mono">{topCategories.length}</span>
            </button>
          )}

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

        <div className="cat__tasks">
          <header className="cat__tasks-head">
            <h3 className="cat__mode label">{t("search.help", lang)}</h3>
            <Reveal as="p" className="cat__tasks-title title">
              {t("task.title", lang)}
            </Reveal>
            <p className="cat__tasks-lead">{t("task.lead", lang)}</p>
          </header>
          <TaskPicker lang={lang} />
        </div>
      </div>
    </section>
  );
}
