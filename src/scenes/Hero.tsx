/**
 * СЦЕНА 01 — ПОДЪЁМ
 *
 * Триста двадцать процентов экрана прокрутки и один закреплённый кадр.
 * Скролл здесь — это камера, идущая вверх вдоль мачты: кадр адресуется
 * позицией прокрутки напрямую, а типографика смонтирована в кадр, а не
 * положена поверх него.
 *
 *   0.00–0.14  ещё только знак: зритель понимает, куда попал
 *   0.14–0.46  приходит строка оригинала — «Качество основа доверия к нам»
 *   0.40–0.78  кадр отдаётся цифрам компании
 *   0.78–1.00  кадр темнеет и передаёт сцену следующей
 *
 * Текст слогана и подписи — дословно с elto.kz, ни одного нового слова.
 */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ScrollSequence, { type SequenceHandle } from "@/components/motion/ScrollSequence";
import { MEDIA, hasShot } from "@/motion/media";
import { registerScene, span, hold, lerp } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { imgSrc } from "@/lib/image-url";
import { products, site, topCategories } from "@/lib/data";
import { t, type Lang } from "@/lib/i18n";

/** Пока сцена не отрендерена, кадр держит настоящая фотография объекта ELTO. */
const FALLBACK_POSTER = imgSrc("107978646.jpg", 1600);

/**
 * Слоган и подпись берутся из слайдера оригинала на нужном языке.
 * На казахской версии elto.kz перевода нет — там стоит русский текст с
 * пометкой «kz»; пометку убираем, текст оставляем русским, а не сочиняем
 * собственный перевод.
 */
function heroCopy(lang: Lang) {
  const block = site.home[lang]?.["w-slider"] ?? site.home.ru?.["w-slider"];
  const lines = (block?.text || "")
    .split("\n")
    .map((l) => l.trim().replace(/\s+kz$/i, ""))
    .filter(Boolean);
  const slogan = lines[0] || "Качество - основа доверия к нам";
  const sub = lines[1] || "";
  return { slogan, sub, head: breakLines(slogan) };
}

/**
 * Заголовок режется на строки заранее и вручную.
 *
 * Каждая строка едет из собственной маски, поэтому переносить её должен не
 * браузер: перенос внутри маски обрежет всё, что оказалось ниже первой
 * строки. Дефис оригинала («Качество - основа...») становится тире и
 * остаётся в конце строки, как в типографике.
 */
