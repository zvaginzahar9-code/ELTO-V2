/**
 * СЦЕНА 06 — ГЕОГРАФИЯ И ПАРТНЁРЫ
 *
 * Камера снижается из стратосферы к городу, чьи улицы стали схемой света:
 * узлы схемы оказываются рядами фонарей. Это и есть утверждение сцены —
 * изделия ELTO стоят в областных центрах по всей стране. Затем грунт
 * меняется: светлая полоса с логотипами партнёров.
 *
 * Полоса светлая не ради контраста: логотипы партнёров нарисованы под белый
 * фон, и на графите половина из них просто исчезает.
 *
 * Названия и логотипы — со страницы «Партнеры» оригинала, в её порядке.
 */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import ScrollSequence, { type SequenceHandle } from "@/components/motion/ScrollSequence";
import { MEDIA, hasShot } from "@/motion/media";
import { registerScene, span, lerp } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import Img from "@/components/ui/Img";
import { imgSrc } from "@/lib/image-url";
import views from "@/data/views.json";
import { t, type Lang } from "@/lib/i18n";

const FALLBACK = imgSrc("uepdhfvotuc.jpg", 1600);

type Partner = { slug: string; title: string; image: string };
const table = views as unknown as Record<Lang, Record<string, Partner[]>>;

export default function Geography({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const seq = useRef<SequenceHandle>(null);
  const rise = useRef<SequenceHandle>(null);

  const partners = (
    table[lang]?.partners?.length ? table[lang].partners : table.ru.partners || []
  ).filter((p) => p.image);

  /*
   * Две половины одной сцены. Сначала камера поднимается из леса светящихся
   * колонн над туманом, и сверху колонны складываются в сетку огней; потом
   * сетка перетекает в город, к которому камера снижается. Текст приходит,
   * когда город уже виден.
   */
  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const risePlate = el.querySelector<HTMLElement>(".geo__plate--rise");
    const cityPlate = el.querySelector<HTMLElement>(".geo__plate--city");
    const copy = el.querySelector<HTMLElement>(".geo__inner");
    const scrim = el.querySelector<HTMLElement>(".geo__scrim");

    return registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        rise.current?.draw(span(p, 0, 0.5));
        seq.current?.draw(span(p, 0.42, 1));
        const swap = span(p, 0.4, 0.54);
        if (risePlate) risePlate.style.opacity = (1 - swap).toFixed(3);
        if (cityPlate) {
          cityPlate.style.opacity = swap.toFixed(3);
          cityPlate.style.transform = `scale(${lerp(1.12, 1, span(p, 0.4, 0.8)).toFixed(4)})`;
        }
        if (scrim) scrim.style.opacity = span(p, 0.5, 0.66).toFixed(3);
        if (copy) {
          const v = span(p, 0.55, 0.68);
          copy.style.opacity = v.toFixed(3);
          copy.style.transform = `translate3d(0, ${((1 - v) * 24).toFixed(1)}px, 0)`;
        }
      },
    });
  }, []);

  const ready = hasShot("gorod");

  return (
    <>
      <section id="geography" ref={root} className="scene geo" data-ground="dark">
        <div className="geo__stage">
          {hasShot("vzlet") && (
            <div className="geo__plate geo__plate--rise gpu">
              <ScrollSequence
                ref={rise}
                spec={MEDIA.vzlet.seq}
                mobileSpec={MEDIA.vzlet.mobileSeq}
                portraitSpec={MEDIA.vzlet.portraitSeq}
                portraitMobileSpec={MEDIA.vzlet.portraitMobileSeq}
                poster={MEDIA.vzlet.poster}
                portraitPoster={MEDIA.vzlet.portraitPoster}
                className="fill"
              />
            </div>
          )}
          <div className="geo__plate geo__plate--city gpu">
            {ready ? (
              <ScrollSequence
                ref={seq}
                spec={MEDIA.gorod.seq}
                mobileSpec={MEDIA.gorod.mobileSeq}
                portraitSpec={MEDIA.gorod.portraitSeq}
                portraitMobileSpec={MEDIA.gorod.portraitMobileSeq}
                poster={MEDIA.gorod.poster}
                portraitPoster={MEDIA.gorod.portraitPoster}
                className="fill"
              />
            ) : (
              <img className="fill" src={FALLBACK} alt="" aria-hidden="true" />
            )}
          </div>
          <div className="geo__scrim" aria-hidden="true" />

          <div className="shell geo__inner">
            <span className="index">07 — {t("home.partners", lang)}</span>
            {/* обе фразы — дословно из публикации о компании на elto.kz */}
            <Reveal as="h2" className="geo__title display" kind="lines">
              Установлены во всех областных центрах
              <br />и крупных городах
            </Reveal>
            <Reveal as="p" className="lead geo__lead" delay={120}>
              Оборудованием укомплектованы тысячи энергетических объектов не только в
              Казахстане, но и странах СНГ.
            </Reveal>
          </div>
        </div>
      </section>

      <section className="partners ground-paper" data-ground="paper">
        <div className="shell partners__inner">
          <div className="partners__head">
            <h2 className="label partners__h">{t("home.partners", lang)}</h2>
            <Link className="btn" to={`/${lang}/partners`}>
              {t("common.all", lang)}
            </Link>
          </div>
          <ul className="partners__grid">
            {partners.slice(0, 14).map((p) => (
              <li className="partners__item" key={p.slug}>
                <Img
                  file={p.image}
                  alt={p.title}
                  sizes="(max-width: 860px) 40vw, 14vw"
                  fit="contain"
                />
                <span className="label partners__name">{p.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
