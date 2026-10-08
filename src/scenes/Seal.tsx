/**
 * СЦЕНА 05 — ЗНАК
 *
 * Середина страницы. Курьер — знак ELTO, который ждал у заголовка героя,
 * — садится в центр ночного кадра, и всё, что текло по странице,
 * стягивается в него. Знак раскрывается в полноэкранную аргоновую плиту:
 * она приходит наклонённой и размытой, как предмет, который подлетает к
 * камере, и выпрямляется в фокусе. На ней — то, что завод пишет о себе
 * первым: «Качество - основа доверия к нам». Потом плита сворачивается
 * обратно в знак, и курьер летит дальше — к финальной заявке.
 *
 *   0.00–0.10  знак сел, поток сходится в точку
 *   0.10–0.42  плита раскрывается из знака, наклон и размытие уходят
 *   0.30–0.55  строки слогана поднимаются из масок
 *   0.78–0.94  плита сворачивается в знак
 *
 * Слоган и подпись — дословно со слайдера elto.kz.
 */

import { useEffect, useRef } from "react";
import Pill from "@/components/ui/Pill";
import { registerScene, span, lerp } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { useDock, useFlowStop } from "@/motion/use-flow";
import { sealFlow } from "./flow-shapes";
import { site } from "@/lib/data";
import { t, type Lang } from "@/lib/i18n";

function sealCopy(lang: Lang) {
  const block = site.home[lang]?.["w-slider"] ?? site.home.ru?.["w-slider"];
  const lines = (block?.text || "")
    .split("\n")
    .map((l) => l.trim().replace(/\s+kz$/i, ""))
    .filter(Boolean);
  return { slogan: lines[0] || "Качество - основа доверия к нам", sub: lines[1] || "" };
}

/** «Качество - основа | доверия к нам»: «доверия» — курсивом. */
function splitSlogan(s: string) {
  const m = /^(.*?)(довери\S*)(.*)$/i.exec(s);
  return m ? { before: m[1].trim(), accent: m[2], after: m[3] } : { before: s, accent: "", after: "" };
}

const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function Seal({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const dock = useRef<HTMLSpanElement>(null);
  const { slogan, sub } = sealCopy(lang);
  const parts = splitSlogan(slogan);
  useFlowStop(root, sealFlow);
  useDock(dock, "seal");

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const plate = el.querySelector<HTMLElement>(".seal__plate");
    const lines = Array.from(el.querySelectorAll<HTMLElement>(".seal__line > span"));
    const after = Array.from(el.querySelectorAll<HTMLElement>(".seal__after"));
    const docEl = document.documentElement;

    if (reducedMotion()) {
      el.setAttribute("data-still", "true");
      return;
    }

    const off = registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const chip = 96;
        // раскрытие и сворачивание — одна величина: 0 знак, 1 плита
        const g = inOut(span(p, 0.1, 0.42)) * (1 - inOut(span(p, 0.78, 0.94)));
        const insetX = lerp((vw - chip) / 2, vw * 0.03, g);
        const insetY = lerp((vh - chip) / 2, vh * 0.05, g);
        const radius = lerp(24, 28, g);
        if (plate) {
          plate.style.clipPath = `inset(${insetY.toFixed(1)}px ${insetX.toFixed(1)}px round ${radius.toFixed(1)}px)`;
          plate.style.opacity = g > 0.001 ? "1" : "0";
          // подлёт к камере: наклон и размытие сходят на нет к фокусу
          const approach = 1 - span(p, 0.1, 0.4);
          plate.style.transform = `perspective(1600px) rotateX(${(approach * 16).toFixed(2)}deg) scale(${(1 + approach * 0.06).toFixed(4)})`;
          plate.style.filter = approach > 0.01 ? `blur(${(approach * 10).toFixed(2)}px)` : "none";
        }
        // курьер прячется, пока он сам — плита
        docEl.style.setProperty("--courier-fade", (1 - Math.min(1, g * 4)).toFixed(3));

        lines.forEach((line, i) => {
          const a = 0.3 + i * 0.05;
          const y = (1 - span(p, a, a + 0.14)) * 110 - span(p, 0.74, 0.8) * 110;
          line.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
        });
        const show = span(p, 0.46, 0.56) * (1 - span(p, 0.72, 0.78));
        after.forEach((n) => {
          n.style.opacity = show.toFixed(3);
          n.style.transform = `translate3d(0, ${((1 - show) * 16).toFixed(1)}px, 0)`;
          n.style.visibility = show <= 0 ? "hidden" : "visible";
        });
      },
    });
    return () => {
      off();
      docEl.style.removeProperty("--courier-fade");
    };
  }, []);

  return (
    <section id="seal" ref={root} className="scene seal" data-ground="paper">
      <div className="seal__stage">
        <span className="seal__dock" ref={dock} aria-hidden="true" />
        <div className="seal__plate">
          <div className="seal__light" aria-hidden="true" />
          <div className="seal__content shell">
            <h2 className="seal__title" aria-label={slogan}>
              <span className="seal__line" aria-hidden="true">
                <span>{parts.before}</span>
              </span>
              {parts.accent && (
                <span className="seal__line" aria-hidden="true">
                  <span>
                    <em>{parts.accent}</em>
                    {parts.after}
                  </span>
                </span>
              )}
            </h2>
            {sub && <p className="seal__sub seal__after">{sub.replace(/\s+[-–—]\s+/g, " - ")}</p>}
            <div className="seal__actions seal__after">
              {/* как на слайдере оригинала: слоган, подпись и «Подробнее о нас» */}
              <Pill tone="pearl" to={`/${lang}/about`}>
                {t("home.aboutMore", lang)}
              </Pill>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
