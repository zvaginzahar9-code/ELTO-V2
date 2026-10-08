/**
 * Заголовок, который проявляется прокруткой.
 *
 * Слова не «выезжают» по таймеру при входе в экран, а проступают из
 * размытия ровно с той скоростью, с какой человек листает: прокрутил
 * назад — слова снова расплылись. Так заголовок становится частью сцены,
 * а не наклейкой поверх неё.
 *
 * Акцентное слово отмечается звёздочками: «Из листа *в опору*». Оно
 * набирается курсивной антиквой — один акцент на заголовок.
 */

import { Fragment, useEffect, useRef, type ElementType } from "react";
import { registerScene, span } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** отрезок сцены входа, за который заголовок проявляется целиком */
  from?: number;
  to?: number;
};

type Word = { w: string; accent: boolean };

function parse(text: string): Word[] {
  const out: Word[] = [];
  text.split(/(\*[^*]+\*)/).forEach((chunk) => {
    if (!chunk) return;
    const accent = chunk.startsWith("*") && chunk.endsWith("*");
    const body = accent ? chunk.slice(1, -1) : chunk;
    body
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w) => out.push({ w, accent }));
  });
  return out;
}

export default function Title({ text, as: Tag = "h2", className, from = 0.04, to = 0.38 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const words = parse(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>(".tw"));
    const n = nodes.length;
    let last = -1;
    return registerScene(el, {
      mode: "enter",
      onUpdate(p) {
        const k = span(p, from, to) * (n + 2.5);
        if (Math.abs(k - last) < 0.002) return;
        last = k;
        nodes.forEach((node, i) => {
          const v = Math.min(1, Math.max(0, (k - i) / 2.5));
          const e = 1 - Math.pow(1 - v, 3);
          node.style.opacity = (0.06 + e * 0.94).toFixed(3);
          node.style.filter = e >= 1 ? "none" : `blur(${((1 - e) * 10).toFixed(2)}px)`;
          node.style.transform = `translate3d(0, ${((1 - e) * 0.32).toFixed(3)}em, 0)`;
        });
      },
    });
  }, [from, to, text]);

  return (
    <Tag ref={ref} className={"title-flow " + (className ?? "")} aria-label={text.replace(/\*/g, "")}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className={"tw" + (w.accent ? " tw--acc" : "")} aria-hidden="true">
            {w.w}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
