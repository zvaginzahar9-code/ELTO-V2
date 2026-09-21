/**
 * Кадровый скрабер на канвасе.
 *
 * Перемотка `video.currentTime` по скроллу заикается: длинный GOP заставляет
 * декодер отматывать до опорного кадра, и картинка дерётся с прокруткой.
 * Поэтому каждый кадр, которым управляет скролл, — это декодированный JPEG,
 * положенный на канвас: один drawImage на сменившийся кадр, ни одного seek.
 *
 * Пока кадры не в памяти — и навсегда, если рендера нет вовсе, — кадр держит
 * постер. Пустого прямоугольника на сайте не бывает.
 *
 * Дорожек может быть несколько. Телефон получает облегчённую, а если у сцены
 * снята вертикальная версия и экран держат вертикально — вертикальную: кадр
 * 16:9 на экране 9:16 обрезается так, что от сцены остаётся середина.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { loadSequence, peekSequence, type SequenceSpec } from "@/motion/sequence";

export type SequenceHandle = { draw: (progress: number) => void };

type Props = {
  spec: SequenceSpec;
  /** облегчённая дорожка для телефонов */
  mobileSpec?: SequenceSpec;
  /** вертикальная версия сцены, если она снята отдельно */
  portraitSpec?: SequenceSpec;
  portraitMobileSpec?: SequenceSpec;
  poster: string;
  portraitPoster?: string;
  className?: string;
  /** грузить сразу, не дожидаясь приближения к экрану */
  eager?: boolean;
};

const NARROW = "(max-width: 860px)";
const PORTRAIT = "(orientation: portrait)";

const ScrollSequence = forwardRef<SequenceHandle, Props>(function ScrollSequence(
  {
    spec,
    mobileSpec,
    portraitSpec,
    portraitMobileSpec,
    poster,
    portraitPoster,
    className,
    eager = false,
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const active = useRef<SequenceSpec>(spec);
  const frames = useRef<HTMLImageElement[] | null>(null);
  const posterImg = useRef<HTMLImageElement | null>(null);
  const lastIndex = useRef(-1);
  const lastDrawn = useRef<CanvasImageSource | null>(null);

  /** Какая дорожка подходит нынешнему размеру и повороту экрана. */
  const pickTrack = useCallback((): { seq: SequenceSpec; poster: string } => {
    if (typeof window === "undefined") return { seq: spec, poster };
    const narrow = window.matchMedia(NARROW).matches;
    const portrait = window.matchMedia(PORTRAIT).matches;

    if (narrow && portrait && (portraitSpec?.count ?? 0) > 1) {
      const light =
        (portraitMobileSpec?.count ?? 0) > 1 ? portraitMobileSpec! : portraitSpec!;
      return { seq: light, poster: portraitPoster ?? poster };
    }
    if (narrow && (mobileSpec?.count ?? 0) > 1) return { seq: mobileSpec!, poster };
    return { seq: spec, poster };
  }, [spec, mobileSpec, portraitSpec, portraitMobileSpec, poster, portraitPoster]);

  const [track, setTrack] = useState(pickTrack);

  // поворот телефона меняет подходящую дорожку
  useEffect(() => {
    const queries = [window.matchMedia(NARROW), window.matchMedia(PORTRAIT)];
    const onChange = () => setTrack(pickTrack());
    onChange();
    for (const q of queries) q.addEventListener("change", onChange);
    return () => {
      for (const q of queries) q.removeEventListener("change", onChange);
    };
  }, [pickTrack]);

  const paint = useCallback((src: CanvasImageSource | null) => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = (src as HTMLImageElement).naturalWidth || (src as HTMLCanvasElement).width;
    const ih = (src as HTMLImageElement).naturalHeight || (src as HTMLCanvasElement).height;
    if (!iw || !ih || !cw || !ch) return;

    const scale = Math.max(cw / iw, ch / ih); // object-fit: cover
    const w = iw * scale;
    const h = ih * scale;
    ctx.drawImage(src, (cw - w) / 2, (ch - h) / 2, w, h);
    lastDrawn.current = src;
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (!w || !h || (canvas.width === w && canvas.height === h)) return;
    canvas.width = w;
    canvas.height = h;
    paint(lastDrawn.current ?? posterImg.current);
  }, [paint]);

  useImperativeHandle(
    ref,
    () => ({
      draw(progress: number) {
        const list = frames.current;
        const total = active.current.count;
        if (!list || total < 2) return;
        const i = Math.max(0, Math.min(total - 1, Math.round(progress * (total - 1))));
        if (i === lastIndex.current) return;
        const img = list[i];
        if (!img?.complete || !img.naturalWidth) return;
        lastIndex.current = i;
        paint(img);
      },
    }),
    [paint]
  );

  useEffect(() => {
    const chosen = track.seq;
    active.current = chosen;
    frames.current = peekSequence(chosen.dir) ?? null;
    lastIndex.current = -1;

    resize();
    const ro = new ResizeObserver(resize);
    if (canvasRef.current) ro.observe(canvasRef.current);

    // постер первым: кинематографичный кадр есть уже на первом же фрейме
    const p = new Image();
    p.onload = () => {
      posterImg.current = p;
      if (!frames.current) paint(p);
    };
    p.src = track.poster;

    let cancelled = false;
    let io: IntersectionObserver | null = null;

    const start = () => {
      if (cancelled || chosen.count < 2) return;
      loadSequence(chosen).then((list) => {
        if (cancelled) return;
        frames.current = list;
        lastIndex.current = -1;
      });
    };

    let idle = 0;
    if (frames.current) lastIndex.current = -1;
    else if (eager) {
      /*
       * «Сразу» — не значит «вперёд всего остального». Постер уже на экране,
       * а девяносто шесть кадров, запрошенных в момент загрузки, отодвигают
       * первую отрисовку и шрифты. Поэтому ждём простоя: к моменту, когда
       * зритель доберётся до прокрутки, кадры уже на месте.
       */
      const begin = () => {
        idle = window.requestIdleCallback
          ? window.requestIdleCallback(start, { timeout: 2500 })
          : window.setTimeout(start, 400);
      };
      if (document.readyState === "complete") begin();
      else window.addEventListener("load", begin, { once: true });
    } else {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io?.disconnect();
            start();
          }
        },
        { rootMargin: "150% 0px" }
      );
      if (canvasRef.current) io.observe(canvasRef.current);
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      ro.disconnect();
      if (idle) {
        if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
        else window.clearTimeout(idle);
      }
    };
  }, [track, eager, paint, resize]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
});

export default ScrollSequence;
