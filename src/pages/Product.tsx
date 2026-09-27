/**
 * Карточка изделия — технический лист.
 *
 * Слева кадр: пока читаешь, он сам переходит от изделия к заводскому
 * чертежу — движение объясняет продукт, а не украшает страницу. Если чертежа
 * нет, кадр перебирает остальные фотографии позиции.
 *
 * Справа — то, что ищет инженер и снабженец, в порядке важности: название,
 * сводка (раздел, таблицы, число исполнений, документы), действия — цена,
 * ТЗ, звонок, WhatsApp, PDF-каталог, — затем описание, таблицы и документы.
 * Таблицы остаются таблицами: их можно выделить, скопировать и прочитать
 * с клавиатуры; первая колонка с маркировкой не уезжает при прокрутке.
 *
 * Весь текст, все названия и все цифры — дословно с elto.kz.
 */

import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { animate, onScroll, stagger } from "animejs";
import Reveal from "@/components/motion/Reveal";
import BackLink from "@/components/ui/BackLink";
import Img from "@/components/ui/Img";
import Seo from "@/components/Seo";
import {
  categoryOf,
  leafCategoryOf,
  loadProduct,
  productBySlug,
  type ProductFull,
} from "@/lib/data";
import { categoryPath, productPath, rewriteLinks } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import { useRecord } from "@/lib/use-record";
import { catalogDocFor, PHONE, PHONE_HREF, whatsappHref } from "@/lib/contacts";
import { registerScene, span } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { useLead, useLeadTopic } from "@/components/lead/LeadProvider";
import NotFound from "./NotFound";

