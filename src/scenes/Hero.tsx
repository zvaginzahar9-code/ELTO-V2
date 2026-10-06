/**
 * СЦЕНА 01 — ДУГА
 *
 * Первый экран отвечает за пять секунд: что это за завод, что он делает и
 * где каталог. Слева — заголовок, действия и входы в главные разделы;
 * справа — панель изделия с настоящими типоразмерами опор СТВ. Сквозь
 * кадр за панелью проходит аргоновая дуга — та же лента света, что потом
 * проведёт по всей главной.
 *
 * Прокрутка ведёт сцену, а не просто уводит её вверх:
 *
 *   0.00–0.40  панель разворачивается к зрителю из перспективы
 *   0.08–0.45  строки заголовка уходят в свои маски, лесенкой
 *   0.55–1.00  панель отъезжает в глубину и гаснет — дуга остаётся одна
 *
 * Заголовок — формулировка оригинала, акцент «от завода в Караганде»
 * набран курсивной антиквой: это единственное, что отличает ELTO от
 * перекупщика, и оно должно читаться другим голосом.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import SpecConsole from "@/components/ui/SpecConsole";
import { registerScene, span } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { useArcStop } from "@/motion/use-arc";
import { heroArc } from "./arc-shapes";
import { categoryOf } from "@/lib/data";
import { categoryPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import { useLead } from "@/components/lead/LeadProvider";
import { QUICK_SECTIONS, heroTitle } from "./hero-copy";

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
  const title = heroTitle(lang);
  const [booted] = useState(takeBoot);
  const root = useRef<HTMLElement>(null);
  const openLead = useLead();
  useArcStop(root, heroArc);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;

    const lines = Array.from(el.querySelectorAll<HTMLElement>(".hero__h1 .mask > span"));
    const rest = Array.from(el.querySelectorAll<HTMLElement>(".hero__fade-out"));
    const deck = el.querySelector<HTMLElement>(".hero__deck");

    /* наклон панели за курсором — глубина, а не аттракцион: два градуса */
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const off = registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        lines.forEach((line, i) => {
          const y = -span(p, 0.08 + i * 0.03, 0.4 + i * 0.03) * 112;
          line.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
        });
        const fade = 1 - span(p, 0.06, 0.32);
        rest.forEach((n) => {
          n.style.opacity = fade.toFixed(3);
          n.style.visibility = fade <= 0 ? "hidden" : "visible";
        });

        if (deck) {
          const face = span(p, 0, 0.4);
          const away = span(p, 0.55, 1);
          deck.style.setProperty("--face", face.toFixed(3));
          deck.style.setProperty("--away", away.toFixed(3));
          deck.style.visibility = away >= 1 ? "hidden" : "visible";
        }
      },
    });

    return () => {
      off();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const quick = QUICK_SECTIONS.map((s) => categoryOf(s)).filter(Boolean);

  return (
    <section
      id="hero"
      ref={root}
      className={"scene hero" + (booted ? " hero--booted" : "")}
      data-ground="dark"
    >
      <div className="hero__stage">
        <div className="hero__ui shell">
          <div className="hero__lead">
            <p className="hero__place hero__fade-out">{t("hero.since", lang)}</p>
            <h1 className="hero__h1" aria-label={title.full}>
              {title.lines.map((line, i) => (
                <span className="mask" key={i} style={{ "--i": i } as CSSProperties}>
                  <span>{line}</span>
                </span>
              ))}
              {title.where && (
                <span className="mask hero__where" style={{ "--i": 3 } as CSSProperties}>
                  <span>{title.where}</span>
                </span>
              )}
            </h1>

            <div className="hero__actions hero__fade-out">
              <Link to={`/${lang}/catalog`} className="btn btn--solid">
                <span className="btn__full">{t("catalog.title", lang)}</span>
                <span className="btn__short">{t("cta.catalog", lang)}</span>
              </Link>
              <button type="button" className="btn btn--glass" onClick={() => openLead()}>
                {t("cta.quote", lang)}
              </button>
            </div>
          </div>

          <div className="hero__deck">
            <SpecConsole lang={lang} />
          </div>

          <nav className="hero__quick hero__fade-out" aria-label={t("hero.quick", lang)}>
            <ul>
              {quick.map((c) => (
                <li key={c!.slug}>
                  <Link to={categoryPath(lang, c!.slug)} className="hero__chip">
                    {pick(c!.title, lang)}
                    <span>{c!.count}</span>
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
