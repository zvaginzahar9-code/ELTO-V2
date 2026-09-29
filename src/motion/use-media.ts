/**
 * Следит за медиазапросом и переживает смену на лету — поворот телефона,
 * растяжку окна.
 *
 * Телефон — не уменьшенный десктоп: некоторые сцены там устроены иначе
 * (лента этапов листается пальцем, а не едет по прокрутке), и компоненту
 * нужно знать это в разметке, а не только в стилях.
 */

import { useEffect, useState } from "react";

export const PHONE = "(max-width: 860px)";

export function useMedia(query: string): boolean {
  const [match, setMatch] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return match;
}
