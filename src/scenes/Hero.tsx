/**
 * СЦЕНА 01 — ПОДЪЁМ
 *
 * Первый экран обязан ответить за пять секунд: что это за компания, что она
 * делает и где каталог. Поэтому заголовок, «Каталог», «Запросить расчёт» и
 * входы в главные разделы стоят в кадре сразу, до всякой прокрутки.
 *
 * Дальше скролл управляет самой сценой: в жемчужной пустоте капля плазмы
 * падает на стальной диск, разбивается в хромовую корону, осколки спиралью
 * поднимаются и собираются в гранёную колонну. Искра становится
 * конструкцией — это и есть ELTO одним кадром.
 *
 *   0.00–0.30  заголовок уходит вверх, капля падает и разбивается
 *   0.26–0.60  строка оригинала — «Качество — основа доверия к нам»
 *   0.52–0.86  кадр отдаётся цифрам каталога
 *   0.86–1.00  кадр темнеет и передаёт сцену следующей
 *
 * Слоган и подпись — дословно с elto.kz.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import ScrollSequence, { type SequenceHandle } from "@/components/motion/ScrollSequence";
import { MEDIA, hasShot } from "@/motion/media";
import { registerScene, span, hold, lerp } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { categoryOf, products, site, topCategories } from "@/lib/data";
import { categoryPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import { useLead } from "@/components/lead/LeadProvider";
import { QUICK_SECTIONS, breakLines, heroTitle } from "./hero-copy";

/**
 * Слоган и подпись — из слайдера оригинала на нужном языке. На казахской
 * версии elto.kz перевода нет — там стоит русский текст с пометкой «kz»;
 * пометку убираем, текст оставляем русским.
 */
function heroCopy(lang: Lang) {
  const block = site.home[lang]?.["w-slider"] ?? site.home.ru?.["w-slider"];
  const lines = (block?.text || "")
    .split("\n")
    .map((l) => l.trim().replace(/\s+kz$/i, ""))
    .filter(Boolean);
  const slogan = (lines[0] || "Качество - основа доверия к нам").replace(
    /\s+[-–]\s+/g,
    " — "
  );
  return { slogan, sub: lines[1] || "" };
}

/**
 * Первый экран главной уже лежит в HTML (см. hero-copy.ts): если сцена
 * подхватывает его, строки заголовка не въезжают второй раз.
 */
let bootConsumed = false;
function takeBoot() {
  if (bootConsumed) return false;
  bootConsumed = true;
  return document.documentElement.dataset.boot === "hero";
}

