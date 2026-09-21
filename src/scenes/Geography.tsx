/**
 * СЦЕНА 06 — ГЕОГРАФИЯ И ПАРТНЁРЫ
 *
 * Самая спокойная сцена: кадр почти не двигается, потому что здесь важна не
 * анимация, а список имён. Сцена состоит из двух частей и на этом же месте
 * меняет грунт: кинематографичное утверждение на графите — и светлая полоса
 * с логотипами.
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

  const partners = (
    table[lang]?.partners?.length ? table[lang].partners : table.ru.partners || []
  ).filter((p) => p.image);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const plate = el.querySelector<HTMLElement>(".geo__plate");

    return registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        seq.current?.draw(p);
        if (plate) {
          plate.style.transform = `scale(${lerp(1.08, 1, span(p, 0, 0.7)).toFixed(4)})`;
          plate.style.opacity = String(lerp(0.5, 0.85, span(p, 0, 0.55)));
        }
      },
    });
  }, []);

  const ready = hasShot("trassa");

  return (
    <>
      <section id="geography" ref={root} className="scene geo" data-ground="dark">
        <div className="geo__stage">
          <div className="geo__plate gpu">
            {ready ? (
              <ScrollSequence
                ref={seq}
                spec={MEDIA.trassa.seq}
                mobileSpec={MEDIA.trassa.mobileSeq}
                poster={MEDIA.trassa.poster}
                className="fill"
              />
            ) : (
              <img className="fill" src={FALLBACK} alt="" aria-hidden="true" />
            )}
          </div>
          <div className="geo__scrim" aria-hidden="true" />

          <div className="shell geo__inner">
            <span className="index">06 — {t("home.partners", lang)}</span>
            {/* обе фразы — дословно из публикации о компании на elto.kz */}
            <Reveal as="h2" className="geo__title display" kind="lines">
              Установлены во всех областных центрах
              <br />
              и крупных городах
            </Reveal>
            <Reveal as="p" className="lead geo__lead" delay={120}>
              Оборудованием укомплектованы тысячи энергетических объектов не только
              в Казахстане, но и странах СНГ.
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
