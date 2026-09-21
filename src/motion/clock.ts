/**
 * ELTO — один тактовый генератор.
 *
 * Правило, без которого scroll-driven сайт рассыпается: Lenis, движок
 * anime.js и все scroll-сцены обновляются в одном кадре и в одном порядке.
 * Поэтому Lenis запускается с `autoRaf: false`, у anime.js отключается
 * собственный главный цикл, и оба тикаются отсюда:
 *
 *     lenis.raf(t)  →  engine.update()  →  scenes.tick(scroll)
 *
 * Если дать каждому свой requestAnimationFrame, скрабируемый канвас и
 * таймлайны разойдутся на кадр — и это видно.
 */

import Lenis from "lenis";
import { engine } from "animejs";
import { tickScenes, measureScenes } from "./scene";

let lenis: Lenis | null = null;
let started = false;

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function startClock() {
  if (started || typeof window === "undefined") return;
  started = true;

  engine.useDefaultMainLoop = false;

  const soft = !reducedMotion();

  if (soft) {
    lenis = new Lenis({
      autoRaf: false,
      duration: 1.15,
      // тяжёлое, весомое торможение: прокрутка должна ощущаться как масса
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
      gestureOrientation: "vertical",
    });
  }

  // ручка для съёмочного стенда scripts/shoot.mjs
  (window as unknown as { __lenis?: Lenis | null }).__lenis = lenis;

  // Единственный rAF на весь сайт. Живёт столько же, сколько вкладка:
  // останавливать его незачем и некому — приложение не размонтируется.
  const loop = (time: number) => {
    lenis?.raf(time);
    engine.update();
    tickScenes(lenis ? lenis.scroll : window.scrollY);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  const remeasure = () => measureScenes();
  window.addEventListener("resize", remeasure);
  window.addEventListener("orientationchange", remeasure);
  document.fonts?.ready.then(remeasure);

  // картинки меняют высоту документа уже после первого замера
  window.addEventListener("load", remeasure);
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.classList.toggle("lenis-stopped", locked);
  document.body.style.overflow = locked && !lenis ? "hidden" : "";
}

export function scrollToTop(instant = false) {
  if (lenis) lenis.scrollTo(0, { immediate: instant, duration: instant ? 0 : 1 });
  else window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
}
