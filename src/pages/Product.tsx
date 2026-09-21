/**
 * СЦЕНА 04 (в карточке изделия) — РАЗРЕЗ
 *
 * У многих позиций ELTO на сайте лежат и заводская фотография, и чертёж.
 * Это и есть самая содержательная анимация, какую здесь можно сделать: пока
 * читаешь описание, кадр сам переходит от изделия к его чертежу — движение
 * объясняет продукт, а не украшает страницу.
 *
 * Если чертежа нет, кадр просто перебирает остальные фотографии позиции.
 * Характеристики проявляются построчно, но остаются обычной таблицей: их
 * можно выделить, скопировать и прочитать с клавиатуры.
 *
 * Весь текст, все названия и все цифры — дословно с elto.kz.
 */

import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { animate, onScroll, stagger } from "animejs";
import Reveal from "@/components/motion/Reveal";
import BackLink from "@/components/ui/BackLink";
import Img from "@/components/ui/Img";
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
import { registerScene, span } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import NotFound from "./NotFound";

export default function Product({ lang }: { lang: Lang }) {
  const { slug = "" } = useParams();
  const brief = productBySlug.get(slug);
  const { data, failed } = useRecord<ProductFull>(slug, loadProduct);
  const mediaRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);

  /* кадр переходит от изделия к чертежу по мере чтения */
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !data || reducedMotion()) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>(".shot__layer"));
    if (layers.length < 2) return;

    return registerScene(el.closest(".product") as HTMLElement, {
      mode: "cover",
      onUpdate(p) {
        const steps = layers.length - 1;
        layers.forEach((layer, i) => {
          if (i === 0) return;
          const from = (i - 1) / steps;
          const to = i / steps;
          const v = span(p, from + 0.04, to - 0.04);
          layer.style.clipPath = `inset(${((1 - v) * 100).toFixed(2)}% 0 0 0)`;
        });
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
      delay: stagger(28),
      ease: "out(3)",
      autoplay: observer,
    });
    return () => {
      rowsIn.revert();
      observer.revert();
    };
  }, [data]);

  if (!brief || failed) return <NotFound lang={lang} />;

  const title = pick(brief.t, lang);
  const leaf = leafCategoryOf(brief);
  const root = leaf?.parent ? categoryOf(leaf.parent) : null;

  /* порядок кадров: сначала фотографии, чертёж — последним */
  const shots = data ? [...data.photos, ...data.drawings].slice(0, 4) : [brief.i];
  const html = data ? rewriteLinks(data.html[lang] || data.html.ru || "", lang) : "";

  return (
    <article className="page product ground-paper" data-ground="paper">
      <div className="shell product__inner">
        <div className="product__media" ref={mediaRef}>
          <div className="product__sticky">
            <div className="shot">
              {shots.filter(Boolean).map((file, i) => (
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
            </div>
            {shots.length > 1 && (
              <p className="shot__hint label muted">
                {data?.drawings.length
                  ? `${t("product.photo", lang)} → ${t("product.drawing", lang)}`
                  : t("product.gallery", lang)}
              </p>
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

          <Reveal as="h1" className="product__title title" kind="lines">
            {title}
          </Reveal>

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
              <h2 className="label product__h">{t("product.specs", lang)}</h2>
              {data.tables.map((table, ti) => (
                <div className="spec-wrap" key={ti}>
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
              <h2 className="label product__h">{t("product.docs", lang)}</h2>
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

          <div className="product__actions">
            <a className="btn btn--solid" href="mailto:sales@elto.kz?subject=Запрос: ">
              {t("product.request", lang)}
            </a>
            <a className="btn" href="tel:+77003700704">
              +7 700 370 07 04
            </a>
          </div>
        </div>
      </div>

      {!!data?.related.length && (
        <section className="shell product__related">
          <h2 className="label product__h">{t("product.related", lang)}</h2>
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
