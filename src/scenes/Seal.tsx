/**
 * СЦЕНА 04 — ЗНАК
 *
 * Середина страницы. Лента света, которая вела от героя через опору и
 * линию реза, стягивается в точку — в знак ELTO в центре ночного кадра.
 * Знак разворачивается в полноэкранную аргоновую плиту, и на ней стоит
 * то, что завод пишет о себе первым: «Качество — основа доверия к нам».
 * Затем плита отходит в глубину и отдаёт кадр каталогу.
 *
 *   0.00–0.12  знак проявляется, лента сходится в него
 *   0.12–0.46  знак растёт до плиты на весь экран, углы раскрываются
 *   0.34–0.58  строки слогана поднимаются из масок
 *   0.84–1.00  плита уходит в глубину
 *
 * Слоган и подпись — дословно со слайдера elto.kz.
 */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { registerScene, span, lerp } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { useArcStop } from "@/motion/use-arc";
import { sealArc } from "./arc-shapes";
import { site } from "@/lib/data";
import { t, type Lang } from "@/lib/i18n";
import { useLead } from "@/components/lead/LeadProvider";

/** Слоган и подпись — из слайдера оригинала; пометка «kz» снимается. */
function sealCopy(lang: Lang) {
  const block = site.home[lang]?.["w-slider"] ?? site.home.ru?.["w-slider"];
  const lines = (block?.text || "")
    .split("\n")
    .map((l) => l.trim().replace(/\s+kz$/i, ""))
    .filter(Boolean);
  const slogan = (lines[0] || "Качество - основа доверия к нам").replace(/\s+[-–]\s+/g, " — ");
  return { slogan, sub: (lines[1] || "").replace(/\s+[-–]\s+/g, " — ") };
}

/** «Качество — основа | доверия | к нам»: слово доверия — курсивом. */
function splitSlogan(s: string) {
  const m = /^(.*?)(довери\S*)(.*)$/i.exec(s);
  return m ? { before: m[1], accent: m[2], after: m[3] } : { before: s, accent: "", after: "" };
}

const E_MARK =
  "19,28 2841,28 2841,934 1067,934 1067,1353 2635,1353 2635,2110 1067,2110 1067,2530 2841,2530 2841,3435 19,3435 19,2859 19,2530 19,2110 19,1353 19,934 19,604";

export default function Seal({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const openLead = useLead();
  const { slogan, sub } = sealCopy(lang);
  const parts = splitSlogan(slogan);
  useArcStop(root, sealArc);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const plate = el.querySelector<HTMLElement>(".seal__plate");
    const mark = el.querySelector<HTMLElement>(".seal__mark");
    const lines = Array.from(el.querySelectorAll<HTMLElement>(".seal__line > span"));
    const after = Array.from(el.querySelectorAll<HTMLElement>(".seal__after"));

    if (reducedMotion()) {
      el.setAttribute("data-still", "true");
      return;
    }

    return registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const chip = Math.min(96, vw * 0.08);
        // плита — это вырез из полноэкранного прямоугольника: от квадрата
        // знака в центре до полей в два с половиной процента
        const grow = span(p, 0.12, 0.46);
        const g = grow < 0.5 ? 4 * grow ** 3 : 1 - Math.pow(-2 * grow + 2, 3) / 2;
        const insetX = lerp((vw - chip) / 2, vw * 0.025, g);
        const insetY = lerp((vh - chip) / 2, vh * 0.04, g);
        const radius = lerp(chip * 0.24, 26, g);
        const away = span(p, 0.84, 1);
        if (plate) {
          plate.style.clipPath = `inset(${insetY.toFixed(1)}px ${insetX.toFixed(1)}px round ${radius.toFixed(1)}px)`;
          plate.style.opacity = span(p, 0, 0.08).toFixed(3);
          plate.style.transform = `translate3d(0, ${(-away * 8).toFixed(2)}vh, 0) scale(${(1 - away * 0.12).toFixed(4)})`;
          plate.style.setProperty("--g", g.toFixed(3));
        }
        if (mark) {
          // знак не растёт вместе с плитой — уходит, уступая слогану
          const fade = 1 - span(p, 0.18, 0.34);
          mark.style.opacity = (span(p, 0, 0.08) * fade).toFixed(3);
          mark.style.transform = `translate(-50%, -50%) scale(${lerp(1, 2.6, span(p, 0.12, 0.34)).toFixed(3)})`;
        }
        lines.forEach((line, i) => {
          const a = 0.34 + i * 0.05;
          const y = (1 - span(p, a, a + 0.14)) * 110;
          line.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
        });
        const show = span(p, 0.5, 0.62);
        after.forEach((n) => {
          n.style.opacity = show.toFixed(3);
          n.style.transform = `translate3d(0, ${((1 - show) * 18).toFixed(1)}px, 0)`;
          n.style.visibility = show <= 0 ? "hidden" : "visible";
        });
      },
    });
  }, []);

  return (
    <section id="seal" ref={root} className="scene seal" data-ground="dark">
      <div className="seal__stage">
        <div className="seal__plate">
          <div className="seal__light" aria-hidden="true" />
          <div className="seal__content shell">
            <h2 className="seal__title">
              <span className="seal__line">
                <span>{parts.before.trim()}</span>
              </span>
              {parts.accent && (
                <span className="seal__line">
                  <span>
                    <em>{parts.accent}</em>
                    {parts.after}
                  </span>
                </span>
              )}
            </h2>
            {sub && <p className="seal__sub seal__after">{sub}</p>}
            <div className="seal__actions seal__after">
              <button type="button" className="btn btn--paper" onClick={() => openLead()}>
                {t("cta.quote", lang)}
              </button>
              <Link className="btn btn--line" to={`/${lang}/catalog`}>
                {t("seal.more", lang)}
              </Link>
            </div>
          </div>
        </div>

        <span className="seal__mark" aria-hidden="true">
          <svg viewBox="0 0 2860 3460">
            <polygon points={E_MARK} />
          </svg>
        </span>
      </div>
    </section>
  );
}
