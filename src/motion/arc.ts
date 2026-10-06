/**
 * АРГОНОВАЯ ДУГА — сквозной свет главной.
 *
 * Одна лента света проходит через всю главную и не прерывается между
 * секциями: в герое она прорезает кадр, в манифесте собирается в ствол
 * опоры, на производстве ложится линией реза, перед слоганом стягивается
 * в точку знака. Это не декор поверх страницы, а то, что держит страницу
 * одной сценой: секции меняются, свет — нет.
 *
 * Каждая секция главной заявляет свою форму ленты (arcStop). Пока секция
 * стоит в кадре, лента живёт по её форме; на стыке двух секций формы
 * перетекают друг в друга вместе с цветом грунта. Ночь и жемчуг — грунты
 * ELTO: на ночи лента светит сложением цветов, на жемчуге становится
 * тонкой гравированной линией аргона.
 *
 * Рисуется в общем такте (clock.onFrame) — в одном кадре с Lenis и
 * сценами, иначе лента отставала бы от прокрутки на кадр.
 */

import { onFrame, reducedMotion } from "./clock";

type V2 = [number, number];
type RGB = [number, number, number];

export type ArcShape = {
  /** четыре опорные точки кубической кривой, в долях экрана */
  pts: [V2, V2, V2, V2];
  /** полуширина ленты, доля min(ширина, высота) экрана */
  spread: number;
  /** число полуоборотов ленты вдоль длины — там, где нити сходятся */
  twist: number;
  /** блуждание отдельных нитей, доля ширины */
  wave: number;
  /** яркость 0…1 */
  alpha: number;
  /** цвет грунта под лентой */
  ground: RGB;
  /** 1 — свет на ночи, 0 — линия на жемчуге */
  dark: number;
  /** 0 — ровная лента, 1 — сужается к концам */
  taper: number;
};

export type ShapeFn = (local: number) => ArcShape;

export const NIGHT: RGB = [18, 15, 28];
export const PEARL: RGB = [244, 243, 248];

/* ── математика ─────────────────────────────────────────────────── */

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function blend(a: ArcShape, b: ArcShape, t: number): ArcShape {
  return {
    pts: a.pts.map((p, i) => [mix(p[0], b.pts[i][0], t), mix(p[1], b.pts[i][1], t)]) as ArcShape["pts"],
    spread: mix(a.spread, b.spread, t),
    twist: mix(a.twist, b.twist, t),
    wave: mix(a.wave, b.wave, t),
    alpha: mix(a.alpha, b.alpha, t),
    ground: a.ground.map((c, i) => mix(c, b.ground[i], t)) as RGB,
    dark: mix(a.dark, b.dark, t),
    taper: mix(a.taper, b.taper, t),
  };
}

/* ── остановки ──────────────────────────────────────────────────── */

type Stop = { el: HTMLElement; fn: ShapeFn; a: number; b: number };
const stops: Stop[] = [];

function measure() {
  const vh = window.innerHeight;
  const y = window.scrollY;
  for (const s of stops) {
    const r = s.el.getBoundingClientRect();
    const top = r.top + y;
    // форма полностью «своя», пока секция закрывает экран
    s.a = top - vh * 0.2;
    s.b = Math.max(s.a, top + r.height - vh * 0.8);
  }
  stops.sort((p, q) => p.a - q.a);
  // стык короче половины экрана — перетекание читалось бы как рывок
  for (let i = 0; i < stops.length - 1; i++) {
    const cur = stops[i];
    const next = stops[i + 1];
    if (next.a - cur.b < vh * 0.5) {
      const m = (cur.b + next.a) / 2;
      cur.b = Math.max(cur.a, m - vh * 0.25);
      next.a = m + vh * 0.25;
    }
  }
}

/** Секция заявляет форму ленты на время, пока стоит в кадре. */
export function arcStop(el: HTMLElement, fn: ShapeFn) {
  const stop: Stop = { el, fn, a: 0, b: 0 };
  stops.push(stop);
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(el);
  return () => {
    ro.disconnect();
    const i = stops.indexOf(stop);
    if (i > -1) stops.splice(i, 1);
  };
}

function shapeAt(y: number): ArcShape | null {
  if (!stops.length) return null;
  const first = stops[0];
  if (y <= first.b) return first.fn(clamp((y - first.a) / Math.max(1, first.b - first.a)));
  for (let i = 0; i < stops.length; i++) {
    const s = stops[i];
    const local = clamp((y - s.a) / Math.max(1, s.b - s.a));
    if (y >= s.a && y <= s.b) return s.fn(local);
    const next = stops[i + 1];
    if (next && y > s.b && y < next.a) {
      const t = ease((y - s.b) / Math.max(1, next.a - s.b));
      return blend(s.fn(1), next.fn(0), t);
    }
  }
  const last = stops[stops.length - 1];
  return last.fn(1);
}

