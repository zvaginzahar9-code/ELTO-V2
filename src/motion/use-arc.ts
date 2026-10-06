import { useEffect, type RefObject } from "react";
import { arcStop, type ShapeFn } from "./arc";

/** Секция заявляет форму аргоновой дуги на время, пока стоит в кадре. */
export function useArcStop(ref: RefObject<HTMLElement | null>, fn: ShapeFn) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return arcStop(el, fn);
  }, [ref, fn]);
}
