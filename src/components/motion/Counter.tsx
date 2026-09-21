/**
 * Счётчик.
 *
 * Все цифры на сайте взяты с оригинала elto.kz — счётчик только доводит их
 * до глаза, а не придумывает. Моноширинные табличные цифры, чтобы строка не
 * дёргалась по ширине во время счёта.
 */

import { useEffect, useRef } from "react";
import { animate, onScroll } from "animejs";
import { reducedMotion } from "@/motion/clock";

type Props = {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
  /** разделитель тысяч как на оригинале — пробел */
  group?: boolean;
  prefix?: string;
  suffix?: string;
};

export default function Counter({
  to,
  from = 0,
  duration = 1800,
  className,
  group = false,
  prefix = "",
  suffix = "",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const render = (v: number) => {
      const n = Math.round(v);
      // Intl ставит неразрывный или узкий пробел — в моноширинной строке
      // он читается как дырка, поэтому приводим к обычному
      const grouped = n.toLocaleString("ru-RU").replace(/[\u00a0\u202f]/g, " ");
      el.textContent = prefix + (group ? grouped : String(n)) + suffix;
    };

    if (reducedMotion()) {
      render(to);
      return;
    }

    render(from);
    const state = { v: from };
    // наблюдатель прокрутки снимаем отдельно от самой анимации: иначе он
    // остаётся в движке и после ухода со страницы
    const observer = onScroll({ enter: "bottom-=5% top", repeat: false });
    const anim = animate(state, {
      v: to,
      duration,
      ease: "out(3)",
      onUpdate: () => render(state.v),
      autoplay: observer,
    });
    return () => {
      anim.revert();
      observer.revert();
    };
  }, [to, from, duration, group, prefix, suffix]);

  return <span ref={ref} className={className} />;
}