/* ── нити ───────────────────────────────────────────────────────── */

const STRANDS = 56;
const GLOW = 0.25;
const SAMPLES = 76;

/** У каждой нити свой характер — постоянный, чтобы лента не мерцала. */
const strands = Array.from({ length: STRANDS }, (_, k) => {
  const r = (n: number) => {
    const x = Math.sin((k + 1) * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    u: (k / (STRANDS - 1)) * 2 - 1,
    phase: r(1) * Math.PI * 2,
    freq: 0.6 + r(2) * 1.6,
    speed: 0.12 + r(3) * 0.35,
    amp: 0.25 + r(4) * 0.75,
    /** 0 — ядро, 1 — средние, 2 — край */
    group: 0,
  };
});
strands.forEach((s) => {
  const a = Math.abs(s.u);
  s.group = a < 0.22 ? 0 : a < 0.62 ? 1 : 2;
});

/* цвета ELTO: аргон и плазма; на ночи — свет, на жемчуге — чернила аргона */
const LIGHT = [
  ["#efe8ff", "#ffd2ea", "#e4dcff"],
  ["#8f6dff", "#ff4fa3", "#7f58ff"],
  ["#5a2fd6", "#c23d8f", "#4a2ab5"],
];
const INK = [
  ["#3d1fb0", "#b8306f", "#3d1fb0"],
  ["#6a3df0", "#ff4fa3", "#6a3df0"],
  ["#8a84a0", "#c9a6e8", "#8a84a0"],
];
const LIGHT_ALPHA = [0.55, 0.32, 0.18];
const INK_ALPHA = [0.6, 0.38, 0.22];

/* ── состояние ──────────────────────────────────────────────────── */

let reveal = 1;
let revealFrom = -1;
const REVEAL_MS = 2200;
let mouseX = 0;
let mouseY = 0;
let mx = 0;
let my = 0;
let last: ArcShape | null = null;
/** тон грунта, отданный CSS; пишется, только когда меняется, — иначе
 *  каждый кадр перестраивал бы стили всей страницы */
let toneSent = -1;

/** Лента прорисовывается от начала к концу — первый вдох страницы. */
export function arcIntro() {
  if (reducedMotion()) return;
  reveal = 0;
  revealFrom = -1;
}

/** Форма, которая сейчас на экране — для стенда и отладки. */
export const arcNow = () => last;

/* ── отрисовка ──────────────────────────────────────────────────── */

export function mountArc(
  canvas: HTMLCanvasElement,
  glow: HTMLCanvasElement,
  ground: HTMLElement
) {
  const ctx = canvas.getContext("2d");
  const gtx = glow.getContext("2d");
  if (!ctx || !gtx) return () => {};

  const still = reducedMotion();
  let w = 0;
  let h = 0;
  let dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    // свечение — в четверть разрешения: растяжение и так его размывает,
    // а CSS-размытию остаётся вчетверо меньше работы
    glow.width = Math.round(w * GLOW);
    glow.height = Math.round(h * GLOW);
    measure();
  };
  resize();

  const onMove = (e: PointerEvent) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("load", measure);
  document.fonts?.ready.then(measure);

  // базовая кривая и нормали — пересчитываются раз за кадр, общие для нитей
  const bx = new Float32Array(SAMPLES + 1);
  const by = new Float32Array(SAMPLES + 1);
  const nx = new Float32Array(SAMPLES + 1);
  const ny = new Float32Array(SAMPLES + 1);

  const off = onFrame((time, scroll) => {
    const shape = shapeAt(scroll);
    if (!shape) return;
    last = shape;

    const [r, g, b] = shape.ground;
    ground.style.backgroundColor = `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
    if (Math.abs(shape.dark - toneSent) > 0.004 || (shape.dark !== toneSent && (shape.dark === 0 || shape.dark === 1))) {
      toneSent = shape.dark;
      document.documentElement.style.setProperty("--arc-dark", shape.dark.toFixed(3));
    }

    if (revealFrom < 0) revealFrom = time;
    if (reveal < 1) reveal = clamp((time - revealFrom) / REVEAL_MS);
    const rv = 1 - Math.pow(1 - reveal, 3);

    mx += (mouseX - mx) * 0.04;
    my += (mouseY - my) * 0.04;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gtx.setTransform(1, 0, 0, 1, 0, 0);
    gtx.clearRect(0, 0, glow.width, glow.height);
    if (shape.alpha < 0.01) return;

    const t0 = still ? 0 : time / 1000;
    const unit = Math.min(w, h);
    const width = shape.spread * unit;

    // кубическая кривая по четырём точкам, ближние к центру — за курсором
    const P = shape.pts.map((p, i) => {
      const pull = i === 1 || i === 2 ? 0.035 : 0.012;
      return [(p[0] + mx * pull) * w, (p[1] + my * pull) * h];
    });
    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES;
      const u = 1 - t;
      const a = u * u * u;
      const b1 = 3 * u * u * t;
      const c = 3 * u * t * t;
      const d = t * t * t;
      bx[i] = a * P[0][0] + b1 * P[1][0] + c * P[2][0] + d * P[3][0];
      by[i] = a * P[0][1] + b1 * P[1][1] + c * P[2][1] + d * P[3][1];
      const dx = 3 * u * u * (P[1][0] - P[0][0]) + 6 * u * t * (P[2][0] - P[1][0]) + 3 * t * t * (P[3][0] - P[2][0]);
      const dy = 3 * u * u * (P[1][1] - P[0][1]) + 6 * u * t * (P[2][1] - P[1][1]) + 3 * t * t * (P[3][1] - P[2][1]);
      const len = Math.hypot(dx, dy) || 1;
      nx[i] = -dy / len;
      ny[i] = dx / len;
    }

    const end = Math.max(1, Math.round(SAMPLES * rv));
    const drift = t0 * 0.18;

    const paths: [Path2D, Path2D, Path2D] = [new Path2D(), new Path2D(), new Path2D()];
    for (const s of strands) {
      const path = paths[s.group];
      for (let i = 0; i <= end; i++) {
        const t = i / SAMPLES;
        // ширина: сужение к концам и поворот ленты вокруг своей оси
        const env = mix(1, Math.pow(Math.sin(Math.PI * (0.02 + 0.96 * t)), 0.7), shape.taper);
        const turn = Math.cos(Math.PI * shape.twist * t + drift + s.u * 0.25);
        const wander =
          shape.wave * s.amp * Math.sin(t * s.freq * 6.283 + s.phase + t0 * s.speed);
        const o = width * env * (s.u * turn + wander);
        const x = bx[i] + nx[i] * o;
        const y = by[i] + ny[i] * o;
        if (i === 0) path.moveTo(x * dpr, y * dpr);
        else path.lineTo(x * dpr, y * dpr);
      }
    }

    const grad = (c: CanvasRenderingContext2D, cols: string[], k: number) => {
      const gr = c.createLinearGradient(P[0][0] * k, P[0][1] * k, P[3][0] * k, P[3][1] * k);
      gr.addColorStop(0, cols[0]);
      gr.addColorStop(0.55, cols[1]);
      gr.addColorStop(1, cols[2]);
      return gr;
    };

    // ночь: свет складывается — на пересечениях нитей ярче, как в дуге
    const dark = shape.dark;
    if (dark > 0.01) {
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1.1 * dpr;
      for (let gi = 2; gi >= 0; gi--) {
        ctx.globalAlpha = LIGHT_ALPHA[gi] * shape.alpha * dark;
        ctx.strokeStyle = grad(ctx, LIGHT[gi], dpr);
        ctx.stroke(paths[gi]);
      }

      // свечение: те же нити толще и в половину разрешения, CSS размывает
      gtx.globalCompositeOperation = "lighter";
      gtx.setTransform(GLOW / dpr, 0, 0, GLOW / dpr, 0, 0);
      gtx.lineWidth = 9 * dpr;
      for (let gi = 1; gi >= 0; gi--) {
        gtx.globalAlpha = (gi === 0 ? 0.22 : 0.12) * shape.alpha * dark;
        gtx.strokeStyle = grad(gtx, LIGHT[gi + 1], dpr);
        gtx.stroke(paths[gi]);
      }
    }

    // жемчуг: те же нити тонкой гравировкой
    if (dark < 0.99) {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 0.9 * dpr;
      for (let gi = 2; gi >= 0; gi--) {
        ctx.globalAlpha = INK_ALPHA[gi] * shape.alpha * (1 - dark);
        ctx.strokeStyle = grad(ctx, INK[gi], dpr);
        ctx.stroke(paths[gi]);
      }
    }
    ctx.globalAlpha = 1;
  });

  return () => {
    off();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("load", measure);
  };
}

export const remeasureArc = measure;
