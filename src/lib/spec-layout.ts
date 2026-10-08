/**
 * Раскладка таблицы характеристик для телефона: подписи колонок при
 * двухуровневой шапке и строки-подзаголовки. Подробности — в SpecTable.tsx.
 */

/** Группы, которые в шапке оригинала занимают несколько колонок. */
const MULTI = /размер|тип фундамента|нагрузка|өлшем|іргетас түрі|жүктеме|dimension|foundation type|load/i;
/**
 * Сколько колонок у группы, которую можно узнать по подписям снизу: фундамент —
 * «анкерный»/«трубный», нагрузка — «рабочая»/«предельная». Размеры — всё остальное.
 */
const fixedSpan = (label: string, sub: string[]) =>
  /тип фундамента|іргетас түрі|foundation type/i.test(label)
    ? sub.filter((s) => /анкер|труб|құбыр|anchor|pipe/i.test(s)).length
    : /нагрузка|жүктеме|load/i.test(label)
      ? sub.filter((s) => /рабоч|предел|жұмыс|шекті|working|maximum/i.test(s)).length
      : 0;

export const clean = (s: string) => String(s ?? "").replace(/\s+/g, " ").trim();
const isNum = (s: string) => /\d/.test(s) && /^[\d\s.,×xх*/+\-–]+$/i.test(s);

export type Layout = { labels: string[]; body: string[][] } | null;

export function layout(table: string[][]): Layout {
  if (!table.length) return null;
  const width = Math.max(...table.map((r) => r.length));
  const head = table[0].map(clean);
  if (head.length === width) return { labels: head, body: table.slice(1) };

  const sub = (table[1] || []).map(clean);
  if (!sub.length || sub.filter(isNum).length > sub.length / 2) return null;
  // первая строка — заголовок раздела, настоящая шапка под ней
  if (head.length === 1 && sub.length === width) return { labels: sub, body: [[head[0]], ...table.slice(2)] };

  const groups = head.map((h) => ({ label: h, multi: h === "" ? false : MULTI.test(h), empty: h === "" }));
  const labels: string[] = [];

  if (sub.length === width) {
    // подстрока на всю ширину: одиночные группы продолжаются словом снизу («Масса**,» + «кг»)
    const singles = groups.filter((g) => !g.multi).length;
    const multis = groups.filter((g) => g.multi);
    let free = width - singles;
    const spans = multis.map((g) => fixedSpan(g.label, sub));
    const open = spans.filter((s) => !s).length;
    const fixed = spans.reduce((a, b) => a + b, 0);
    if (open > 1 || (open === 0 && fixed !== free)) return null;
    free -= fixed;
    let k = 0;
    let col = 0;
    for (const g of groups) {
      if (!g.multi) {
        labels.push(clean(`${g.label} ${sub[col]}`));
        col++;
        continue;
      }
      const span = spans[k++] || free;
      for (let i = 0; i < span; i++, col++) labels.push(`${g.label} · ${sub[col]}`);
    }
  } else {
    // подстрока только под многоколонными группами; пустая ячейка шапки берёт имя снизу
    const pool = [...sub];
    const multis = groups.filter((g) => g.multi);
    const singles = groups.length - multis.length;
    const emptyCount = groups.filter((g) => g.empty).length;
    const forMulti = sub.length - emptyCount;
    if (forMulti !== width - singles || !multis.length) return null;
    const spans = multis.map((g) => fixedSpan(g.label, sub));
    const open = spans.filter((s) => !s).length;
    const fixed = spans.reduce((a, b) => a + b, 0);
    if (open > 1 || (open === 0 && fixed !== forMulti)) return null;
    let k = 0;
    for (const g of groups) {
      if (g.empty) {
        labels.push(pool.shift() || "");
      } else if (!g.multi) {
        labels.push(g.label);
      } else {
        const span = spans[k++] || forMulti - fixed;
        for (let i = 0; i < span; i++) labels.push(`${g.label} · ${pool.shift() || ""}`);
      }
    }
  }
  return labels.length === width ? { labels, body: table.slice(2) } : null;
}

/** Строка-подзаголовок: заполнена только первая ячейка. */
export const isSection = (row: string[]) => !!clean(row[0]) && row.slice(1).every((c) => !clean(c));

