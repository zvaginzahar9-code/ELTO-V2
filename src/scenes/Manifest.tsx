/**
 * СЦЕНА 02 — МАНИФЕСТ
 *
 * Поток уходит вправо и расплывается в свечение, обходя колонку текста:
 * под буквами его нет, читать ничто не мешает. Рядом с ним восемь
 * пунктов блока «Почему мы» с главной elto.kz читаются как один текст: слова загораются по мере прокрутки, и человек читает ровно
 * с той скоростью, с какой листает.
 */

import { useEffect, useRef } from "react";
import Pill from "@/components/ui/Pill";
import { registerScene, span } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { useFlowStop } from "@/motion/use-flow";
import { manifestFlow } from "./flow-shapes";
import { t, type Lang } from "@/lib/i18n";

/**
 * Блок «Почему мы» с главной оригинала, дословно (ключи why.1–why.9).
 * Слова в *звёздочках* — те, на которых держится смысл, — набраны акцентом.
 */
const WHY = ["why.1", "why.2", "why.3", "why.4", "why.5", "why.6", "why.7", "why.8", "why.9"];

export default function Manifest({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  useFlowStop(root, manifestFlow);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>(".mf__w"));
    if (reducedMotion()) {
      words.forEach((w) => w.style.setProperty("--lit", "1"));
      return;
    }
    const n = words.length;
    const text = el.querySelector<HTMLElement>(".mf__text");
    return registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        const read = span(p, 0.02, 0.8) * (n + 3);
        words.forEach((w, i) => {
          const lit = Math.min(1, Math.max(0, (read - i) / 3));
          w.style.setProperty("--lit", lit.toFixed(3));
        });
        // текст медленно поднимается сквозь кадр — движется камера, а не страница
        if (text) text.style.transform = `translate3d(0, ${((0.5 - p) * 8).toFixed(2)}vh, 0)`;
      },
    });
  }, [lang]);

  let wi = 0;
  return (
    <section id="manifest" ref={root} className="scene mf" data-ground="paper">
      <div className="mf__stage">
        <div className="shell mf__inner">
          <p className="mf__text">
            {WHY.map((key) => (
              <span className="mf__line" key={key}>
                {t(key, lang)
                  .split(" ")
                  .map((w) => {
                    const i = wi++;
                    const accent = /^\*.*\*$/.test(w);
                    return (
                      <span key={i} className={"mf__w" + (accent ? " mf__w--accent" : "")}>
                        {accent ? w.slice(1, -1) : w}{" "}
                      </span>
                    );
                  })}
              </span>
            ))}
          </p>
          <Pill tone="glass" to={`/${lang}/about`} className="mf__more">
            {t("nav.company", lang)}
          </Pill>
        </div>
      </div>
    </section>
  );
}
