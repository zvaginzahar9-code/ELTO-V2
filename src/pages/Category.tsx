/**
 * Раздел каталога.
 *
 * Состав раздела и его подразделы — из выгрузки оригинала. Позиции, которые
 * на elto.kz не приписаны ни к одному разделу, здесь тоже не приписываются
 * задним числом: они живут в общем каталоге, и это честнее, чем придумать им
 * место.
 */

import { Link, useParams } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import BackLink from "@/components/ui/BackLink";
import ProductCard from "@/components/ui/ProductCard";
import { categoryOf, productsIn, topCategories } from "@/lib/data";
import { categoryPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import NotFound from "./NotFound";

export default function Category({ lang }: { lang: Lang }) {
  const { slug = "" } = useParams();
  const cat = categoryOf(slug);
  if (!cat) return <NotFound lang={lang} />;

  const items = productsIn(slug);
  const parent = cat.parent ? categoryOf(cat.parent) : null;
  const children = cat.children.map(categoryOf).filter(Boolean);

  return (
    <div className="page ground-paper" data-ground="paper">
      <header className="page__head shell">
        {/* подраздел возвращает в свой раздел, раздел — в каталог */}
        <BackLink
          to={parent ? categoryPath(lang, parent.slug) : `/${lang}/catalog`}
          label={parent ? pick(parent.title, lang) : t("back.catalog", lang)}
        />
        <nav className="crumbs mono" aria-label="Хлебные крошки">
          <Link to={`/${lang}/catalog`}>{t("catalog.title", lang)}</Link>
          {parent && (
            <>
              <span aria-hidden="true">/</span>
              <Link to={categoryPath(lang, parent.slug)}>{pick(parent.title, lang)}</Link>
            </>
          )}
        </nav>

        <Reveal as="h1" className="page__title display" kind="lines">
          {pick(cat.title, lang)}
        </Reveal>
        <p className="page__meta mono muted">
          {items.length} {t("common.items", lang)}
        </p>

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
