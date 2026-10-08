/**
 * СЦЕНА 01 — ВХОД ПОТОКА
 *
 * Первый экран отвечает за пять секунд: что это за завод, что он делает,
 * где каталог. Заголовок крупный, в три уровня: что, ещё что, откуда.
 * Рядом с «от завода в Караганде» сидит знак ELTO — тот самый курьер,
 * который потом пролетит через всю страницу. Справа — панель изделия
 * с настоящими типоразмерами СТВ.
 *
 * Поток входит сверху справа и вершиной крюка указывает на заголовок.
 * Прокрутка разводит слои по глубине: строки заголовка уходят вверх с
 * разной скоростью, панель отворачивается и отъезжает вглубь, а камера
 * в это время влетает в поток — так начинается манифест.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import SpecConsole from "@/components/ui/SpecConsole";
import Pill from "@/components/ui/Pill";
import { registerScene, span } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { useDock, useFlowStop } from "@/motion/use-flow";
import { heroFlow } from "./flow-shapes";
import { site } from "@/lib/data";
import { t, type Lang } from "@/lib/i18n";
import { useLead } from "@/components/lead/LeadProvider";
import { heroTitle } from "./hero-copy";

let bootConsumed = false;
function takeBoot() {
  if (bootConsumed) return false;
  bootConsumed = true;
  return document.documentElement.dataset.boot === "hero";
}

/** Подпись первого экрана — вторая строка слайдера оригинала. */
function heroSub(lang: Lang) {
  const block = site.home[lang]?.["w-slider"] ?? site.home.ru?.["w-slider"];
  const line = (block?.text || "").split("\n")[1] || "";
  return line.trim().replace(/\s+kz$/i, "").replace(/\s+[-–—]\s+/g, " - ");
}

export default function Hero({ lang }: { lang: Lang }) {
  const title = heroTitle(lang);
  const [booted] = useState(takeBoot);
  const root = useRef<HTMLElement>(null);
  const dock = useRef<HTMLSpanElement>(null);
  const openLead = useLead();
  useFlowStop(root, heroFlow);
  useDock(dock, "hero");

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const lines = Array.from(el.querySelectorAll<HTMLElement>(".hero__h1 .mask > span"));
    const fades = Array.from(el.querySelectorAll<HTMLElement>(".hero__fade"));
    const deck = el.querySelector<HTMLElement>(".hero__deck");

    const onMove = (e: PointerEvent) => {
      el.style.setProperty("--px", (e.clientX / window.innerWidth - 0.5).toFixed(3));
      el.style.setProperty("--py", (e.clientY / window.innerHeight - 0.5).toFixed(3));
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const off = registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        // строки уходят с разной скоростью: верхняя быстрее — слои по глубине
        lines.forEach((line, i) => {
          const y = -span(p, 0.02, 0.7) * (60 + (lines.length - i) * 40);
          const o = 1 - span(p, 0.35 + i * 0.06, 0.75 + i * 0.05);
          line.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
          line.style.opacity = o.toFixed(3);
        });
        const f = 1 - span(p, 0.08, 0.4);
        fades.forEach((n) => {
          n.style.opacity = f.toFixed(3);
          n.style.transform = `translate3d(0, ${((1 - f) * -30).toFixed(1)}px, 0)`;
          n.style.visibility = f <= 0 ? "hidden" : "visible";
        });
        if (deck) {
          deck.style.setProperty("--away", span(p, 0.1, 0.85).toFixed(3));
          deck.style.visibility = p >= 0.98 ? "hidden" : "visible";
        }
      },
    });
    return () => {
      off();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section
      id="hero"
      ref={root}
      className={"scene hero" + (booted ? " hero--booted" : "")}
      data-ground="paper"
    >
      <div className="hero__stage">
        <div className="hero__ui shell">
          <div className="hero__lead">
            <h1 className="hero__h1" aria-label={title.full}>
              {title.lines.map((line, i) => (
                <span className="mask" key={i} style={{ "--i": i } as CSSProperties}>
                  <span>{line}</span>
                </span>
              ))}
              {title.where && (
                <span className="mask hero__where" style={{ "--i": 3 } as CSSProperties}>
                  <span>
                    {title.where}
                    <span className="hero__dock" ref={dock} aria-hidden="true" />
                  </span>
                </span>
              )}
            </h1>
            <p className="hero__sub hero__fade">{heroSub(lang)}</p>
            <div className="hero__actions hero__fade">
              <Pill to={`/${lang}/catalog`}>{t("catalog.title", lang)}</Pill>
              <Pill tone="glass" onClick={() => openLead()}>
                {t("cta.quote", lang)}
              </Pill>
            </div>
          </div>

          <div className="hero__deck">
            <SpecConsole lang={lang} />
          </div>
        </div>
      </div>
    </section>
  );
}
