/**
 * Панель изделия в герое.
 *
 * Вместо картинки «про завод» — сама продукция, как её видит снабженец:
 * таблица типоразмеров опор СТВ с оригинала и силуэт опоры, который
 * перестраивается под выбранную строку — высоту, диаметры у основания и
 * у вершины. Строки сами перебираются, пока человек не наведёт курсор:
 * панель с первого экрана показывает, что здесь лежат настоящие
 * характеристики, а не только фотографии.
 *
 * Все цифры — из таблицы характеристик карточки СТВ на elto.kz.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate } from "animejs";
import { loadProduct, type ProductFull } from "@/lib/data";
import { productPath } from "@/lib/routes";
import { t, type Lang } from "@/lib/i18n";
import { reducedMotion } from "@/motion/clock";

const SLUG = "opory-osveshcheniya-granenye-konicheskie-flancevye-stv";

type Row = { mark: string; mass: number; h: number; dn: number; dv: number };

function rowsOf(p: ProductFull | null): Row[] {
  const table = p?.tables?.[0] ?? [];
  const out: Row[] = [];
  for (const r of table) {
    const mark = (r[0] || "").replace(/^Опора освещения\s+/i, "").trim();
    if (!/^СТВ/.test(mark)) continue;
    const [dn, dv] = (r[3] || "").split("/").map((v) => parseFloat(v));
    const h = parseFloat(r[2]);
    if (!h || !dn || !dv) continue;
    out.push({ mark, mass: parseFloat(r[1]) || 0, h, dn, dv });
  }
  return out;
}

/** единицы — на языке страницы */
const unit = (lang: Lang) => (lang === "en" ? { m: "m", kg: "kg" } : { m: "м", kg: "кг" });

