/**
 * СЦЕНА 02 — МАНИФЕСТ
 *
 * После героя лента света стягивается в ствол и загибается кронштейном —
 * справа в кадре встаёт опора освещения, нарисованная самим светом.
 * Слева восемь пунктов блока «Почему мы» с главной elto.kz читаются как
 * один текст: слова загораются по мере прокрутки, и человек читает ровно
 * с той скоростью, с какой листает.
 *
 * Цифры стоят на опоре выносками, как размеры на чертеже, — у основания
 * год основания, выше разделы каталога, у вершины число изделий.
 */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { registerScene, span } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { useArcStop } from "@/motion/use-arc";
import { poleArc } from "./arc-shapes";
import { products, topCategories } from "@/lib/data";
import { t, type Lang } from "@/lib/i18n";

/** Блок «Почему мы» с главной оригинала — восемь пунктов, дословно. */
const WHY = [
  "Работа с нами – работа с производителем, без посредников.",
  "Мы работаем от завода изготовителя.",
  "У нас современное оборудование.",
  "Мониторинг качества продукции на всех этапах производства.",
  "Гарантия и контроль качества.",
  "Доступные цены.",
  "Ваши заказы оформляются и доставляются вовремя!",
  "Индивидуальный подход и внимательное отношение к каждому заказчику.",
  "Доставка в любой регион РК, России и СНГ быстро и в срок.",
];

/** Слова, которые несут смысл блока, — набраны акцентом. */
const ACCENT = new Set(["производителем,", "посредников.", "вовремя!", "срок."]);

type Fig = { y: number; at: number; value: number; key: string; count: boolean };

export default function Manifest({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  useArcStop(root, poleArc);

  const figs: Fig[] = [
    { y: 0.8, at: 0.18, value: 2014, key: "fig.since", count: false },
    { y: 0.54, at: 0.4, value: topCategories.length, key: "fig.sections", count: true },
    { y: 0.29, at: 0.62, value: products.length, key: "fig.items", count: true },
  ];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>(".mf__w"));
    const marks = Array.from(el.querySelectorAll<HTMLElement>(".mf__fig"));
    const nums = marks.map((m) => m.querySelector<HTMLElement>(".mf__fig-v"));

    if (reducedMotion()) {
      words.forEach((w) => w.style.setProperty("--lit", "1"));
      marks.forEach((m) => m.style.setProperty("--on", "1"));
      return;
    }

    const n = words.length;
    return registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        // текст читается за первые три четверти сцены, по два слова в такт
        const read = span(p, 0.04, 0.74) * (n + 2);
        words.forEach((w, i) => {
          const lit = Math.min(1, Math.max(0, (read - i) / 2.5));
          w.style.setProperty("--lit", lit.toFixed(3));
        });

        marks.forEach((m, i) => {
          const f = figs[i];
          const on = span(p, f.at, f.at + 0.1);
          m.style.setProperty("--on", on.toFixed(3));
          const v = nums[i];
          if (v && f.count) v.textContent = String(Math.round(f.value * on));
        });
      },
    });
    // figs — константы этой сцены
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let wi = 0;
  return (
    <section id="manifest" ref={root} className="scene mf" data-ground="dark">
      <div className="mf__stage">
        <div className="shell mf__inner">
          <p className="mf__kicker">{t("home.manifest", lang)}</p>
          <p className="mf__text">
            {WHY.map((line, li) => (
              <span className="mf__line" key={li}>
                {line.split(" ").map((w) => {
                  const i = wi++;
                  return (
                    <span
                      key={i}
                      className={"mf__w" + (ACCENT.has(w) ? " mf__w--accent" : "")}
                    >
                      {w}{" "}
                    </span>
                  );
                })}
              </span>
            ))}
          </p>
          <Link className="btn btn--glass mf__more" to={`/${lang}/about`}>
            {t("nav.company", lang)}
          </Link>
        </div>

        <ul className="mf__figs" aria-label={t("home.company", lang)}>
          {figs.map((f) => (
            <li className="mf__fig" key={f.key} style={{ top: `${f.y * 100}%` }}>
              <span className="mf__fig-tick" aria-hidden="true" />
              <span className="mf__fig-v">{f.value}</span>
              <span className="mf__fig-k">{t(f.key, lang)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
