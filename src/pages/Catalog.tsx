/**
 * Каталог.
 *
 * Два входа, как приходят B2B-клиенты:
 *  — «Я знаю, что нужно»: поиск по названию и по маркировке из таблиц
 *    характеристик (СТВ 9, ЗФ-220) и семнадцать разделов оригинала в его
 *    порядке;
 *  — «Помогите подобрать»: подбор по задаче объекта и выход на инженера.
 *
 * Поиск здесь важнее любой анимации: человек, пришедший за опорой СТВ,
 * должен найти её за один приём.
 */

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import ProductCard from "@/components/ui/ProductCard";
import TaskPicker from "@/components/ui/TaskPicker";
import Img from "@/components/ui/Img";
import Seo from "@/components/Seo";
import { products, topCategories } from "@/lib/data";
import { categoryPath } from "@/lib/routes";
import { loadMarks, searchCatalog } from "@/lib/search";
import { CATALOG_DOCS } from "@/lib/contacts";
import { pick, t, type Lang } from "@/lib/i18n";
import { useLead } from "@/components/lead/LeadProvider";

type Marks = Awaited<ReturnType<typeof loadMarks>>;

export default function Catalog({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState("");
  const [marks, setMarks] = useState<Marks | null>(null);
  const q = useDeferredValue(query);
  const openLead = useLead();

  // индекс обозначений нужен только тому, кто начал печатать
  useEffect(() => {
    if (!query || marks) return;
    let alive = true;
    loadMarks().then((m) => alive && setMarks(m));
    return () => {
      alive = false;
    };
  }, [query, marks]);

  const found = useMemo(() => searchCatalog(q, lang, marks), [q, lang, marks]);

  return (
    <div className="page catalog ground-paper" data-ground="paper">
      <Seo
        lang={lang}
        path="/catalog"
        title={t("catalog.title", lang)}
        description={`${topCategories
          .map((c) => pick(c.title, lang))
          .slice(0, 8)
          .join(", ")} — ${products.length} ${t("common.items", lang)}.`}
      />

      <header className="page__head shell catalog__head">
        <span className="index">{t("catalog.title", lang)}</span>
        <Reveal as="h1" className="page__title display" kind="lines" immediate>
          {t("catalog.title", lang)}
        </Reveal>
        <p className="page__meta mono muted">
          {topCategories.length} {t("common.sections", lang)} · {products.length}{" "}
          {t("common.items", lang)}
        </p>

        <div className="search" role="search">
          <label className="search__label label" htmlFor="catalog-q">
            {t("search.know", lang)}
          </label>
          <div className="search__box">
            <svg className="search__icon" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M13 13l4.5 4.5" />
            </svg>
            <input
              id="catalog-q"
              className="search__input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.mark", lang)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      </header>

      {found ? (
        <section className="shell catalog__found" aria-live="polite">
          <p className="label muted catalog__count">
            {found.length} {t("common.items", lang)}
          </p>
          {found.length ? (
            <ul className="grid grid--products">
              {found.map((h) => (
                <ProductCard
                  key={h.product.s}
                  product={h.product}
                  lang={lang}
                  marks={h.marks}
                />
              ))}
            </ul>
          ) : (
            <div className="catalog__empty">
              <p className="lead">{t("common.nothing", lang)}</p>
              <button
                type="button"
                className="btn btn--solid"
                onClick={() => openLead({ mode: "consult", topic: query })}
              >
                {t("cta.consult", lang)}
              </button>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="shell catalog__sections">
            <ul className="grid grid--sections">
              {topCategories.map((c, i) => (
                <li className="sect" key={c.slug}>
                  <Link to={categoryPath(lang, c.slug)}>
                    <div className="sect__shot">
                      <Img
                        file={c.image}
                        alt=""
                        sizes="(max-width: 860px) 46vw, 24vw"
                        fit="contain"
                        /* первый ряд виден сразу и даёт LCP — его не откладываем */
                        priority={i < 4}
                      />
                      <span className="sect__no mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="sect__count mono">{c.count}</span>
                    </div>
                    <h2 className="sect__h title">{pick(c.title, lang)}</h2>
                    <p className="sect__meta mono muted">
                      {c.children.length
                        ? `${c.children.length} ${t("catalog.subsections", lang).toLowerCase()}`
                        : `${c.count} ${t("common.items", lang)}`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="shell catalog__tasks">
            <header className="cat__tasks-head">
              <h2 className="cat__mode label">{t("search.help", lang)}</h2>
              <p className="cat__tasks-title title">{t("task.title", lang)}</p>
              <p className="cat__tasks-lead">{t("task.lead", lang)}</p>
            </header>
            <TaskPicker lang={lang} />
          </section>
        </>
      )}

      <section className="shell">
        <div className="ask">
          <div className="ask__text">
            <p className="ask__h title">{t("lead.title.tz", lang)}</p>
            <p className="ask__p">{t("lead.intro.tz", lang)}</p>
          </div>
          <div className="ask__actions">
            <button
              type="button"
              className="btn btn--solid"
              onClick={() => openLead({ mode: "tz" })}
            >
              {t("cta.tz", lang)}
            </button>
            {CATALOG_DOCS.map((d) => (
              <a
                key={d.href}
                className="btn"
                href={d.href}
                target="_blank"
                rel="noreferrer"
              >
                ↓ {d.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
