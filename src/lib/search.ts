/**
 * Поиск по каталогу: названия, описания и обозначения из таблиц.
 *
 * Обозначения лежат в отдельном индексе (scripts/build-search.mjs) и
 * загружаются при первом вводе. Сравнение терпимо к тому, как маркировку
 * набирают на самом деле: регистр, «ё», дефисы, запятые и пробелы не важны,
 * латинские буквы-двойники (C, T, K, M…) считаются кириллическими — в
 * спецификациях их путают постоянно.
 */

import { products, type ProductBrief } from "./data";
import { pick, type Lang } from "./i18n";

const LOOKALIKE: Record<string, string> = {
  a: "а",
  b: "в",
  c: "с",
  e: "е",
  h: "н",
  k: "к",
  m: "м",
  o: "о",
  p: "р",
  t: "т",
  x: "х",
  y: "у",
};

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[abcehkmoptxy]/g, (ch) => LOOKALIKE[ch])
    .replace(/[\s\-–—_,.*/()]+/g, " ")
    .trim();

type Index = Record<string, string[]>;
let marks: Promise<Index> | null = null;

export const loadMarks = () => {
  if (!marks) {
    marks = fetch("/data/search.json")
      .then((r) => (r.ok ? (r.json() as Promise<Index>) : {}))
      .catch(() => ({}));
  }
  return marks;
};

export type Hit = { product: ProductBrief; marks: string[] };

export function searchCatalog(
  query: string,
  lang: Lang,
  index: Index | null
): Hit[] | null {
  const needle = normalize(query);
  if (needle.length < 2) return null;
  const words = needle.split(" ");
  const hasAll = (hay: string) => words.every((w) => hay.includes(w));

  const hits: { hit: Hit; score: number }[] = [];
  for (const p of products) {
    const title = normalize(pick(p.t, lang));
    const found = (index?.[p.s] || []).filter((m) => hasAll(normalize(m)));
    let score = 0;
    if (title.startsWith(needle)) score = 4;
    else if (hasAll(title)) score = 3;
    else if (found.length) score = 2;
    else if (hasAll(normalize(p.d))) score = 1;
    if (score) hits.push({ hit: { product: p, marks: found.slice(0, 4) }, score });
  }
  return hits.sort((a, b) => b.score - a.score).map((h) => h.hit);
}