function breakLines(text: string, perLine = 15): string[] {
  const words = text.replace(/\s+[-–]\s+/g, " — ").split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (line && next.length > perLine) {
      out.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out;
}

export default function Hero({ lang }: { lang: Lang }) {
  const { slogan, sub, head } = heroCopy(lang);
  const root = useRef<HTMLElement>(null);
  const seq = useRef<SequenceHandle>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const q = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel);
    const plate = q(".hero__plate");
    const markEl = q(".hero__mark");
    const titleLines = Array.from(el.querySelectorAll<HTMLElement>(".hero__title .mask > span"));
    const subEl = q(".hero__sub");
    const telEls = Array.from(el.querySelectorAll<HTMLElement>(".hero__tel"));
    const hintEl = q(".hero__hint");
    const fadeEl = q(".hero__fade");
    const cornerEls = Array.from(el.querySelectorAll<HTMLElement>(".hero__corner"));

    if (reducedMotion()) {
      // без движения сцена остаётся читаемым первым экраном
      [markEl, subEl, hintEl, ...titleLines, ...telEls, ...cornerEls].forEach((n) => {
        if (n) n.style.opacity = "1";
      });
      titleLines.forEach((n) => (n.style.transform = "none"));
      return;
    }

    const set = (node: HTMLElement | null, o: number, y = 0, extra = "") => {
      if (!node) return;
      node.style.opacity = String(o);
      node.style.transform = `translate3d(0, ${y}px, 0)${extra}`;
    };

    return registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        seq.current?.draw(p);

        // кадр медленно садится и в конце снова набирает масштаб
        if (plate) {
          const s = p < 0.62 ? lerp(1.1, 1.0, span(p, 0, 0.62)) : lerp(1.0, 1.07, span(p, 0.62, 1));
          plate.style.transform = `scale(${s.toFixed(4)})`;
        }

        // знак передаёт кадр слогану
        const markOut = span(p, 0.06, 0.16);
        set(markEl, 1 - markOut, -46 * markOut, ` blur(${(10 * markOut).toFixed(2)}px)`);
        set(hintEl, 1 - span(p, 0.04, 0.1), 0);

        // строки поднимаются из собственных масок, стоят, уходят вверх
        titleLines.forEach((line, i) => {
          const inA = 0.14 + i * 0.035;
          const y = (1 - span(p, inA, inA + 0.14)) * 118 - span(p, 0.6, 0.72 + i * 0.03) * 118;
          line.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
        });
        set(subEl, hold(p, 0.3, 0.38, 0.6, 0.68), (1 - span(p, 0.3, 0.38)) * 22);

        // цифры компании занимают кадр, пока камера держит план
        telEls.forEach((tel, i) => {
          const a = 0.44 + i * 0.035;
          const v = hold(p, a, a + 0.08, 0.84, 0.92);
          set(tel, v, (1 - span(p, a, a + 0.08)) * 26);
        });

        cornerEls.forEach((c) => {
          c.style.opacity = String(lerp(1, 0.28, span(p, 0.5, 0.72)));
        });

        if (fadeEl) fadeEl.style.opacity = String(span(p, 0.88, 1));
      },
    });
  }, []);

  const ready = hasShot("podem");

  return (
    <section id="hero" ref={root} className="scene hero" data-ground="dark">
      <div className="hero__stage">
        <div className="hero__plate gpu">
          {ready ? (
            <ScrollSequence
              ref={seq}
              spec={MEDIA.podem.seq}
              mobileSpec={MEDIA.podem.mobileSeq}
              portraitSpec={MEDIA.podem.portraitSeq}
              portraitMobileSpec={MEDIA.podem.portraitMobileSeq}
              poster={MEDIA.podem.poster}
              portraitPoster={MEDIA.podem.portraitPoster}
              className="fill"
              eager
            />
          ) : (
            <img className="fill" src={FALLBACK_POSTER} alt="" aria-hidden="true" />
          )}
        </div>

        <div className="hero__scrim" aria-hidden="true" />
        <div className="hero__fade" aria-hidden="true" />

        <div className="hero__ui shell">
          <div className="hero__top">
            <span className="hero__corner label">{t("hero.place", lang)}</span>
            <span className="hero__corner hero__corner--green label">
              {t("hero.since", lang)}
            </span>
          </div>

          <div className="hero__middle">
            <div className="hero__mark">
              <img src="/logo_elto-1.svg" alt="ELTO" width={299} height={111} />
              <p className="hero__tagline label">{t("hero.mark", lang)}</p>
            </div>

            <div className="hero__copy">
              <h1 className="hero__title display display--tight" aria-label={slogan}>
                {head.map((line) => (
                  <span className="mask" key={line}>
                    <span>{line}</span>
                  </span>
                ))}
              </h1>
              <p className="hero__sub lead">{sub}</p>
            </div>

            <div className="hero__telemetry">
              <div className="hero__tel">
                <span className="label">Разделов каталога</span>
                <b className="mono">{topCategories.length}</b>
              </div>
              <div className="hero__tel">
                <span className="label">Позиций продукции</span>
                <b className="mono">{products.length}</b>
              </div>
              <div className="hero__tel">
                <span className="label">Производство</span>
                <b className="mono">Караганда</b>
              </div>
            </div>
          </div>

          <div className="hero__hint">
            <Link to={`/${lang}/catalog`} className="btn btn--solid">
              {t("catalog.title", lang)}
            </Link>
            <span className="label hero__hint-label">{t("hero.scroll", lang)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
