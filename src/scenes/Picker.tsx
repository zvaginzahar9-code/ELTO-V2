/**
 * СЦЕНА 07 — ПОДБОР
 *
 * Страница цен по-заводски. Цен на сайте нет и выдумывать их нельзя,
 * поэтому вместо тарифов — то, чем снабженец действительно выбирает:
 * высота опоры. Четырнадцать типоразмеров СТВ стоят рядом объёмными
 * столбиками в масштабе своей высоты; ползунок или клик по столбику
 * выбирает размер, и рядом сразу его масса, диаметры, фланец и
 * фундаменты — всё из таблицы характеристик оригинала, с её подписями и
 * в её единицах. Заголовок — название изделия на оригинале.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { animate } from "animejs";
import Pill from "@/components/ui/Pill";
import Title from "@/components/motion/Title";
import { useFlowStop } from "@/motion/use-flow";
import { reducedMotion } from "@/motion/clock";
import { registerScene, span } from "@/motion/scene";
import { tierFlow } from "./flow-shapes";
import { STV_SLUG, units, useStv } from "@/lib/stv";
import { products } from "@/lib/data";
import { productPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import { markIn } from "@/lib/translit";
import { useLead } from "@/components/lead/LeadProvider";

export default function Picker({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const rows = useStv();
  const [i, setI] = useState(7);
  const openLead = useLead();
  const u = units(lang);
  const title = pick(products.find((p) => p.s === STV_SLUG)?.t, lang);
  const hMax = rows.reduce((m, r) => Math.max(m, r.h), 1);
  const cur = rows[Math.min(i, rows.length - 1)];
  const massEl = useRef<HTMLSpanElement>(null);
  const prevMass = useRef(0);
  useFlowStop(root, tierFlow);

  /* столбики вырастают из основания, пока сцена входит в кадр */
  useEffect(() => {
    const el = root.current;
    const board = el?.querySelector<HTMLElement>(".pick__bars");
    if (!el || !board || reducedMotion()) return;
    return registerScene(el, {
      mode: "enter",
      onUpdate(p) {
        const g = span(p, 0.08, 0.32);
        board.style.setProperty("--grow", (1 - Math.pow(1 - g, 3)).toFixed(3));
      },
    });
  }, []);

  /* масса досчитывается, а не прыгает: видно, на сколько тяжелее */
  useEffect(() => {
    const el = massEl.current;
    if (!cur || !el) return;
    const from = prevMass.current || cur.mass;
    prevMass.current = cur.mass;
    if (reducedMotion() || from === cur.mass) {
      el.textContent = String(cur.mass);
      return;
    }
    const s = { v: from };
    const a = animate(s, {
      v: cur.mass,
      duration: 420,
      ease: "out(3)",
      onUpdate: () => (el.textContent = String(Math.round(s.v))),
    });
    return () => {
      a.cancel();
    };
  }, [cur]);

  return (
    <section id="pick" ref={root} className="scene pick" data-ground="paper">
      <div className="shell pick__inner">
        <Title className="pick__title" text={title} />

        <div className="pick__board bezel">
          <div className="bezel__core pick__core">
            <div className="pick__bars" role="radiogroup" aria-label={t("spec.height", lang)}>
              {rows.map((r, k) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={k === i}
                  aria-label={`${markIn(r.mark, lang)}, ${t("spec.hShort", lang)} ${r.h}`}
                  tabIndex={k === i ? 0 : -1}
                  key={r.mark}
                  className={"pick__bar" + (k === i ? " is-on" : "")}
                  style={{ "--h": (r.h / hMax).toFixed(3), "--k": k } as CSSProperties}
                  onClick={() => setI(k)}
                  onKeyDown={(e) => {
                    // группа переключателей: одна точка табуляции, выбор стрелками
                    const step =
                      e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
                    if (!step) return;
                    e.preventDefault();
                    const next = Math.min(rows.length - 1, Math.max(0, k + step));
                    setI(next);
                    const group = e.currentTarget.parentElement;
                    requestAnimationFrame(() =>
                      group?.querySelectorAll<HTMLButtonElement>(".pick__bar")[next]?.focus()
                    );
                  }}
                >
                  <span className="pick__prism" aria-hidden="true">
                    <i className="pick__face pick__face--front" />
                    <i className="pick__face pick__face--side" />
                    <i className="pick__face pick__face--top" />
                  </span>
                  <span className="pick__tick">{r.h}</span>
                </button>
              ))}
            </div>

            {rows.length > 0 && (
              <input
                className="pick__range"
                type="range"
                min={0}
                max={rows.length - 1}
                step={1}
                value={i}
                aria-label={t("spec.height", lang)}
                aria-valuetext={cur ? `${markIn(cur.mark, lang)}, ${t("spec.hShort", lang)} ${cur.h}` : undefined}
                onChange={(e) => setI(Number(e.target.value))}
              />
            )}

            {cur && (
              <p className="sr-only" aria-live="polite">
                {`${markIn(cur.mark, lang)}: ${t("spec.hShort", lang)} ${cur.h}, ${cur.mass} ${u.kg}`}
              </p>
            )}
            {cur && (
              <dl className="pick__spec">
                <div className="pick__mark">
                  <dt className="sr-only">{t("spec.mark", lang)}</dt>
                  <dd>{markIn(cur.mark, lang)}</dd>
                </div>
                <div>
                  <dt>{t("spec.height", lang)}</dt>
                  <dd>{cur.h}</dd>
                </div>
                <div>
                  <dt>{t("spec.mass", lang)}</dt>
                  <dd>
                    <span ref={massEl}>{cur.mass}</span>
                  </dd>
                </div>
                <div>
                  <dt>{t("pick.dia", lang)}</dt>
                  <dd>
                    {cur.dn}/{cur.dv}
                  </dd>
                </div>
                <div>
                  <dt>{t("pick.flange", lang)}</dt>
                  <dd className="pick__small">{markIn(cur.flange, lang)}</dd>
                </div>
                <div>
                  <dt>{t("pick.anchor", lang)}</dt>
                  <dd className="pick__small">{markIn(cur.anchor, lang)}</dd>
                </div>
                <div>
                  <dt>{t("pick.pipe", lang)}</dt>
                  <dd className="pick__small">{markIn(cur.pipe, lang)}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        <div className="pick__actions">
          <Pill to={productPath(lang, STV_SLUG)}>{t("common.more", lang)}</Pill>
          <Pill tone="glass" onClick={() => openLead({ topic: cur ? cur.mark : undefined })}>
            {t("cta.quote", lang)}
          </Pill>
        </div>
      </div>
    </section>
  );
}
