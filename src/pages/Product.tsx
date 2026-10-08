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

import { useEffect, useMemo, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Link, useParams } from "react-router-dom";
import { animate, onScroll, stagger } from "animejs";
import Reveal from "@/components/motion/Reveal";
import BackLink from "@/components/ui/BackLink";
import Img from "@/components/ui/Img";
import Seo from "@/components/Seo";
import SpecTable from "@/components/ui/SpecTable";
import {
  categoryOf,
  leafCategoryOf,
  loadProduct,
  productBySlug,
  type ProductFull, localize, descOf } from "@/lib/data";
import { categoryPath, productPath, rewriteLinks } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import { useRecord } from "@/lib/use-record";
import { catalogDocFor, PHONE, PHONE_HREF, whatsappHref } from "@/lib/contacts";
import { reducedMotion } from "@/motion/clock";
import { useLead, useLeadTopic } from "@/components/lead/LeadProvider";
import NotFound from "./NotFound";

export default function Product({ lang }: { lang: Lang }) {
  const { slug = "" } = useParams();
  const brief = productBySlug.get(slug);
  const { data: raw, failed } = useRecord<ProductFull>(slug, loadProduct);
  const data = useMemo(() => localize(raw, lang), [raw, lang]);
  const specRef = useRef<HTMLDivElement>(null);
  const openLead = useLead();
  const title = brief ? pick(brief.t, lang) : "";
  useLeadTopic(title);

  /*
   * Кадры листаются кнопками, а не прокруткой: человек сам решает, когда
   * смотреть чертёж, и страница при чтении текста не меняет картинку.
   */
  const [shot, setShot] = useState(0);
  const [shotFor, setShotFor] = useState(slug);
  if (shotFor !== slug) {
    setShotFor(slug);
    setShot(0);
  }
  const swipe = useRef<number | null>(null);

  /* строки характеристик приходят сверху вниз, как их читают */
  useEffect(() => {
    const el = specRef.current;
    if (!el || !data || reducedMotion()) return;
    const rows = el.querySelectorAll("tbody tr, .spec-card");
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
  const go = (step: number) =>
    setShot((i) => (i + step + shots.length) % shots.length);
  const html = data ? rewriteLinks(data.html[lang] || data.html.ru || "", lang) : "";
  const variants = data?.tables.reduce((n, tb) => n + Math.max(0, tb.length - 1), 0) ?? 0;

  return (
    <article className="page product ground-paper" data-ground="paper">
      <Seo
        lang={lang}
        path={`/product/${slug}`}
        title={title}
        description={data?.description || descOf(brief, lang)}
        type="product"
      />

      <div className="shell product__inner">
        <div className="product__media">
          <div className="product__sticky">
            <div
              className="shot"
              tabIndex={shots.length > 1 ? 0 : undefined}
              aria-roledescription={shots.length > 1 ? "carousel" : undefined}
              aria-label={title}
              onKeyDown={(e) => {
                if (shots.length < 2) return;
                if (e.key === "ArrowLeft") go(-1);
                if (e.key === "ArrowRight") go(1);
              }}
              onPointerDown={(e) => {
                if (e.pointerType !== "mouse") swipe.current = e.clientX;
              }}
              onPointerUp={(e) => {
                // на телефоне кадр перелистывается и пальцем
                if (swipe.current === null) return;
                const dx = e.clientX - swipe.current;
                swipe.current = null;
                if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
              }}
            >
              {shots.map((file, i) => (
                <div
                  className="shot__layer"
                  key={file}
                  data-on={i === shot ? "true" : "false"}
                  aria-hidden={i === shot ? undefined : true}
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
              {shots.length > 1 && (
                <>
                  <button
                    type="button"
                    className="shot__btn shot__btn--prev"
                    onClick={() => go(-1)}
                    aria-label={t("product.prev", lang)}
                  >
                    <CaretLeft weight="bold" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="shot__btn shot__btn--next"
                    onClick={() => go(1)}
                    aria-label={t("product.next", lang)}
                  >
                    <CaretRight weight="bold" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
            {shots.length > 1 && (
              <div className="shot__rail">
                <span className="label muted" aria-live="polite">
                  {shot + 1} / {shots.length}
                </span>
                <span className="shot__ticks">
                  {shots.map((f, i) => (
                    <button
                      type="button"
                      className="shot__tick"
                      key={f}
                      data-on={i === shot ? "true" : "false"}
                      aria-label={`${i + 1} / ${shots.length}`}
                      aria-current={i === shot ? "true" : undefined}
                      onClick={() => setShot(i)}
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
          <nav className="crumbs mono" aria-label={t("a11y.crumbs", lang)}>
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
                  ↓ {t(`doc.${doc.key}`, lang)}
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
            <p className="lead">{descOf(brief, lang)}</p>
          )}

          {!!data?.tables.length && (
            <section className="product__specs" ref={specRef}>
              <h2 className="product__h label">{t("product.specs", lang)}</h2>
              {data.tables.map((table, ti) => (
                <SpecTable key={ti} table={table} label={`${t("product.specs", lang)} ${ti + 1}`} />
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
