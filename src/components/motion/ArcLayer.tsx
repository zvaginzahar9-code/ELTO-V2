/**
 * Слой аргоновой дуги: грунт, размытое свечение и сами нити.
 *
 * Слой стоит под содержимым главной и не ловит указатель. Цвет грунта
 * ведёт дуга — поэтому секции главной на десктопе прозрачны: смена ночи
 * и жемчуга идёт одним непрерывным переходом, а не стыком двух фонов.
 */

import { useEffect, useRef } from "react";
import { mountArc, arcIntro } from "@/motion/arc";

export default function ArcLayer() {
  const ground = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLCanvasElement>(null);
  const lines = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ground.current || !glow.current || !lines.current) return;
    document.documentElement.classList.add("has-arc");
    const off = mountArc(lines.current, glow.current, ground.current);
    arcIntro();
    return () => {
      off();
      document.documentElement.classList.remove("has-arc");
      document.documentElement.style.removeProperty("--arc-dark");
    };
  }, []);

  return (
    <div className="arc" aria-hidden="true">
      <div className="arc__ground" ref={ground} />
      <canvas className="arc__glow" ref={glow} />
      <canvas className="arc__lines" ref={lines} />
      <div className="arc__grain" />
    </div>
  );
}
