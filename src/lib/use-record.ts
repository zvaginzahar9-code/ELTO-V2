/**
 * Загрузка полной записи по адресу страницы.
 *
 * Карточка изделия и любая контентная страница грузятся одинаково: взять
 * запись по slug, показать её, а при смене адреса начать сначала. Раньше это
 * было переписано в каждой странице своим эффектом, который сбрасывал
 * состояние прямо в теле — React за такое справедливо ругается, потому что
 * получается лишний каскад рендеров.
 *
 * Здесь сброс сделан правильно: при смене slug состояние поправляется во
 * время рендера, а эффект занимается только самой загрузкой.
 */

import { useEffect, useState } from "react";

type State<T> = { slug: string; data: T | null; failed: boolean };

export type Record<T> = { data: T | null; failed: boolean };

export function useRecord<T>(
  slug: string,
  load: (slug: string) => Promise<T>
): Record<T> {
  const [state, setState] = useState<State<T>>({ slug, data: null, failed: false });

  if (state.slug !== slug) setState({ slug, data: null, failed: false });

  useEffect(() => {
    let alive = true;
    load(slug)
      .then((data) => {
        if (alive) setState((s) => (s.slug === slug ? { ...s, data } : s));
      })
      .catch(() => {
        if (alive) setState((s) => (s.slug === slug ? { ...s, failed: true } : s));
      });
    return () => {
      alive = false;
    };
  }, [slug, load]);

  // пока состояние не догнало новый адрес, отдаём пустое — иначе на миг
  // покажется содержимое предыдущей страницы
  return state.slug === slug
    ? { data: state.data, failed: state.failed }
    : { data: null, failed: false };
}
