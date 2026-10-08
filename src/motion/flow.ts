/**
 * ПОТОК — сквозной свет главной, WebGL2.
 *
 * Масса тонких нитей аргона и плазмы, которая проходит через всю главную
 * одним объектом: входит в кадр, изгибается, уходит за край, возвращается,
 * закручивается вокруг опоры, вытягивается в линии конвейера, сходится в
 * точку. У нитей есть глубина: дальние резкие, ближние расплываются в
 * свечение — камера то смотрит на поток со стороны, то пролетает сквозь
 * него.
 *
 * Каждая сцена заявляет своё состояние потока (flowStop). Пока сцена в
 * кадре, поток живёт по её форме; на стыке двух сцен формы перетекают
 * друг в друга. Поток всегда стоит за содержимым и обходит колонки текста:
 * нити поверх букв мешали бы читать. Всё считается в общем такте (clock.onFrame) — в одном
 * кадре с Lenis и сценами.
 */

import { onFrame, reducedMotion } from "./clock";

export type V2 = [number, number];

export type FlowShape = {
  /** семь опорных точек сплайна Катмулла — Рома, в долях экрана */
  pts: V2[];
  /** полуширина пучка, доля min(ширина, высота) экрана */
  spread: number;
  /** число полуоборотов пучка вдоль длины */
  twist: number;
  /** блуждание отдельных нитей */
  wave: number;
  /** 0 — ровный пучок, 1 — сужается к концам */
  taper: number;
  /** глубина, которая в фокусе: −1 дальние нити, +1 ближние */
  focus: number;
  /** сила расфокусировки */
  dof: number;
  /** наезд камеры: сдвигает все нити ближе (+) или дальше (−) */
  depth: number;
  /** яркость 0…1 */
  alpha: number;
  /** сдвиг цвета: 0 аргон, 1 плазма */
  hue: number;
  /** скорость света, бегущего по нитям */
  flow: number;
  /** толщина резкой нити, px */
  width: number;
  /** доля искр */
  sparks: number;
  /** перехват: в этой точке ленты (0…1) пучок стягивается почти в нить */
  waist?: number;
  /** сила перехвата 0…1 */
  pinch?: number;
};

export type FlowFn = (local: number) => FlowShape;

const K = 7;
const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function blend(a: FlowShape, b: FlowShape, t: number): FlowShape {
  const out = {} as FlowShape;
  out.pts = a.pts.map((p, i) => [mix(p[0], b.pts[i][0], t), mix(p[1], b.pts[i][1], t)] as V2);
  for (const k of [
    "spread",
    "twist",
    "wave",
    "taper",
    "focus",
    "dof",
    "depth",
    "alpha",
    "hue",
    "flow",
    "width",
    "sparks",
  ] as const) {
    out[k] = mix(a[k], b[k], t);
  }
  out.waist = mix(a.waist ?? 0.5, b.waist ?? 0.5, t);
  out.pinch = mix(a.pinch ?? 0, b.pinch ?? 0, t);
  return out;
}

/* ── остановки ──────────────────────────────────────────────────── */

type Stop = { el: HTMLElement; fn: FlowFn; a: number; b: number };
const stops: Stop[] = [];

function measure() {
  const vh = window.innerHeight;
  const y = window.scrollY;
  for (const s of stops) {
    const r = s.el.getBoundingClientRect();
    const top = r.top + y;
    s.a = top - vh * 0.25;
    s.b = Math.max(s.a, top + r.height - vh * 0.75);
  }
  stops.sort((p, q) => p.a - q.a);
  for (let i = 0; i < stops.length - 1; i++) {
    const cur = stops[i];
    const next = stops[i + 1];
    if (next.a - cur.b < vh * 0.6) {
      const m = (cur.b + next.a) / 2;
      cur.b = Math.max(cur.a, m - vh * 0.3);
      next.a = m + vh * 0.3;
    }
  }
}