const metres = (mm: number, lang: Lang) =>
  (mm / 1000).toLocaleString(lang === "en" ? "en-GB" : "ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

/* силуэт: координаты в единицах viewBox 0 0 200 440 */
const BASE = 404;
const TOP_SPACE = 30;
const CX = 132;

function pole(h: number, dn: number, dv: number, hMax: number) {
  const height = (h / hMax) * (BASE - TOP_SPACE);
  const top = BASE - height;
  const wb = dn * 0.19;
  const wt = dv * 0.19;
  return {
    top,
    outline: `${CX - wb / 2},${BASE} ${CX - wt / 2},${top} ${CX + wt / 2},${top} ${CX + wb / 2},${BASE}`,
    // грани: две внутренние линии восьмигранника
    facetL: `M${CX - wb / 6} ${BASE} L${CX - wt / 6} ${top}`,
    facetR: `M${CX + wb / 6} ${BASE} L${CX + wt / 6} ${top}`,
    flange: { x: CX - wb * 0.95, w: wb * 1.9 },
  };
}

export default function SpecConsole({ lang }: { lang: Lang }) {
  const [product, setProduct] = useState<ProductFull | null>(null);
  const [active, setActive] = useState(5);
  const paused = useRef(false);
  const svg = useRef<SVGSVGElement>(null);
  const state = useRef({ h: 0, dn: 0, dv: 0 });

  useEffect(() => {
    let alive = true;
    loadProduct(SLUG)
      .then((p) => alive && setProduct(p))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(() => rowsOf(product), [product]);
  const hMax = rows.reduce((m, r) => Math.max(m, r.h), 0);
  const cur = rows[Math.min(active, rows.length - 1)];

  /* строки перебираются сами, пока человек не взялся за панель */
  useEffect(() => {
    if (!rows.length || reducedMotion()) return;
    const id = window.setInterval(() => {
      if (!paused.current) setActive((i) => (i + 1) % rows.length);
    }, 2100);
    return () => window.clearInterval(id);
  }, [rows.length]);

  /* силуэт перетекает к новому типоразмеру, а не прыгает */
  useEffect(() => {
    const node = svg.current;
    if (!cur || !node) return;
    const outline = node.querySelector<SVGPolygonElement>(".pnl__pole");
    const facetL = node.querySelector<SVGPathElement>(".pnl__facet--l");
    const facetR = node.querySelector<SVGPathElement>(".pnl__facet--r");
    const flange = node.querySelector<SVGRectElement>(".pnl__flange");
    const dim = node.querySelector<SVGPathElement>(".pnl__dim");
    const tick = node.querySelector<SVGPathElement>(".pnl__dim-top");
    const label = node.querySelector<SVGTextElement>(".pnl__dim-label");
    const glow = node.querySelector<SVGEllipseElement>(".pnl__lamp");

    const draw = () => {
      const s = state.current;
      const g = pole(s.h, s.dn, s.dv, hMax);
      outline?.setAttribute("points", g.outline);
      facetL?.setAttribute("d", g.facetL);
      facetR?.setAttribute("d", g.facetR);
      flange?.setAttribute("x", g.flange.x.toFixed(2));
      flange?.setAttribute("width", g.flange.w.toFixed(2));
      dim?.setAttribute("d", `M62 ${BASE} L62 ${g.top.toFixed(2)}`);
      tick?.setAttribute("d", `M56 ${g.top.toFixed(2)} L${CX - 12} ${g.top.toFixed(2)}`);
      label?.setAttribute("y", ((BASE + g.top) / 2).toFixed(2));
      glow?.setAttribute("cy", (g.top - 2).toFixed(2));
      if (label) label.textContent = `H ${Math.round(s.h).toLocaleString("ru-RU").replace(/[\u00a0\u202f]/g, " ")}`;
    };

    if (state.current.h === 0 || reducedMotion()) {
      state.current = { h: cur.h, dn: cur.dn, dv: cur.dv };
      draw();
      return;
    }
    const a = animate(state.current, {
      h: cur.h,
      dn: cur.dn,
      dv: cur.dv,
      duration: 900,
      ease: "inOut(3)",
      onUpdate: draw,
    });
    return () => {
      a.pause();
    };
  }, [cur, hMax]);

  return (
    <div
      className="pnl"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      <header className="pnl__head">
        <span className="pnl__title">{t("spec.title", lang)}</span>
        <span className="pnl__pill">
          <i aria-hidden="true" />
          {rows.length || 14} {t("spec.sizes", lang)}
        </span>
      </header>

      <div className="pnl__body">
        <figure className="pnl__figure" aria-hidden="true">
          <svg ref={svg} viewBox="0 0 200 440" className="pnl__svg">
            <defs>
              <linearGradient id="spec-steel" x1="0" x2="1">
                <stop offset="0" stopColor="#8a84a0" />
                <stop offset="0.45" stopColor="#e4e0ee" />
                <stop offset="0.6" stopColor="#b8b2c9" />
                <stop offset="1" stopColor="#5f5a6e" />
              </linearGradient>
              <radialGradient id="spec-lamp">
                <stop offset="0" stopColor="#ff4fa3" stopOpacity="0.9" />
                <stop offset="1" stopColor="#6a3df0" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path className="pnl__ground" d={`M8 ${BASE + 0.5} L192 ${BASE + 0.5}`} />
            <ellipse className="pnl__lamp" cx={CX} cy={120} rx={58} ry={40} fill="url(#spec-lamp)" />
            <polygon className="pnl__pole" fill="url(#spec-steel)" />
            <path className="pnl__facet pnl__facet--l" />
            <path className="pnl__facet pnl__facet--r" />
            <rect className="pnl__flange" y={BASE - 5} height={5} rx={1} />
            <path className="pnl__dim" />
            <path className="pnl__dim-top" />
            <text className="pnl__dim-label" x={56} textAnchor="end" />
          </svg>
          {cur && (
            <figcaption className="pnl__readout">
              <span className="pnl__mark">{cur.mark}</span>
              <span className="pnl__num">
                {metres(cur.h, lang)} <small>{unit(lang).m}</small>
              </span>
              <span className="pnl__num pnl__num--muted">
                {cur.mass} <small>{unit(lang).kg}</small>
              </span>
            </figcaption>
          )}
        </figure>

        <div className="pnl__table" role="list" data-lenis-prevent>
          <div className="pnl__row pnl__row--head" aria-hidden="true">
            <span>{t("spec.mark", lang)}</span>
            <span>{t("spec.height", lang)}</span>
            <span>{t("spec.mass", lang)}</span>
          </div>
          {rows.length
            ? rows.map((r, i) => (
                <button
                  type="button"
                  role="listitem"
                  key={r.mark}
                  className={"pnl__row" + (i === active ? " is-on" : "")}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <span className="pnl__cell-mark">{r.mark}</span>
                  <span>
                    {metres(r.h, lang)} {unit(lang).m}
                  </span>
                  <span>
                    {r.mass} {unit(lang).kg}
                  </span>
                </button>
              ))
            : Array.from({ length: 10 }, (_, i) => (
                <span className="pnl__row pnl__row--wait" key={i} aria-hidden="true" />
              ))}
        </div>
      </div>

      <footer className="pnl__foot">
        <Link className="pnl__open" to={productPath(lang, SLUG)}>
          {t("spec.open", lang)}
          <span aria-hidden="true">→</span>
        </Link>
      </footer>
    </div>
  );
}
