/**
 * Марки изделий в английской версии — латиницей: «СТВ 9-3,0» → «STV 9-3,0»,
 * «ЗФ-220-М20» → «ZF-220-M20». Тот же порядок, что у scripts/build-i18n.mjs,
 * чтобы марка в таблице каталога и на главной писалась одинаково.
 */

import type { Lang } from "./i18n";

const LAT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function latin(s: string): string {
  return s
    .replace(/[А-Яа-яЁё]/g, (c) => {
      const lo = c.toLowerCase();
      const t = LAT[lo] ?? c;
      return c === lo ? t : t.charAt(0).toUpperCase() + t.slice(1);
    })
    .replace(/(\d)kh(\d)/g, "$1x$2");
}

/** Марка на языке страницы: по-английски латиницей, иначе как в каталоге. */
export const markIn = (s: string, lang: Lang) => (lang === "en" ? latin(s) : s);
