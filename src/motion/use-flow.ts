import { useEffect, type RefObject } from "react";
import { flowStop, type FlowFn } from "./flow";
import { courierDock } from "./courier";

/** Сцена заявляет состояние потока на время, пока стоит в кадре. */
export function useFlowStop(ref: RefObject<HTMLElement | null>, fn: FlowFn) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return flowStop(el, fn);
  }, [ref, fn]);
}

/** Место, куда садится курьер — знак ELTO. */
export function useDock(ref: RefObject<HTMLElement | null>, name: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return courierDock(el, name);
  }, [ref, name]);
}