export default function Hero({ lang }: { lang: Lang }) {
  const { slogan, sub } = heroCopy(lang);
  const title = heroTitle(lang);
  const [booted] = useState(takeBoot);
  const root = useRef<HTMLElement>(null);
  const seq = useRef<SequenceHandle>(null);
  const openLead = useLead();

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const q = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel);
    const qa = (sel: string) => Array.from(el.querySelectorAll<HTMLElement>(sel));
    const plate = q(".hero__plate");
    const glow = q(".hero__glow");
    const lead = q(".hero__lead");
    const leadLines = qa(".hero__h1 .mask > span");
    const sloganLines = qa(".hero__slogan .mask > span");
    const subEl = q(".hero__sub");
    const telEls = qa(".hero__tel");
    const fadeEl = q(".hero__fade");
    const cornerEls = qa(".hero__corner");

    if (reducedMotion()) return;

    const set = (node: HTMLElement | null, o: number, y = 0) => {
      if (!node) return;
      node.style.opacity = o.toFixed(3);
      node.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };

    return registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        seq.current?.draw(p);

        if (plate) {
          const s =
            p < 0.62
              ? lerp(1.08, 1.0, span(p, 0, 0.62))
              : lerp(1.0, 1.06, span(p, 0.62, 1));
          plate.style.transform = `scale(${s.toFixed(4)})`;
        }

        // чем выше камера, тем ближе лампа
        if (glow) glow.style.setProperty("--climb", span(p, 0.05, 0.75).toFixed(3));

        // заголовок и действия уходят вверх, освобождая кадр
        const out = span(p, 0.04, 0.26);
        leadLines.forEach((line, i) => {
          const y = -span(p, 0.04 + i * 0.02, 0.24 + i * 0.02) * 110;
          line.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
        });
        if (lead) {
          lead.style.opacity = (1 - span(p, 0.12, 0.26)).toFixed(3);
          lead.style.visibility = out >= 1 ? "hidden" : "visible";
        }

        // строка оригинала поднимается из масок, стоит, уходит
        sloganLines.forEach((line, i) => {
          const a = 0.26 + i * 0.03;
          const y =
            (1 - span(p, a, a + 0.12)) * 115 - span(p, 0.54, 0.64 + i * 0.03) * 115;
          line.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
        });
        set(subEl, hold(p, 0.34, 0.42, 0.54, 0.62), (1 - span(p, 0.34, 0.42)) * 20);

        telEls.forEach((tel, i) => {
          const a = 0.56 + i * 0.035;
          set(tel, hold(p, a, a + 0.08, 0.84, 0.92), (1 - span(p, a, a + 0.08)) * 24);
        });

        cornerEls.forEach(
          (c) => (c.style.opacity = lerp(1, 0.3, span(p, 0.3, 0.6)).toFixed(3))
        );
        // кадр не гаснет до пустоты: колонна остаётся призраком, пока наезжает следующий блок
        if (fadeEl) fadeEl.style.opacity = (span(p, 0.86, 1) * 0.5).toFixed(3);
      },
    });
  }, []);

  const ready = hasShot("iskra");
  const quick = QUICK_SECTIONS.map((s) => categoryOf(s)).filter(Boolean);

  return (
    <section
      id="hero"
      ref={root}
      className={"scene hero ground-paper" + (booted ? " hero--booted" : "")}
      data-ground="paper"
    >
      <div className="hero__stage">
        <div className="hero__plate gpu">
          {ready ? (
            <ScrollSequence
              ref={seq}
              spec={MEDIA.iskra.seq}
              mobileSpec={MEDIA.iskra.mobileSeq}
              portraitSpec={MEDIA.iskra.portraitSeq}
              portraitMobileSpec={MEDIA.iskra.portraitMobileSeq}
              poster={MEDIA.iskra.poster}
              portraitPoster={MEDIA.iskra.portraitPoster}
              className="fill"
              eager
            />
          ) : (
            <img className="fill" src={MEDIA.iskra.poster} alt="" aria-hidden="true" />
          )}
        </div>

        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__scrim" aria-hidden="true" />
        <div className="hero__fade" aria-hidden="true" />

        <div className="hero__ui shell">
          <div className="hero__top">
            <span className="hero__corner label">{t("hero.place", lang)}</span>
            <span className="hero__corner hero__corner--lit label">
              {t("hero.since", lang)}
            </span>
          </div>

          <div className="hero__middle">
            <div className="hero__lead">
              <h1 className="hero__h1 display" aria-label={title.full}>
                {title.lines.map((line, i) => (
                  <span className="mask" key={i} style={{ "--i": i } as CSSProperties}>
                    <span>{line}</span>
                  </span>
                ))}
                {title.where && (
                  <span
                    className="mask hero__h1-where"
                    style={{ "--i": 3 } as CSSProperties}
                  >
                    <span>{title.where}</span>
                  </span>
                )}
              </h1>

              <div className="hero__actions">
                <Link to={`/${lang}/catalog`} className="btn btn--solid">
                  {t("catalog.title", lang)}
                  <span className="btn__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
                <button type="button" className="btn" onClick={() => openLead()}>
                  {t("cta.quote", lang)}
                </button>
                <button
                  type="button"
                  className="link-arrow hero__consult"
                  onClick={() => openLead({ mode: "consult" })}
                >
                  <span>{t("cta.consult", lang)}</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            <div className="hero__statement">
              <p className="hero__slogan display display--tight">
                {breakLines(slogan, 16).map((line, i) => (
                  <span className="mask" key={i}>
                    <span>{line}</span>
                  </span>
                ))}
              </p>
              <p className="hero__sub lead">{sub}</p>
            </div>

            <dl className="hero__telemetry" aria-hidden="true">
              <div className="hero__tel">
                <dt className="label">{t("common.sections", lang)}</dt>
                <dd className="mono">{topCategories.length}</dd>
              </div>
              <div className="hero__tel">
                <dt className="label">{t("common.items", lang)}</dt>
                <dd className="mono">{products.length}</dd>
              </div>
              <div className="hero__tel">
                <dt className="label">{t("nav.production", lang)}</dt>
                <dd className="mono">
                  {lang === "en"
                    ? "Karaganda"
                    : lang === "kk"
                      ? "Қарағанды"
                      : "Караганда"}
                </dd>
              </div>
            </dl>
          </div>

          <nav className="hero__quick" aria-label={t("hero.quick", lang)}>
            <span className="hero__quick-label label">{t("hero.quick", lang)}</span>
            <ul>
              {quick.map((c) => (
                <li key={c!.slug}>
                  <Link to={categoryPath(lang, c!.slug)} className="hero__chip">
                    {pick(c!.title, lang)}
                    <span className="mono">{c!.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
