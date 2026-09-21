/**
 * Откуда пришёл человек.
 *
 * Нужно ровно для одного: если кнопка «Назад» ведёт туда же, откуда он
 * только что пришёл, честнее вернуть его по истории — тогда длинный список
 * останется на прежней позиции прокрутки, а не откроется сверху.
 */

let previous: string | null = null;
let current: string | null = null;

export function recordPath(path: string) {
  if (path === current) return;
  previous = current;
  current = path;
}

export const previousPath = () => previous;
