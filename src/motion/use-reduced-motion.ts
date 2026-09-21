/**
 * Следит за системной настройкой «меньше движения».
 *
 * Отличается от разовой проверки `reducedMotion()` тем, что переживает
 * переключение настройки на лету: пользователь может включить её, не
 * перезагружая страницу, и сцена обязана это заметить.
 */

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
