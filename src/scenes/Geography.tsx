/**
 * СЦЕНА 08 — ДОВЕРИЕ
 *
 * Поток отступает вдаль и ложится на горизонт, а камера снижается из
 * леса светящихся колонн к городу, чьи улицы стали схемой света: узлы
 * схемы оказываются рядами фонарей. Утверждение сцены — дословно из
 * публикации о компании на elto.kz: изделия ELTO стоят во всех областных
 * центрах.
 *
 * Ниже — партнёры со страницы «Партнеры» оригинала, в её порядке, одной
 * бегущей лентой. Логотипы нарисованы под белый фон, поэтому каждый
 * стоит на своей светлой плашке; лента останавливается под курсором и
 * при фокусе, а без анимации становится обычной сеткой.
 */

import { useEffect, useRef } from "react";
import ScrollSequence, { type SequenceHandle } from "@/components/motion/ScrollSequence";
import Img from "@/components/ui/Img";
import Pill from "@/components/ui/Pill";
import Title from "@/components/motion/Title";
import { MEDIA, hasShot } from "@/motion/media";
import { registerScene, span, lerp } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { useFlowStop } from "@/motion/use-flow";
import { horizonFlow } from "./flow-shapes";
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
  useFlowStop(root, horizonFlow);

  const partners = (
    table[lang]?.partners?.length ? table[lang].partners : table.ru.partners || []
  ).filter((p) => p.image);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const risePlate = el.querySelector<HTMLElement>(".geo__plate--rise");
    const cityPlate = el.querySelector<HTMLElement>(".geo__plate--city");
    const copy = el.querySelector<HTMLElement>(".geo__copy");
    const stage = el.querySelector<HTMLElement>(".geo__stage");

    return registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        rise.current?.draw(span(p, 0, 0.5));
        seq.current?.draw(span(p, 0.42, 1));
        const swap = span(p, 0.4, 0.54);
        if (risePlate) risePlate.style.opacity = (1 - swap).toFixed(3);
        if (cityPlate) {
          cityPlate.style.opacity = swap.toFixed(3);
          cityPlate.style.transform = `scale(${lerp(1.14, 1, span(p, 0.4, 0.85)).toFixed(4)})`;
        }
        // кадр входит узким окном и раскрывается, но остаётся окном в белой
        // странице: тёмный снимок города не должен заливать экран целиком
        if (stage) {
          const open = span(p, 0, 0.16);
          const v = 8 - open * 3;
          const h = 11 - open * 7;
          stage.style.clipPath = `inset(${v.toFixed(2)}vh ${h.toFixed(2)}vw round 28px)`;
        }
        if (copy) {
          const v = span(p, 0.55, 0.68);
          copy.style.opacity = v.toFixed(3);
          copy.style.transform = `translate3d(0, ${((1 - v) * 24).toFixed(1)}px, 0)`;
        }
      },
    });
  }, []);

  const ready = hasShot("gorod");
  const strip = partners.slice(0, 16);

  return (
    <>
      <section id="geography" ref={root} className="scene geo" data-ground="paper">
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

          <div className="shell geo__copy">
            <h2 className="geo__title">
              {t("geo.title", lang)
                .split(/\*(.+?)\*/)
                .map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))}
            </h2>
            <p className="geo__lead">{t("geo.lead", lang)}</p>
          </div>
        </div>
      </section>

      <section className="partners" data-ground="paper">
        <div className="shell partners__head">
          <Title className="partners__title" text={`${t("home.partners", lang)}`} />
          <Pill tone="glass" to={`/${lang}/partners`}>
            {t("common.more", lang)}
          </Pill>
        </div>
        <div className="partners__belt" tabIndex={-1}>
          <ul className="partners__run">
            {[...strip, ...strip].map((p, i) => (
              <li className="partners__item" key={p.slug + i} aria-hidden={i >= strip.length || undefined}>
                <Img file={p.image} alt={i < strip.length ? p.title : ""} sizes="180px" fit="contain" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
