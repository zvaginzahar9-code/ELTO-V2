/**
 * КУРЬЕР — знак ELTO, который путешествует по главной.
 *
 * Один и тот же элемент стоит у заголовка героя, разворачивается в
 * аргоновую плиту слогана, садится узлом в схему производства и в конце
 * становится кнопкой отправки заявки. Это не четыре одинаковых значка, а
 * один предмет: зритель видит, откуда он пришёл и куда ушёл.
 *
 * Места посадки — элементы с атрибутом data-dock. Курьер покидает место,
 * когда оно уходит вверх за треть экрана, и прибывает на следующее, когда
 * то поднимается к середине. В пути он летит по прямой между двумя
 * движущимися точками — обе едут вместе с прокруткой, поэтому траектория
 * получается дугой, а не отрезком.
 */

import { onFrame, reducedMotion } from "./clock";

type Dock = { el: HTMLElement; top: number; h: number; name: string };

const docks: Dock[] = [];
const listeners = new Set<(name: string | null, inFlight: boolean) => void>();

function measure() {
  const y = window.scrollY;
  for (const d of docks) {
    const r = d.el.getBoundingClientRect();
    d.top = r.top + y;
    d.h = r.height;
  }
  docks.sort((a, b) => a.top - b.top);
}

export function courierDock(el: HTMLElement, name: string) {
  const d: Dock = { el, top: 0, h: 0, name };
  docks.push(d);
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(el);
  return () => {
    ro.disconnect();
    const i = docks.indexOf(d);
    if (i > -1) docks.splice(i, 1);
  };
}

/** Сцена узнаёт, что курьер сел к ней (например, плита знака раскрывается). */
export function onCourier(cb: (name: string | null, inFlight: boolean) => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** собственный размер курьера, px; на месте он масштабируется под гнездо */
const BASE = 64;
/** доли экрана: выше LEAVE гнездо отпускает курьера, на LAND он садится */
const LEAVE = 0.3;
const LAND = 0.55;
/** сколько ждать въезда заголовка героя, мс */
const INTRO_MS = 1400;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function mountCourier(node: HTMLElement) {
  if (reducedMotion()) {
    node.style.display = "none";
    return () => {};
  }
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  document.fonts?.ready.then(measure);

  let lastName: string | null = "";
  let lastFlight = false;

  let born = -1;
  const off = onFrame((time) => {
    if (born < 0) born = time;
    if (docks.length === 0) {
      node.style.opacity = "0";
      return;
    }
    const vh = window.innerHeight;
    // места посадки — по живым координатам: гнездо может ехать в
    // анимации или стоять в закреплённой сцене
    const live = docks.map((d) => {
      const r = d.el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, s: Math.min(r.width, r.height) };
    });

    // текущее место — последнее, до которого курьер уже долетел
    let i = 0;
    for (let k = 1; k < live.length; k++) if (live[k].y <= vh * LAND) i = k;
    const a = live[i];
    const b = live[i + 1];

    let x = a.x;
    let y = a.y;
    let s = a.s;
    let flight = false;
    let name: string | null = docks[i].name;
    if (b && a.y < vh * LEAVE) {
      // взлёт начался, когда гнездо ушло выше LEAVE; посадка — когда
      // следующее поднимется к LAND
      const gone = vh * LEAVE - a.y;
      const left = Math.max(0, b.y - vh * LAND);
      const p = ease(clamp(gone / Math.max(1, gone + left)));
      x = a.x + (b.x - a.x) * p;
      y = a.y + (b.y - a.y) * p;
      s = a.s + (b.s - a.s) * p;
      if (p > 0 && p < 1) {
        flight = true;
        name = null;
        // в полёте поднимается над потоком: крупнее, с наклоном по ходу
        s *= 1 + Math.sin(p * Math.PI) * 0.35;
      }
      node.style.setProperty("--tilt", `${(Math.sin(p * Math.PI) * (b.x > a.x ? 14 : -14)).toFixed(2)}deg`);
    } else {
      node.style.setProperty("--tilt", "0deg");
    }

    // первые полторы секунды заголовок героя ещё въезжает из масок —
    // знак появляется, когда его строка уже стоит на месте
    const settled = time - born > INTRO_MS;
    const visible = settled && y > -s && y < vh + s;
    node.style.opacity = visible ? "1" : "0";
    // размер меняется масштабом, а не шириной: курьер не трогает раскладку
    node.style.transform = `translate3d(${(x - BASE / 2).toFixed(1)}px, ${(y - BASE / 2).toFixed(1)}px, 0) scale(${(s / BASE).toFixed(4)}) rotate(var(--tilt, 0deg))`;
    node.dataset.flight = flight ? "true" : "false";
    node.dataset.at = name ?? "";

    if (name !== lastName || flight !== lastFlight) {
      lastName = name;
      lastFlight = flight;
      listeners.forEach((l) => l(name, flight));
    }
  });

  return () => {
    off();
    window.removeEventListener("resize", measure);
    window.removeEventListener("load", measure);
  };
}
