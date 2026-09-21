/**
 * Маскированное проявление текста.
 *
 * Строка не проступает из прозрачности — она приходит из-под собственной
 * базовой линии. Разбиение делает anime.js (`splitText` с `wrap: "clip"`),
 * запуск привязан к появлению блока в кадре.
 *
 * Если разбить текст не удалось, абзац просто остаётся видимым: заголовок
 * ELTO никогда не должен застрять невидимым из-за анимации.
 */

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { animate, onScroll, splitText, stagger, utils } from "animejs";
import { reducedMotion } from "@/motion/clock";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  kind?: "lines" | "words";
  delay?: number;
  stagger?: number;
  duration?: number;
  /** запустить сразу, не дожидаясь скролла */
  immediate?: boolean;
};

export default function Reveal({
  children,
  as: Tag = "div",
  className,
  kind = "lines",
  delay = 0,
  stagger: step = 90,
  duration = 1100,
  immediate = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reducedMotion()) {
      node.style.visibility = "visible";
      return;
    }

    type Revertible = { revert: () => unknown };
    let split: Revertible | null = null;
    let animation: Revertible | null = null;
    let observer: Revertible | null = null;
    let cancelled = false;

    const run = () => {
      if (cancelled || !ref.current) return;
      try {
        const s = splitText(node, {
          lines: kind === "lines" ? { wrap: "clip" } : false,
          words: kind === "words" ? { wrap: "clip" } : false,
        }) as unknown as {
          lines: HTMLElement[];
          words: HTMLElement[];
          revert: () => void;
        };
        split = s;
        const targets = kind === "lines" ? s.lines : s.words;
        utils.set(node, { visibility: "visible" });
        if (!targets?.length) return;

        // наблюдатель держим отдельно: без него после ухода со страницы
        // он остаётся в движке и продолжает считать прокрутку впустую
        const scroll = immediate
          ? null
          : onScroll({ enter: "bottom-=8% top", repeat: false });
        observer = scroll;

        animation = animate(targets, {
          y: ["108%", "0%"],
          duration,
          delay: stagger(step, { start: delay }),
          ease: "out(3)",
          ...(scroll ? { autoplay: scroll } : {}),
        });
      } catch {
        utils.set(node, { visibility: "visible" });
      }
    };

    // строки можно резать только по загруженному шрифту, иначе перенос уедет
    if (document.fonts?.status === "loaded") run();
    else document.fonts?.ready.then(run);

    return () => {
      cancelled = true;
      animation?.revert();
      observer?.revert();
      split?.revert();
    };
  }, [kind, delay, step, duration, immediate]);

  return (
    <Tag ref={ref as never} className={className} style={{ visibility: "hidden" }}>
      {children}
    </Tag>
  );
}