export function flowStop(el: HTMLElement, fn: FlowFn) {
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

function shapeAt(y: number): FlowShape | null {
  if (!stops.length) return null;
  const first = stops[0];
  if (y <= first.b) return first.fn(clamp((y - first.a) / Math.max(1, first.b - first.a)));
  for (let i = 0; i < stops.length; i++) {
    const s = stops[i];
    if (y >= s.a && y <= s.b) return s.fn(clamp((y - s.a) / Math.max(1, s.b - s.a)));
    const next = stops[i + 1];
    if (next && y > s.b && y < next.a) {
      return blend(s.fn(1), next.fn(0), ease((y - s.b) / Math.max(1, next.a - s.b)));
    }
  }
  return stops[stops.length - 1].fn(1);
}

/* ── внешние воздействия: курсор, притяжение к элементу ─────────── */

let mouseX = -9999;
let mouseY = -9999;
let mx = -9999;
let my = -9999;
/** точка, к которой тянется ближайший участок потока (каталог) */
let attract: V2 | null = null;
let attractK = 0;

export function flowAttract(p: V2 | null) {
  attract = p;
}

let reveal = 1;
let revealFrom = -1;
const REVEAL_MS = 2600;

/** Поток проявляется при загрузке — первый вдох страницы. */
export function flowIntro() {
  if (reducedMotion()) return;
  reveal = 0;
  revealFrom = -1;
}

let current: FlowShape | null = null;
export const flowNow = () => current;

/*
 * Концы ленты всегда за краем экрана. Лента — один бесконечный поток,
 * у неё не должно быть видимого начала и конца ни в одной сцене и ни на
 * одном переходе между сценами: крайние точки сплайна продлеваются по
 * ходу ленты, пока не уйдут за край с запасом.
 */
const EDGE = 0.32;
const outside = (x: number, y: number) => x < -EDGE || x > 1 + EDGE || y < -EDGE || y > 1 + EDGE;

function extendEnds(p: Float32Array) {
  const push = (end: number, inner: number) => {
    let dx = p[end * 2] - p[inner * 2];
    let dy = p[end * 2 + 1] - p[inner * 2 + 1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    let x = p[end * 2];
    let y = p[end * 2 + 1];
    for (let i = 0; i < 40 && !outside(x, y); i++) {
      x += dx * 0.08;
      y += dy * 0.08;
    }
    p[end * 2] = x;
    p[end * 2 + 1] = y;
  };
  push(0, 1);
  push(K - 1, K - 2);
}

/* ── шейдеры ────────────────────────────────────────────────────── */

const STRAND_VS = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uP[${K}];
uniform float uSpread, uTwist, uWave, uTaper, uFocus, uDof, uDepth, uAlpha, uReveal, uHue, uWidth, uDpr;
uniform float uLayer, uWaist, uPinch;
uniform vec2 uMouse;
in float aT;
in float aSide;
in float aU;
in float aZ;
in vec4 aSeed;
out float vSide;
out float vA;
out vec3 vC;
out float vT;
out float vPulse;

vec2 cr(float t) {
  float f = clamp(t, 0.0, 1.0) * float(${K - 1});
  int i = int(floor(f));
  if (i > ${K - 2}) i = ${K - 2};
  float s = f - float(i);
  vec2 p0 = uP[max(i - 1, 0)];
  vec2 p1 = uP[i];
  vec2 p2 = uP[i + 1];
  vec2 p3 = uP[min(i + 2, ${K - 1})];
  return 0.5 * ((2.0 * p1) + (-p0 + p2) * s + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * s * s
    + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * s * s * s);
}

void main() {
  float t = aT;
  vec2 base = cr(t) * uRes;
  vec2 tg = (cr(t + 0.004) - cr(t - 0.004)) * uRes;
  vec2 n = normalize(vec2(-tg.y, tg.x) + 1e-5);

  float unit = min(uRes.x, uRes.y);
  // сужение только у самых концов — они всегда за краем экрана, поэтому
  // в кадре лента не истончается и не «кончается»
  float env = mix(1.0, smoothstep(0.0, 0.05, t) * smoothstep(1.0, 0.95, t), uTaper);
  // перехват: лента проходит сквозь точку, стягиваясь в ней, и идёт дальше
  env *= mix(1.0, 0.04 + 0.96 * smoothstep(0.0, 0.16, abs(t - uWaist)), uPinch);
  float th = 3.14159 * uTwist * t + uTime * 0.12 * aSeed.z + aU * 0.35;
  float lat = aU * cos(th);
  float wander = uWave * sin(t * aSeed.y * 6.2831 + aSeed.x + uTime * aSeed.z);
  // глубина нити: своя плюс та, что даёт поворот пучка
  float z = aZ * 0.55 + aU * sin(th) * 0.55 + uDepth;

  float off = uSpread * unit * env * (lat + wander);
  vec2 p = base + n * off;

  // перспектива: ближние нити расходятся от центра кадра
  vec2 vp = uRes * 0.5;
  float persp = 1.0 / max(0.25, 1.0 - z * 0.32);
  p = vp + (p - vp) * persp;

  // курсор раздвигает нити, как рука — дым
  vec2 dm = p - uMouse;
  float r = unit * 0.16;
  p += normalize(dm + 1e-5) * 28.0 * exp(-dot(dm, dm) / (r * r));

  // глубина резкости: вне фокуса нить шире и тусклее
  float blur = abs(z - uFocus) * uDof;
  float w = uWidth * uDpr * (1.0 + blur * 16.0) * persp;
  // полоса втрое шире нити: края — ореол свечения, середина — сама нить
  p += n * aSide * w * 1.5;

  // слой: перед содержимым — только то, что ближе фокуса
  float front = smoothstep(0.42, 0.62, z);
  float layer = mix(1.0, front, uLayer);

  float ends = smoothstep(0.0, 0.05, t) * smoothstep(1.0, 0.95, t);
  float rv = smoothstep(uReveal, uReveal - 0.06, t);
  // на белом цвет ложится слоями, а не складывается светом — альфа ниже
  vA = 0.55 * uAlpha * layer * ends * rv / (1.0 + blur * 7.0) * (0.55 + 0.45 * aSeed.w);

  // цвет на белом фоне: аргон → плазма вдоль нити; ядро густеет до
  // тёмного аргона, края светлеют до лаванды
  vec3 argon = vec3(0.42, 0.24, 0.94);
  vec3 plasma = vec3(0.92, 0.24, 0.58);
  vec3 deep = vec3(0.24, 0.11, 0.66);
  vec3 lilac = vec3(0.72, 0.62, 1.0);
  vec3 c = mix(argon, plasma, smoothstep(0.15, 0.95, t * 0.8 + aSeed.w * 0.35 + uHue - 0.2));
  c = mix(c, deep, (1.0 - smoothstep(0.0, 0.22, abs(aU))) * 0.55);
  c = mix(c, lilac, smoothstep(0.6, 1.0, abs(aU)) * 0.6);
  vC = c;
  vSide = aSide;
  vT = t;
  vPulse = aSeed.x;

  vec2 clip = (p / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const STRAND_FS = /* glsl */ `#version 300 es
precision highp float;
uniform float uTime;
uniform float uFlow;
in float vSide;
in float vA;
in vec3 vC;
in float vT;
in float vPulse;
out vec4 o;
void main() {
  // ядро нити и мягкий ореол вокруг — свечение без отдельного прохода
  float prof = exp(-vSide * vSide * 40.0) + 0.16 * exp(-vSide * vSide * 3.0);
  // свет бежит по нити — поток, а не нарисованная линия
  float run = 0.62 + 0.38 * sin(vT * 26.0 - uTime * uFlow * 2.2 + vPulse * 6.0);
  float a = vA * prof * run;
  o = vec4(vC * a, a);
}`;

const SPARK_VS = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uP[${K}];
uniform float uSpread, uTwist, uFocus, uDof, uDepth, uAlpha, uReveal, uFlow, uDpr, uLayer, uSparks;
in vec4 aS;
out float vA;
out vec3 vC;

vec2 cr(float t) {
  float f = clamp(t, 0.0, 1.0) * float(${K - 1});
  int i = int(floor(f));
  if (i > ${K - 2}) i = ${K - 2};
  float s = f - float(i);
  vec2 p0 = uP[max(i - 1, 0)];
  vec2 p1 = uP[i];
  vec2 p2 = uP[i + 1];
  vec2 p3 = uP[min(i + 2, ${K - 1})];
  return 0.5 * ((2.0 * p1) + (-p0 + p2) * s + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * s * s
    + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * s * s * s);
}

void main() {
  float t = fract(aS.x + uTime * (0.012 + aS.z * 0.03) * uFlow);
  vec2 base = cr(t) * uRes;
  vec2 tg = (cr(t + 0.004) - cr(t - 0.004)) * uRes;
  vec2 n = normalize(vec2(-tg.y, tg.x) + 1e-5);
  float unit = min(uRes.x, uRes.y);
  float u = aS.y * 2.0 - 1.0;
  float th = 3.14159 * uTwist * t;
  float z = (aS.w * 2.0 - 1.0) * 0.9 + u * sin(th) * 0.4 + uDepth;
  vec2 p = base + n * uSpread * unit * u * cos(th) * 1.3;
  vec2 vp = uRes * 0.5;
  float persp = 1.0 / max(0.25, 1.0 - z * 0.32);
  p = vp + (p - vp) * persp;
  float blur = abs(z - uFocus) * uDof;
  float front = smoothstep(0.42, 0.62, z);
  float layer = mix(1.0, front, uLayer);
  float on = step(aS.z, uSparks);
  vA = uAlpha * layer * on * smoothstep(uReveal, uReveal - 0.06, t) / (1.0 + blur * 3.0);
  vC = mix(vec3(0.42, 0.24, 0.94), vec3(0.92, 0.24, 0.58), aS.w);
  gl_PointSize = (1.6 + blur * 22.0) * persp * uDpr;
  vec2 clip = (p / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const SPARK_FS = /* glsl */ `#version 300 es
precision highp float;
in float vA;
in vec3 vC;
out vec4 o;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d) * 4.0;
  float a = vA * smoothstep(1.0, 0.2, r) * 0.9;
  o = vec4(vC * a, a);
}`;

/* ── WebGL ──────────────────────────────────────────────────────── */

const STRANDS = 240;
const SEG = 120;
const SPARKS = 700;

function rnd(i: number, k: number) {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type Layer = {
  gl: WebGL2RenderingContext;
  strand: WebGLProgram;
  spark: WebGLProgram;
  vaoS: WebGLVertexArrayObject;
  vaoP: WebGLVertexArrayObject;
  u: Record<string, WebGLUniformLocation | null>;
  up: Record<string, WebGLUniformLocation | null>;
};

function compile(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error(`${type === gl.VERTEX_SHADER ? "vertex" : "fragment"}: ${gl.getShaderInfoLog(s)}`);
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, make(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
  return p;
}

/** Холст, уже подготовленный раньше (строгий режим монтирует эффекты дважды). */
const built = new WeakMap<HTMLCanvasElement, Layer>();

function setupLayer(canvas: HTMLCanvasElement): Layer | null {
  const ready = built.get(canvas);
  if (ready && !ready.gl.isContextLost()) return ready;
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const strand = compile(gl, STRAND_VS, STRAND_FS);
  const spark = compile(gl, SPARK_VS, SPARK_FS);

  // нить: полоса из SEG отрезков, по две вершины на шаг
  const base = new Float32Array((SEG + 1) * 2 * 2);
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG;
    base.set([t, -1, t, 1], i * 4);
  }
  // характер каждой нити — постоянный, чтобы поток не мерцал
  const inst = new Float32Array(STRANDS * 6);
  for (let k = 0; k < STRANDS; k++) {
    const u = rnd(k, 1) * 2 - 1;
    inst.set(
      [
        Math.sign(u) * Math.pow(Math.abs(u), 0.8),
        rnd(k, 2) * 2 - 1,
        rnd(k, 3) * 6.283,
        0.5 + rnd(k, 4) * 1.8,
        0.15 + rnd(k, 5) * 0.6,
        rnd(k, 6),
      ],
      k * 6
    );
  }

  const vaoS = gl.createVertexArray()!;
  gl.bindVertexArray(vaoS);
  const bBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bBuf);
  gl.bufferData(gl.ARRAY_BUFFER, base, gl.STATIC_DRAW);
  const aT = gl.getAttribLocation(strand, "aT");
  const aSide = gl.getAttribLocation(strand, "aSide");
  gl.enableVertexAttribArray(aT);
  gl.vertexAttribPointer(aT, 1, gl.FLOAT, false, 8, 0);
  gl.enableVertexAttribArray(aSide);
  gl.vertexAttribPointer(aSide, 1, gl.FLOAT, false, 8, 4);

  const iBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, iBuf);
  gl.bufferData(gl.ARRAY_BUFFER, inst, gl.STATIC_DRAW);
  const aU = gl.getAttribLocation(strand, "aU");
  const aZ = gl.getAttribLocation(strand, "aZ");
  const aSeed = gl.getAttribLocation(strand, "aSeed");
  gl.enableVertexAttribArray(aU);
  gl.vertexAttribPointer(aU, 1, gl.FLOAT, false, 24, 0);
  gl.vertexAttribDivisor(aU, 1);
  gl.enableVertexAttribArray(aZ);
  gl.vertexAttribPointer(aZ, 1, gl.FLOAT, false, 24, 4);
  gl.vertexAttribDivisor(aZ, 1);
  gl.enableVertexAttribArray(aSeed);
  gl.vertexAttribPointer(aSeed, 4, gl.FLOAT, false, 24, 8);
  gl.vertexAttribDivisor(aSeed, 1);

  const sp = new Float32Array(SPARKS * 4);
  for (let i = 0; i < SPARKS; i++) sp.set([rnd(i, 11), rnd(i, 12), rnd(i, 13), rnd(i, 14)], i * 4);
  const vaoP = gl.createVertexArray()!;
  gl.bindVertexArray(vaoP);
  const pBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pBuf);
  gl.bufferData(gl.ARRAY_BUFFER, sp, gl.STATIC_DRAW);
  const aS = gl.getAttribLocation(spark, "aS");
  gl.enableVertexAttribArray(aS);
  gl.vertexAttribPointer(aS, 4, gl.FLOAT, false, 16, 0);
  gl.bindVertexArray(null);

  const names = [
    "uRes", "uTime", "uP", "uSpread", "uTwist", "uWave", "uTaper", "uFocus", "uDof", "uDepth",
    "uAlpha", "uReveal", "uHue", "uWidth", "uDpr", "uLayer", "uMouse", "uFlow", "uWaist", "uPinch",
  ];
  const u: Layer["u"] = {};
  for (const n of names) u[n] = gl.getUniformLocation(strand, n);
  const up: Layer["up"] = {};
  for (const n of [
    "uRes", "uTime", "uP", "uSpread", "uTwist", "uFocus", "uDof", "uDepth", "uAlpha",
    "uReveal", "uFlow", "uDpr", "uLayer", "uSparks",
  ])
    up[n] = gl.getUniformLocation(spark, n);

  gl.enable(gl.BLEND);
  // обычное наложение: на белом фоне свет не складывается, а ложится цветом
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.DEPTH_TEST);
  const layer = { gl, strand, spark, vaoS, vaoP, u, up };
  built.set(canvas, layer);
  return layer;
}

/**
 * Запускает поток на холсте под содержимым.
 * Возвращает false, если WebGL2 недоступен: тогда страница живёт на
 * статичном свечении из CSS.
 */
export function mountFlow(back: HTMLCanvasElement) {
  let layers: { layer: Layer; canvas: HTMLCanvasElement; index: number }[] = [];
  try {
    const b = setupLayer(back);
    if (!b) return null;
    layers = [{ layer: b, canvas: back, index: 0 }];
  } catch (e) {
    console.warn("[flow]", e);
    return null;
  }

  const still = reducedMotion();
  let lastDraw = -1;
  let dpr = 1;
  let w = 0;
  let h = 0;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    for (const { canvas } of layers) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    measure();
    // смена размера стирает холст: в покое его нужно перерисовать
    lastDraw = -1;
  };
  resize();

  const onMove = (e: PointerEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };
  const onLeave = () => {
    mouseX = -9999;
    mouseY = -9999;
  };
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("load", measure);
  document.fonts?.ready.then(measure);

  const pts = new Float32Array(K * 2);

  // GPU сбросил контекст — страница остаётся на статичном свечении
  const onLost = (e: Event) => {
    e.preventDefault();
    document.documentElement.classList.add("flow-fallback");
  };
  for (const { canvas } of layers) canvas.addEventListener("webglcontextlost", onLost);

  const off = onFrame((time, scroll) => {
    const shape = shapeAt(scroll);
    if (!shape) return;
    current = shape;

    // в покое без движения поток рисуется один раз на положение прокрутки
    if (layers.some(({ layer }) => layer.gl.isContextLost())) return;
    if (still) {
      if (lastDraw === scroll) return;
      lastDraw = scroll;
    }

    if (revealFrom < 0) revealFrom = time;
    if (reveal < 1) reveal = clamp((time - revealFrom) / REVEAL_MS);
    const rv = 1 - Math.pow(1 - reveal, 3);

    // курсор ведётся с запаздыванием — нити отходят, а не дёргаются
    if (mouseX < -999) {
      mx = -9999;
      my = -9999;
    } else if (mx < -999) {
      mx = mouseX;
      my = mouseY;
    } else {
      mx += (mouseX - mx) * 0.08;
      my += (mouseY - my) * 0.08;
    }

    // притяжение: средние точки сплайна тянутся к элементу под курсором
    attractK += ((attract ? 1 : 0) - attractK) * 0.06;
    for (let i = 0; i < K; i++) {
      let x = shape.pts[i][0];
      let y = shape.pts[i][1];
      if (attract && i > 0 && i < K - 1) {
        const pull = attractK * 0.55 * (1 - Math.abs(i - (K - 1) / 2) / ((K - 1) / 2));
        y = mix(y, attract[1], pull);
      }
      if (mx > -999) {
        x += ((mx / w) * 2 - 1) * 0.01;
        y += ((my / h) * 2 - 1) * 0.01;
      }
      pts[i * 2] = x;
      pts[i * 2 + 1] = y;
    }

    extendEnds(pts);

    const t = still ? 7 : time / 1000;
    // лента появляется целиком, проявлением, а не прорастает кончиком
    const reveal_ = 1.06;

    for (const { layer, canvas, index } of layers) {
      const { gl, u, up } = layer;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (shape.alpha < 0.01) continue;

      gl.useProgram(layer.strand);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, t);
      gl.uniform2fv(u.uP, pts);
      gl.uniform1f(u.uSpread, shape.spread);
      gl.uniform1f(u.uTwist, shape.twist);
      gl.uniform1f(u.uWave, shape.wave);
      gl.uniform1f(u.uTaper, shape.taper);
      gl.uniform1f(u.uFocus, shape.focus);
      gl.uniform1f(u.uDof, shape.dof);
      gl.uniform1f(u.uDepth, shape.depth);
      gl.uniform1f(u.uAlpha, shape.alpha * rv * (index === 1 ? 1.1 : 1));
      gl.uniform1f(u.uReveal, reveal_);
      gl.uniform1f(u.uHue, shape.hue);
      gl.uniform1f(u.uWidth, shape.width);
      gl.uniform1f(u.uDpr, dpr);
      gl.uniform1f(u.uLayer, index);
      gl.uniform2f(u.uMouse, mx * dpr, my * dpr);
      gl.uniform1f(u.uFlow, shape.flow);
      gl.uniform1f(u.uWaist, shape.waist ?? 0.5);
      gl.uniform1f(u.uPinch, shape.pinch ?? 0);
      gl.bindVertexArray(layer.vaoS);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (SEG + 1) * 2, STRANDS);

      if (shape.sparks > 0.01) {
        gl.useProgram(layer.spark);
        gl.uniform2f(up.uRes, canvas.width, canvas.height);
        gl.uniform1f(up.uTime, t);
        gl.uniform2fv(up.uP, pts);
        gl.uniform1f(up.uSpread, shape.spread);
        gl.uniform1f(up.uTwist, shape.twist);
        gl.uniform1f(up.uFocus, shape.focus);
        gl.uniform1f(up.uDof, shape.dof);
        gl.uniform1f(up.uDepth, shape.depth);
        gl.uniform1f(up.uAlpha, shape.alpha * rv);
        gl.uniform1f(up.uReveal, reveal_);
        gl.uniform1f(up.uFlow, shape.flow);
        gl.uniform1f(up.uDpr, dpr);
        gl.uniform1f(up.uLayer, index);
        gl.uniform1f(up.uSparks, shape.sparks);
        gl.bindVertexArray(layer.vaoP);
        gl.drawArrays(gl.POINTS, 0, SPARKS);
      }
      gl.bindVertexArray(null);
    }
  });

  return () => {
    off();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("load", measure);
    // Контекст гасим, только когда холст действительно ушёл со страницы:
    // строгий режим React монтирует эффекты дважды на том же холсте, а
    // браузер держит лишь около шестнадцати живых контекстов.
    for (const { layer, canvas } of layers) {
      canvas.removeEventListener("webglcontextlost", onLost);
      window.setTimeout(() => {
        if (canvas.isConnected) return;
        built.delete(canvas);
        layer.gl.getExtension("WEBGL_lose_context")?.loseContext();
      });
    }
  };
}

export const remeasureFlow = measure;
