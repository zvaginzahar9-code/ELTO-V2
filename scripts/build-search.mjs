#!/usr/bin/env node
/**
 * Индекс поиска по маркировке.
 *
 * Проектировщик и снабженец приходят с маркировкой из спецификации —
 * «СТВ 9-3,0», «ЗФ-220-М20», «ПМО-Ш 20». На elto.kz такие обозначения живут
 * в первых колонках таблиц характеристик, а не в названиях изделий, поэтому
 * поиск по названиям их не находит.
 *
 * Скрипт собирает первые колонки всех таблиц из public/data/p в один лёгкий
 * индекс public/data/search.json: { изделие → его обозначения }. Сайт
 * загружает индекс только когда человек начинает печатать в поиске.
 *
 *   node scripts/build-search.mjs
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const HERE = path.resolve(import.meta.dirname, "..");
const DIR = path.join(HERE, "public/data/p");
const OUT = path.join(HERE, "public/data/search.json");

/** обозначение — это код, а не шапка таблицы и не голое число */
const isMark = (cell) =>
  cell.length >= 2 && cell.length <= 90 && /\d/.test(cell) && /\p{L}/u.test(cell);

const index = {};
let total = 0;

for (const file of (await readdir(DIR)).filter((f) => f.endsWith(".json"))) {
  const product = JSON.parse(await readFile(path.join(DIR, file), "utf8"));
  const marks = new Set();
  for (const table of product.tables || []) {
    for (const row of table.slice(1)) {
      const cell = String(row[0] || "")
        .replace(/\s+/g, " ")
        .trim();
      if (isMark(cell)) marks.add(cell);
    }
  }
  if (marks.size) {
    index[product.slug] = [...marks];
    total += marks.size;
  }
}

await writeFile(OUT, JSON.stringify(index));
console.log(`search.json: ${Object.keys(index).length} изделий, ${total} обозначений`);
