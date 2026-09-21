/**
 * ELTO — scroll-сцены.
 *
 * Каждая сцена — это отрезок документа и функция, которой на каждом кадре
 * отдают её собственный прогресс 0→1. Позиция `0.34` всегда означает «34 %
 * сцены», а не долю страницы и не секунды таймлайна: сцены и кадровый скраб
 * говорят на одном языке.
 *
 * Пиннинга здесь нет намеренно. Залипающий кадр делается на `position: sticky`
 * внутри высокой секции — браузер держит его сам, без пересчёта layout и без
 * подмены отступов, которой требует программный пин.
 */

type Update = (progress: number, scene: Scene) => void;

export type SceneOptions = {
  /** сместить начало сцены (px или доля высоты экрана как "0.5vh") */
  start?: number;
  end?: number;
  /** сцена длиной во всю прокрутку своей секции минус высота экрана */
  mode?: "cover" | "enter" | "sticky";
  onUpdate: Update;
  onEnter?: () => void;
  onLeave?: () => void;
};

export type Scene = {
  el: HTMLElement;
  opts: SceneOptions;
  top: number;
  bottom: number;
  length: number;
  progress: number;
  active: boolean;
};

const scenes = new Set<Scene>();
let viewport = typeof window === "undefined" ? 0 : window.innerHeight;

function measure(s: Scene) {
  const rect = s.el.getBoundingClientRect();
  const docTop = rect.top + window.scrollY;
  const height = rect.height;
  viewport = window.innerHeight;

  const start = s.opts.start ?? 0;
  const end = s.opts.end ?? 0;

  if (s.opts.mode === "enter") {
    // сцена живёт, пока секция проходит экран снизу вверх
    s.top = docTop - viewport + start;
    s.bottom = docTop + height + end;
  } else {
    // "cover" / "sticky": пока закреплённый кадр стоит на месте
    s.top = docTop + start;
    s.bottom = docTop + height - viewport + end;
  }
  s.length = Math.max(1, s.bottom - s.top);
}

export function measureScenes() {
  viewport = window.innerHeight;
  scenes.forEach(measure);
  scenes.forEach((s) => {
    s.progress = -1;
  });
}

export function tickScenes(scroll: number) {
  for (const s of scenes) {
    const raw = (scroll - s.top) / s.length;
    const p = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    const inside = raw > -0.15 && raw < 1.15;

    if (inside !== s.active) {
      s.active = inside;
      (inside ? s.opts.onEnter : s.opts.onLeave)?.();
    }
    if (p === s.progress) continue;
    s.progress = p;
    s.opts.onUpdate(p, s);
  }
}

export function registerScene(el: HTMLElement, opts: SceneOptions) {
  const scene: Scene = {
    el,
    opts,
    top: 0,
    bottom: 0,
    length: 1,
    progress: -1,
    active: false,
  };
  measure(scene);
  scenes.add(scene);

  // секция может ещё дорисовываться (шрифты, картинки) — перемерим
  const ro = new ResizeObserver(() => measure(scene));
  ro.observe(el);

  return () => {
    ro.disconnect();
    scenes.delete(scene);
  };
}

/* ── мелкая математика, которой пользуются сцены ───────────────── */

/** Отрезок [a, b] внутри 0→1, нормализованный обратно в 0→1. */
export const span = (p: number, a: number, b: number) => {
  if (b <= a) return p >= b ? 1 : 0;
  const t = (p - a) / (b - a);
  return t < 0 ? 0 : t > 1 ? 1 : t;
};

/** Появиться, постоять, уйти — типичная жизнь надписи внутри кадра. */
export const hold = (p: number, inA: number, inB: number, outA: number, outB: number) =>
  Math.min(span(p, inA, inB), 1 - span(p, outA, outB));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
