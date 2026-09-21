/**
 * Каталог.
 *
 * Семнадцать разделов оригинала в его же порядке, плюс живой поиск по всем
 * 268 позициям. Поиск здесь важнее любой анимации: человек, пришедший за
 * опорой СТВ, должен найти её за один приём.
 */

import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import BackLink from "@/components/ui/BackLink";
import ProductCard from "@/components/ui/ProductCard";
import Img from "@/components/ui/Img";
import { products, topCategories, categoryOf } from "@/lib/data";
import { categoryPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").trim();

export default function Catalog({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query);

  const found = useMemo(() => {
    const needle = norm(q);
    if (needle.length < 2) return null;
    return products.filter((p) => {
      const title = norm(pick(p.t, lang));
      return title.includes(needle) || norm(p.d).includes(needle);
    });
  }, [q, lang]);

  return (
    <div className="page ground-paper" data-ground="paper">
      <header className="page__head shell">
        <BackLink to={`/${lang}`} label={t("back.home", lang)} />
        <span className="index">{t("catalog.title", lang)}</span>
        <Reveal as="h1" className="page__title display" kind="lines">
          {t("catalog.title", lang)}
        </Reveal>
        <p className="page__meta mono muted">
          {topCategories.length} {t("common.sections", lang)} · {products.length}{" "}
          {t("common.items", lang)}
        </p>

        <div className="search">
          <input
            className="search__input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.search", lang)}
            aria-label={t("common.search", lang)}
          />
        </div>
      </header>

      {found ? (
        <section className="shell catalog__found">
          <p className="label muted catalog__count">
            {found.length} {t("common.items", lang)}
          </p>
          {found.length ? (
            <ul className="grid grid--products">
              {found.map((p) => (
                <ProductCard key={p.s} product={p} lang={lang} />
              ))}
            </ul>
          ) : (
            <p className="lead">{t("common.nothing", lang)}</p>
          )}
        </section>
      ) : (
        <section className="shell catalog__sections">
          <ul className="grid grid--sections">
            {topCategories.map((c, i) => {
              const node = categoryOf(c.slug);
              return (
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
                      <span className="sect__no mono">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h2 className="sect__h title">{pick(c.title, lang)}</h2>
                    <p className="sect__meta mono muted">
                      {c.count} {t("common.items", lang)}
                      {node?.children.length
                        ? ` · ${node.children.length} ${t("catalog.subsections", lang).toLowerCase()}`
                        : ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
