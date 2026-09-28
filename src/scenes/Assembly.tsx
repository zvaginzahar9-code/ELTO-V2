/**
 * СЦЕНА 04 — СБОРКА
 *
 * Детали опоры висят в жемчужной пустоте и по мере прокрутки собираются в
 * изделие вдоль нити света: анкерные болты, фланец, секции ствола,
 * кронштейн, светильник. Когда узел встаёт на место, рядом появляется
 * выноска, как на чертеже, — и ведёт в раздел каталога, где этот узел
 * лежит. Движение здесь не украшение: оно показывает, из чего состоит
 * изделие, и сразу отправляет к нему.
 *
 * Кадр вертикальный и на десктопе: опора — вертикальный объект, и в 16:9
 * от неё остались бы поля пустоты.
 */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ScrollSequence, { type SequenceHandle } from "@/components/motion/ScrollSequence";
import { MEDIA } from "@/motion/media";
import { registerScene, span } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { categoryOf, products, topCategories } from "@/lib/data";
import { categoryPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import { useLead } from "@/components/lead/LeadProvider";

/**
 * Выноски: раздел каталога, момент сборки, когда узел встаёт на место,
 * и высота узла в кадре (доля от верха) — по конечному кадру ролика.
 */
const CALLOUTS = [
  { slug: "zakladnye-detali-fundamenta", at: 0.14, y: 0.9 },
  { slug: "opory-osveshcheniya-granyonye", at: 0.42, y: 0.55 },
  { slug: "kronshteyny-opor-osveshcheniya", at: 0.66, y: 0.26 },
  { slug: "svetodiodnye-svetilniki", at: 0.84, y: 0.12 },
]
  .map((c) => ({ ...c, cat: categoryOf(c.slug) }))
  .filter((c) => c.cat);

export default function Assembly({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const seq = useRef<SequenceHandle>(null);
  const openLead = useLead();
  const shot = MEDIA.sborka;
  const ready = (shot.portraitSeq.count ?? 0) > 1;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const tags = Array.from(el.querySelectorAll<HTMLElement>(".asm__tag"));
    if (reducedMotion()) {
      seq.current?.draw(1);
      tags.forEach((n) => n.setAttribute("data-on", "true"));
      return;
    }
    return registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        // сборка занимает середину сцены: в начале детали успевают «повисеть»
        seq.current?.draw(span(p, 0.08, 0.88));
        const local = span(p, 0.08, 0.88);
        tags.forEach((n, i) =>
          n.setAttribute("data-on", String(local >= CALLOUTS[i].at))
        );
      },
    });
  }, []);

  return (
    <section
      id="assembly"
      ref={root}
      className="scene asm ground-paper"
      data-ground="paper"
    >
      <div className="asm__stage">
        <div className="shell asm__inner">
          <div className="asm__text">
            <span className="index">04 — {t("home.assembly", lang)}</span>
            <h2 className="asm__title display">{t("assembly.title", lang)}</h2>
            <p className="asm__lead lead">{t("assembly.lead", lang)}</p>
            <dl className="asm__figures">
              <div>
                <dt className="label">{t("common.sections", lang)}</dt>
                <dd className="mono">{topCategories.length}</dd>
              </div>
              <div>
                <dt className="label">{t("common.items", lang)}</dt>
                <dd className="mono">{products.length}</dd>
              </div>
            </dl>
            <div className="asm__actions">
              <Link className="btn btn--solid" to={`/${lang}/catalog`}>
                <span className="btn__full">{t("catalog.title", lang)}</span>
                <span className="btn__short">{t("cta.catalog", lang)}</span>
                <span className="btn__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <button type="button" className="btn" onClick={() => openLead()}>
                {t("cta.quote", lang)}
              </button>
            </div>
          </div>

          <div className="asm__frame">
            <div className="asm__plate">
              {ready ? (
                <ScrollSequence
                  ref={seq}
                  spec={shot.portraitSeq}
                  mobileSpec={shot.portraitMobileSeq}
                  poster={shot.portraitPoster}
                  className="fill"
                />
              ) : (
                <img
                  className="fill"
                  src={shot.portraitPoster}
                  alt=""
                  aria-hidden="true"
                />
              )}
            </div>
            <ul className="asm__tags">
              {CALLOUTS.map((c) => (
                <li
                  key={c.slug}
                  className="asm__tag"
                  data-on="false"
                  style={{ top: `${c.y * 100}%` }}
                >
                  <Link to={categoryPath(lang, c.slug)}>
                    <span className="asm__tag-line" aria-hidden="true" />
                    <span className="asm__tag-text">
                      {pick(c.cat!.title, lang)}
                      <span className="mono">{c.cat!.count}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