export default function Product({ lang }: { lang: Lang }) {
  const { slug = "" } = useParams();
  const brief = productBySlug.get(slug);
  const { data, failed } = useRecord<ProductFull>(slug, loadProduct);
  const mediaRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);
  const openLead = useLead();
  const title = brief ? pick(brief.t, lang) : "";
  useLeadTopic(title);

  /* кадр переходит от изделия к чертежу по мере чтения */
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !data || reducedMotion()) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>(".shot__layer"));
    const ticks = Array.from(el.querySelectorAll<HTMLElement>(".shot__tick"));
    if (layers.length < 2) return;

    return registerScene(el.closest(".product") as HTMLElement, {
      mode: "cover",
      onUpdate(p) {
        const steps = layers.length - 1;
        layers.forEach((layer, i) => {
          if (i === 0) return;
          const v = span(p, (i - 1) / steps + 0.04, i / steps - 0.04);
          layer.style.clipPath = `inset(${((1 - v) * 100).toFixed(2)}% 0 0 0)`;
        });
        const at = Math.min(steps, Math.round(p * steps));
        ticks.forEach((tk, i) => tk.setAttribute("data-on", String(i === at)));
      },
    });
  }, [data]);

  /* строки характеристик приходят сверху вниз, как их читают */
  useEffect(() => {
    const el = specRef.current;
    if (!el || !data || reducedMotion()) return;
    const rows = el.querySelectorAll("tbody tr");
    if (!rows.length) return;
    const observer = onScroll({ enter: "bottom-=6% top", repeat: false });
    const rowsIn = animate(rows, {
      opacity: [0, 1],
      y: ["0.7em", "0em"],
      duration: 620,
      delay: stagger(22, { start: 0 }),
      ease: "out(3)",
      autoplay: observer,
    });
    return () => {
      rowsIn.revert();
      observer.revert();
    };
  }, [data]);

  if (!brief || failed) return <NotFound lang={lang} />;

  const leaf = leafCategoryOf(brief);
  const root = leaf?.parent ? categoryOf(leaf.parent) : null;
  const doc = catalogDocFor(brief.c, (s) => categoryOf(s)?.parent);

  /* порядок кадров: сначала фотографии, чертёж — последним */
  const shots = (
    data ? [...data.photos, ...data.drawings].slice(0, 4) : [brief.i]
  ).filter(Boolean);
  const html = data ? rewriteLinks(data.html[lang] || data.html.ru || "", lang) : "";
  const variants = data?.tables.reduce((n, tb) => n + Math.max(0, tb.length - 1), 0) ?? 0;

  return (
    <article className="page product ground-paper" data-ground="paper">
      <Seo
        lang={lang}
        path={`/product/${slug}`}
        title={title}
        description={data?.description || brief.d}
        type="product"
      />

      <div className="shell product__inner">
        <div className="product__media" ref={mediaRef}>
          <div className="product__sticky">
            <div className="shot">
              {shots.map((file, i) => (
                <div
                  className="shot__layer"
                  key={file}
                  style={i === 0 ? undefined : { clipPath: "inset(100% 0 0 0)" }}
                >
                  <Img
                    file={file}
                    alt={i === 0 ? title : `${title} — ${t("product.drawing", lang)}`}
                    sizes="(max-width: 980px) 92vw, 44vw"
                    fit="contain"
                    priority={i === 0}
                  />
                </div>
              ))}
              {/* визирные засечки по углам кадра — как на листе чертежа */}
              <span className="shot__corner shot__corner--tl" aria-hidden="true" />
              <span className="shot__corner shot__corner--br" aria-hidden="true" />
            </div>
            {shots.length > 1 && (
              <div className="shot__rail" aria-hidden="true">
                <span className="label muted">
                  {data?.drawings.length
                    ? `${t("product.photo", lang)} → ${t("product.drawing", lang)}`
                    : t("product.gallery", lang)}
                </span>
                <span className="shot__ticks">
                  {shots.map((f, i) => (
                    <i
                      className="shot__tick"
                      key={f}
                      data-on={i === 0 ? "true" : "false"}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="product__text">
          {/* возврат туда, откуда изделие открывают чаще всего — в его раздел */}
          <BackLink
            to={leaf ? categoryPath(lang, leaf.slug) : `/${lang}/catalog`}
            label={leaf ? pick(leaf.title, lang) : t("back.catalog", lang)}
          />
          <nav className="crumbs mono" aria-label="Хлебные крошки">
            <Link to={`/${lang}/catalog`}>{t("catalog.title", lang)}</Link>
            {root && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={categoryPath(lang, root.slug)}>{pick(root.title, lang)}</Link>
              </>
            )}
            {leaf && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={categoryPath(lang, leaf.slug)}>{pick(leaf.title, lang)}</Link>
              </>
            )}
          </nav>

          <Reveal as="h1" className="product__title title" kind="lines" immediate>
            {title}
          </Reveal>

          {data && (data.tables.length > 0 || data.docs.length > 0) && (
            <dl className="facts">
              {leaf && (
                <div>
                  <dt className="label">{t("product.section", lang)}</dt>
                  <dd>{pick(leaf.title, lang)}</dd>
                </div>
              )}
              {data.tables.length > 0 && (
                <div>
                  <dt className="label">{t("product.specs", lang)}</dt>
                  <dd className="mono">
                    {variants} {t("product.variants", lang)}
                  </dd>
                </div>
              )}
              {data.docs.length > 0 && (
                <div>
                  <dt className="label">{t("product.docs", lang)}</dt>
                  <dd className="mono">{data.docs.length}</dd>
                </div>
              )}
            </dl>
          )}

          <section className="order" aria-label={t("product.actions", lang)}>
            <div className="order__main">
              <button
                type="button"
                className="btn btn--solid order__price"
                onClick={() => openLead({ mode: "quote", topic: title })}
              >
                {t("product.request", lang)}
                <span className="btn__arrow" aria-hidden="true">
                  →
                </span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => openLead({ mode: "tz", topic: title })}
              >
                {t("cta.tz", lang)}
              </button>
            </div>
            <p className="order__note">{t("product.priceNote", lang)}</p>
            <div className="order__links">
              <a href={PHONE_HREF} className="mono">
                {PHONE}
              </a>
              <a
                href={whatsappHref(
                  `${title} — ${t("product.request", lang).toLowerCase()}`
                )}
                target="_blank"
                rel="noreferrer noopener"
              >
                WhatsApp
              </a>
              {doc && (
                <a href={doc.href} target="_blank" rel="noreferrer">
                  ↓ {doc.label}
                </a>
              )}
            </div>
          </section>

          {html ? (
            <div
              className="prose product__prose"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="lead">{brief.d}</p>
          )}

          {!!data?.tables.length && (
            <section className="product__specs" ref={specRef}>
              <h2 className="product__h label">{t("product.specs", lang)}</h2>
              {data.tables.map((table, ti) => (
                <div
                  className="spec-wrap"
                  key={ti}
                  tabIndex={0}
                  role="region"
                  aria-label={`${t("product.specs", lang)} ${ti + 1}`}
                >
                  <table className="spec">
                    <thead>
                      <tr>
                        {table[0].map((cell, i) => (
                          <th key={i}>{cell}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.slice(1).map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </section>
          )}

          {!!data?.docs.length && (
            <section className="product__docs">
              <h2 className="product__h label">{t("product.docs", lang)}</h2>
              <ul className="docs">
                {data.docs.map((d) => (
                  <li key={d.href}>
                    <a href={d.href} target="_blank" rel="noreferrer">
                      ↓ {d.text || d.href.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {!!data?.related.length && (
        <section className="shell product__related">
          <h2 className="product__h label">{t("product.related", lang)}</h2>
          <ul className="grid grid--products">
            {data.related.map((r) => {
              const rb = productBySlug.get(r.slug);
              const cover = rb?.i || r.image;
              return (
                <li className="card" key={r.slug}>
                  <Link to={productPath(lang, r.slug)}>
                    <div className="card__shot" data-empty={cover ? "false" : "true"}>
                      {cover && (
                        <Img
                          file={cover}
                          alt={rb ? pick(rb.t, lang) : r.title}
                          sizes="(max-width: 700px) 46vw, 22vw"
                          fit="contain"
                        />
                      )}
                    </div>
                    <h3 className="card__h">{rb ? pick(rb.t, lang) : r.title}</h3>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
