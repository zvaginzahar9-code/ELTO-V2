/**
 * Сцена потока: холст и курьер.
 *
 * Холст потока стоит под содержимым: нити никогда не ложатся на текст,
 * иначе его трудно читать. Курьер (знак ELTO) летит над всем этим.
 *
 * Подвал тоже часть финала: его поток регистрируется отсюда, потому что
 * сам подвал общий для всех страниц и о потоке знать не должен.
 */

import { useEffect, useRef } from "react";
import { flowIntro, flowStop, mountFlow } from "@/motion/flow";
import { mountCourier } from "@/motion/courier";
import { footerFlow } from "@/scenes/flow-shapes";

const E_MARK =
  "19,28 2841,28 2841,934 1067,934 1067,1353 2635,1353 2635,2110 1067,2110 1067,2530 2841,2530 2841,3435 19,3435 19,2859 19,2530 19,2110 19,1353 19,934 19,604";

export default function FlowStage() {
  const back = useRef<HTMLCanvasElement>(null);
  const courier = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!back.current || !courier.current) return;
    const root = document.documentElement;
    root.classList.add("has-flow");
    const off = mountFlow(back.current);
    if (!off) root.classList.add("flow-fallback");
    else flowIntro();
    const offCourier = mountCourier(courier.current);

    const foot = document.querySelector<HTMLElement>(".foot");
    const offFoot = foot ? flowStop(foot, footerFlow) : () => {};

    return () => {
      off?.();
      offCourier();
      offFoot();
      root.classList.remove("has-flow", "flow-fallback");
    };
  }, []);

  return (
    <>
      <div className="flow" aria-hidden="true">
        <div className="flow__fallback" />
        <canvas className="flow__back" ref={back} />
        <div className="flow__grain" />
      </div>
      <div className="courier" ref={courier} aria-hidden="true">
        <svg viewBox="0 0 2860 3460">
          <polygon points={E_MARK} />
        </svg>
      </div>
    </>
  );
}
