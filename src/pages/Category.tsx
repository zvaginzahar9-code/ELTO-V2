/**
 * Раздел каталога.
 *
 * Состав раздела и его подразделы — из выгрузки оригинала. Позиции, которые
 * на elto.kz не приписаны ни к одному разделу, здесь тоже не приписываются
 * задним числом.
 *
 * Под сеткой — полоса действий раздела: расчёт с уже подставленным разделом,
 * отправка ТЗ и PDF-каталог, если он к разделу относится.
 */

import { Link, useParams } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import BackLink from "@/components/ui/BackLink";
import ProductCard from "@/components/ui/ProductCard";
import Seo from "@/components/Seo";
import { categoryOf, productsIn, topCategories } from "@/lib/data";
import { categoryPath } from "@/lib/routes";
import { catalogDocFor } from "@/lib/contacts";
import { pick, t, type Lang } from "@/lib/i18n";
import { useLead } from "@/components/lead/LeadProvider";
import NotFound from "./NotFound";

export default function Category({ lang }: { lang: Lang }) {
  const { slug = "" } = useParams();
  const openLead = useLead();
  const cat = categoryOf(slug);
  if (!cat) return <NotFound lang={lang} />;

  const items = productsIn(slug);
  const parent = cat.parent ? categoryOf(cat.parent) : null;
  const children = cat.children.map(categoryOf).filter(Boolean);
  const title = pick(cat.title, lang);
  const doc = catalogDocFor([slug], (s) => categoryOf(s)?.parent);

  return (
    <div className="page ground-paper" data-ground="paper">
      <Seo
        lang={lang}
        path={`/catalog/${slug}`}
        title={title}
        description={`${title}: ${items
          .slice(0, 6)
          .map((p) => pick(p.t, lang))
          .join(", ")}${items.length > 6 ? "…" : ""}`}
      />

      <header className="page__head shell">
        {/* подраздел возвращает в свой раздел, раздел — в каталог */}
        <BackLink
          to={parent ? categoryPath(lang, parent.slug) : `/${lang}/catalog`}
          label={parent ? pick(parent.title, lang) : t("back.catalog", lang)}
        />
        <nav className="crumbs mono" aria-label={t("a11y.crumbs", lang)}>
          <Link to={`/${lang}/catalog`}>{t("catalog.title", lang)}</Link>
          {parent && (
            <>
              <span aria-hidden="true">/</span>
              <Link to={categoryPath(lang, parent.slug)}>{pick(parent.title, lang)}</Link>
            </>
          )}
        </nav>

        <div className="page__titlebar">
          <div>
            <Reveal as="h1" className="page__title display" kind="lines" immediate>
              {title}
            </Reveal>
            <p className="page__meta mono muted">
              {items.length} {t("common.items", lang)}
            </p>
          </div>
          <button
            type="button"
            className="btn btn--solid"
            onClick={() => openLead({ topic: title })}
          >
            {t("cta.quote", lang)}
          </button>
        </div>

        {children.length > 0 && (
          <ul className="chips">
            {children.map((c) => (
              <li key={c!.slug}>
                <Link className="chip" to={categoryPath(lang, c!.slug)}>
                  {pick(c!.title, lang)}
                  <span className="chip__n mono">{c!.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      <section className="shell">
        {items.length ? (
          <ul className="grid grid--products">
            {items.map((p, i) => (
              <ProductCard key={p.s} product={p} lang={lang} index={i} />
            ))}
          </ul>
        ) : (
          <p className="lead">{t("common.nothing", lang)}</p>
        )}
      </section>

      <section className="shell">
        <div className="ask">
          <div className="ask__text">
            <p className="ask__h title">{t("lead.title.quote", lang)}</p>
            <p className="ask__p">{t("product.priceNote", lang)}</p>
          </div>
          <div className="ask__actions">
            <button
              type="button"
              className="btn btn--solid"
              onClick={() => openLead({ topic: title })}
            >
              {t("cta.quote", lang)}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => openLead({ mode: "tz", topic: title })}
            >
              {t("cta.tz", lang)}
            </button>
            {doc && (
              <a className="btn" href={doc.href} target="_blank" rel="noreferrer">
                ↓ {t(`doc.${doc.key}`, lang)}
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="shell related-sections">
        <h2 className="label">{t("catalog.sections", lang)}</h2>
        <ul className="chips">
          {topCategories
            .filter((c) => c.slug !== slug)
            .map((c) => (
              <li key={c.slug}>
                <Link className="chip" to={categoryPath(lang, c.slug)}>
                  {pick(c.title, lang)}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
