/**
 * Опоры СТВ — таблица типоразмеров из карточки elto.kz.
 *
 * Ей пользуются две сцены главной: панель изделия в герое и подбор опоры
 * по высоте. Таблица берётся из той же выгрузки, что и страница изделия;
 * в бандле её нет, поэтому хук отдаёт пустой список, пока она грузится.
 */

import { useEffect, useState } from "react";
import { loadProduct, type ProductFull } from "./data";
import type { Lang } from "./i18n";

export const STV_SLUG = "opory-osveshcheniya-granenye-konicheskie-flancevye-stv";

export type StvRow = {
  mark: string;
  mass: number;
  h: number;
  dn: number;
  dv: number;
  /** фланец: А × В, болты d */
  flange: string;
  anchor: string;
  pipe: string;
};

function rowsOf(p: ProductFull | null): StvRow[] {
  const table = p?.tables?.[0] ?? [];
  const out: StvRow[] = [];
  for (const r of table) {
    const mark = (r[0] || "").replace(/^Опора освещения\s+/i, "").trim();
    if (!/^СТВ/.test(mark)) continue;
    const [dn, dv] = (r[3] || "").split("/").map((v) => parseFloat(v));
    const h = parseFloat(r[2]);
    if (!h || !dn || !dv) continue;
    out.push({
      mark,
      mass: parseFloat(r[1]) || 0,
      h,
      dn,
      dv,
      flange: r[4] && r[5] ? `${r[4]}×${r[5]}, ${r[6] || ""}`.trim() : "",
      anchor: r[8] || "",
      pipe: r[9] || "",
    });
  }
  return out;
}

/** Таблица грузится один раз за визит: обе сцены берут её из этого кэша. */
let cache: StvRow[] | null = null;

export function useStv() {
  const [rows, setRows] = useState<StvRow[]>(() => cache ?? []);
  useEffect(() => {
    if (cache) return;
    let alive = true;
    loadProduct(STV_SLUG)
      .then((p) => {
        const r = rowsOf(p);
        if (r.length) cache = r;
        if (alive) setRows(r);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return rows;
}

/** единицы — на языке страницы */
export const units = (lang: Lang) => (lang === "en" ? { m: "m", kg: "kg" } : { m: "м", kg: "кг" });

export const metres = (mm: number, lang: Lang) =>
  (mm / 1000).toLocaleString(lang === "en" ? "en-GB" : "ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
