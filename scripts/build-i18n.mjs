#!/usr/bin/env node
/**
 * ELTO — переводы каталога и страниц на казахский и английский.
 *
 * На elto.kz каталог, страницы и новости есть только по-русски: казахская
 * и английская версии оригинала показывают тот же русский текст. Здесь
 * переводы лежат отдельно, в словарях i18n/kk.json и i18n/en.json
 * (русский фрагмент → перевод), и накладываются на собранные данные после
 * scripts/build-data.mjs. Выгрузка оригинала не трогается.
 *
 * Единица перевода — фрагмент текста между блочными тегами (абзац, пункт
 * списка, ячейка таблицы) вместе со строчными тегами внутри (<br>, <strong>,
 * <a>). Так абзац, разрезанный переносами строк, переводится целиком.
 *
 *   node scripts/build-i18n.mjs            наложить переводы
 *   node scripts/build-i18n.mjs --todo     выписать непереведённое в i18n/todo-*.json
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src", "data");
const PUB = path.join(ROOT, "public", "data");
const DICT = path.join(ROOT, "i18n");
const LANGS = ["kk", "en"];
const TODO = process.argv.includes("--todo");

const readJson = async (f) => JSON.parse(await readFile(f, "utf8"));
/*
 * Словари: i18n/kk.json и i18n/en.json — «русский фрагмент → перевод»
 * для коротких строк; i18n/tr/*.json — длинные фрагменты по короткому
 * ключу (первые 10 знаков sha1 русского текста) → [казахский, английский].
 */
const dict = {};
for (const l of LANGS) {
  const f = path.join(DICT, `${l}.json`);
  dict[l] = existsSync(f) ? await readJson(f) : {};
}
const byId = {};
if (existsSync(path.join(DICT, "tr")))
  for (const f of (await readdir(path.join(DICT, "tr"))).filter((n) => n.endsWith(".json")))
    Object.assign(byId, await readJson(path.join(DICT, "tr", f)));
const idOf = (key) => createHash("sha1").update(key).digest("hex").slice(0, 10);
const look = (key, lang) => dict[lang][key] ?? byId[idOf(key)]?.[LANGS.indexOf(lang)];

const CYR = /[А-Яа-яЁё]/;
const KAZ = /[ӘәҒғҚқҢңӨөҰұҮүҺһІі]/;
/** Обозначение, а не текст: «М30», «СТВ 9-3,0», «ЗФ-220-М20» — не переводятся. */
const isCode = (s) => !/[а-яё]{3,}/.test(s.replace(/<[^>]+>/g, ""));
/* марки для английской версии — латиницей: «СТВ 9-3,0» → «STV 9-3,0» */
const LAT = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
/* одиночные буквы-обозначения (Н, А, В) — латинские двойники, а не транслит */
const TWIN = { А: "A", В: "B", Е: "E", К: "K", М: "M", Н: "H", О: "O", Р: "P", С: "C", Т: "T", Х: "X" };
function latin(s) {
  if (TWIN[s.trim()]) return s.replace(s.trim(), TWIN[s.trim()]);
  return s.replace(/[А-Яа-яЁё]/g, (c) => {
    const lo = c.toLowerCase();
    const t = LAT[lo] ?? c;
    return c === lo ? t : t.charAt(0).toUpperCase() + t.slice(1);
  }).replace(/(\d)kh(\d)/g, "$1x$2");
}
/* хвостовое слово-марка: «1У110-1», «АОК», но не «ЛЭП» и не «АНКЕРНО-УГЛОВАЯ» */
const ABBR = new Set(["ЛЭП", "ВЛ", "ЛЭП.", "ВЛ."]);
const isCodeTok = (t) =>
  !ABBR.has(t) &&
  (/\d/.test(t) || (!/[а-яёa-z]{2,}/.test(t) && t.replace(/[^А-ЯЁA-Z]/g, "").length <= 6));

/* марка или число внутри строки: есть цифра, нет слов из строчных букв */
const CODE_TOKEN = /(?<![\p{L}\d])(?=[^\s<>]*\d)(?![^\s<>]*[а-яёa-z]{2})[^\s<>()«»"]+?(?=[\s,;)»"]*(?:\s|$|<|\)))/gu;
const norm = (s) => s.replace(/\s+/g, " ").trim();

const missing = { kk: new Map(), en: new Map() };

/** Перевод одного фрагмента; без перевода — исходник, и он попадает в todo. */
function tr(src, lang) {
  if (src == null) return src;
  const key = norm(String(src));
  if (!key || !CYR.test(key)) return src;
  const hit = look(key, lang);
  if (hit != null) return hit;
  // «+7 700 370 07 04 вн 901» — добавочный номер
  if (/\sвн\s\d/.test(key)) return key.replace(/\sвн\s/g, lang === "en" ? " ext. " : " ішкі ");
  if (isCode(key)) return lang === "en" ? latin(key) : src;
  // «6 метров», «4 метра»
  const m = /^(\d+(?:[.,]\d+)?) метр(?:а|ов)?$/.exec(key);
  if (m) return lang === "en" ? `${m[1]} m` : `${m[1]} метр`;
  // «Высота опоры, м: 19,0 (H)» — переводится подпись, значение как есть
  const kv = /^([^:<]{3,90}:)\s*(.+)$/.exec(key);
  if (kv && isCode(kv[2])) return `${tr(kv[1], lang)} ${lang === "en" ? latin(kv[2]) : kv[2]}`;
  // «Анкерно-угловая опора 1У110-1+10» — слова переводятся, марка остаётся
  const tokens = key.split(" ");
  let cut = tokens.length;
  while (cut > 1 && isCodeTok(tokens[cut - 1].replace(/<[^>]+>/g, ""))) cut--;
  if (cut < tokens.length && cut > 0) {
    const head = tokens.slice(0, cut).join(" ");
    const tail = tokens.slice(cut).join(" ").replace(/(\d)\s?(?:гр|град)\.?(?=\s|$)/gu, "$1°");
    if (/[а-яё]{3,}/.test(head)) return `${tr(head, lang)} ${lang === "en" ? latin(tail) : tail}`;
  }
  // короткие строки, отличающиеся только марками и числами, переводятся
  // одним шаблоном: «Опора # анкерно-угловая» → «# анкерлік-бұрыштық тірегі»
  if (key.length < 260) {
    const vals = [];
    const tpl = key.replace(CODE_TOKEN, (m) => (vals.push(m), "#"));
    if (vals.length) {
      const t = look(tpl, lang);
      if (t != null) {
        let i = 0;
        return t.replace(/#/g, () => (lang === "en" ? latin(vals[i++] ?? "") : vals[i++] ?? ""));
      }
      if (lang === "kk" && KAZ.test(key)) return src;
      if (!key.endsWith("…")) {
        missing[lang].set(tpl, (missing[lang].get(tpl) || 0) + 1);
        return src;
      }
    }
  }
  // анонс — обрезанное начало полного текста: берём начало его перевода
  if (key.endsWith("…")) {
    const stem = key.slice(0, -1).trim();
    const full = sources.find((s) => plainKey(s).includes(stem) && plainKey(tr(s, lang)) !== plainKey(s));
    if (full) {
      const t = plainKey(tr(full, lang));
      const ru = plainKey(full);
      const a = Math.round(t.length * (ru.indexOf(stem) / ru.length));
      const b = Math.round(t.length * ((ru.indexOf(stem) + stem.length) / ru.length));
      const from = a ? t.indexOf(" ", a) + 1 : 0;
      return t.slice(from, b).replace(/\s+\S*$/, "").replace(/^\p{Ll}/u, (c) => c.toUpperCase()) + "…";
    }
    if (sources.some((s) => plainKey(s).includes(stem))) return src;
  }
  // казахский текст в русской версии оригинала для kk уже готов
  if (lang === "kk" && KAZ.test(key)) return src;
  missing[lang].set(key, (missing[lang].get(key) || 0) + 1);
  return src;
}

/* все полные фрагменты — по ним восстанавливаются анонсы с «…» */
const sources = [];
const plainKey = (s) => norm(s.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, ""));
async function collect() {
  for (const kind of ["p", "page"]) {
    const dir = path.join(PUB, kind);
    for (const f of await readdir(dir)) {
      const rec = await readJson(path.join(dir, f));
      for (const run of runs(rec.html.ru || "")) if (run.length > 30) sources.push(run);
    }
  }
}

const BLOCK = /^<\/?(p|div|li|ul|ol|h[1-6]|table|thead|tbody|tfoot|tr|td|th|blockquote|figure|figcaption|section|article|dl|dt|dd|hr|img|iframe|video|caption)\b/i;

/** Фрагменты HTML между блочными тегами — те же ключи, что у trHtml. */
function runs(html) {
  const out = [];
  let run = "";
  for (const p of html.split(/(<[^>]+>)/)) {
    if (p.startsWith("<") && BLOCK.test(p)) {
      if (CYR.test(run)) out.push(norm(run));
      run = "";
    } else run += p;
  }
  if (CYR.test(run)) out.push(norm(run));
  return out;
}

/** Перевести HTML по фрагментам между блочными тегами. */
function trHtml(html, lang) {
  if (!html || !CYR.test(html)) return html;
  const parts = html.split(/(<[^>]+>)/);
  let out = "";
  let run = [];
  const flush = () => {
    if (!run.length) return;
    const s = run.join("");
    run = [];
    const lead = s.match(/^\s*/)[0];
    const tail = s.match(/\s*$/)[0];
    const core = s.trim();
    out += core && CYR.test(core) ? lead + tr(core, lang) + tail : s;
  };
  for (const p of parts) {
    if (!p) continue;
    if (p.startsWith("<") && BLOCK.test(p)) {
      flush();
      out += p;
    } else run.push(p);
  }
  flush();
  return out;
}

const plain = (html) =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|h[1-6]|tr|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

const trTables = (tables, lang) => tables.map((t) => t.map((r) => r.map((c) => tr(c, lang))));

await collect();

/* ── полные записи: товары и страницы ─────────────────────────── */

for (const kind of ["p", "page"]) {
  const dir = path.join(PUB, kind);
  for (const f of await readdir(dir)) {
    const file = path.join(dir, f);
    const rec = await readJson(file);
    rec.i18n = {};
    for (const l of LANGS) {
      const html = trHtml(rec.html.ru, l);
      rec.html[l] = html;
      rec.body[l] = plain(html);
      if (rec.title?.ru) rec.title[l] = tr(rec.title.ru, l);
      const text = plain(html).replace(/\n/g, " ");
      rec.i18n[l] = {
        tables: trTables(rec.tables || [], l),
        // описание и лид в выгрузке — начало текста; в переводе — начало перевода
        description: rec.description ? text.slice(0, 300) : "",
        lead: rec.lead ? tr(rec.lead, l) === rec.lead ? plain(html).split("\n").find((x) => x.length > 40) || "" : tr(rec.lead, l) : "",
        docs: (rec.docs || []).map((d) => ({ ...d, text: tr(d.text, l) })),
        related: (rec.related || []).map((r) => ({ ...r, title: tr(r.title, l) })),
      };
    }
    if (!TODO) await writeFile(file, JSON.stringify(rec), "utf8");
  }
}

/* ── индексы в бандле ─────────────────────────────────────────── */

const products = await readJson(path.join(SRC, "products.json"));
for (const p of products)
  for (const l of LANGS) {
    p.t[l] = tr(p.t.ru, l);
    // первый абзац описания — анонс карточки и подзаголовок страницы
    if (p.d) (p.dl ??= {})[l] = tr(p.d, l);
  }

const pages = await readJson(path.join(SRC, "pages.json"));
for (const p of pages)
  for (const l of LANGS) {
    // свой перевод оригинала (несколько служебных страниц) остаётся
    if (!p.t[l] || p.t[l] === p.t.ru) p.t[l] = tr(p.t.ru, l);
    if (p.d) (p.dl ??= {})[l] = tr(p.d, l);
  }

const catalog = await readJson(path.join(SRC, "catalog.json"));
const nodes = [...catalog.tree, ...Object.values(catalog.categories)];
for (const c of nodes) for (const l of LANGS) if (c.title?.ru) c.title[l] = tr(c.title.ru, l);

/*
 * Ленты новостей и партнёров: в kk/en оригинала — заглушки вида
 * «Новость пять eng», «Казтрансоил - англ». Берём русскую ленту целиком
 * и переводим заголовки и анонсы.
 */
const views = await readJson(path.join(SRC, "views.json"));
for (const l of LANGS) {
  views[l] = Object.fromEntries(
    Object.entries(views.ru).map(([k, list]) => [
      k,
      list.map((it) => ({ ...it, title: tr(it.title, l), lead: tr(it.lead, l) })),
    ])
  );
}

/*
 * Слайдер главной: в казахской версии оригинала он остался по-русски
 * («Качество - основа доверия к нам»). Строки, совпадающие с русскими,
 * переводятся.
 */
const site = await readJson(path.join(SRC, "site.json"));
const unkz = (line) => norm(line).replace(/\s+kz$/i, "");
const NL = String.fromCharCode(10);
const ruLines = new Set((site.home.ru?.["w-slider"]?.text || "").split(NL).map(unkz));
for (const l of LANGS) {
  const block = site.home[l]?.["w-slider"];
  if (!block?.text) continue;
  block.text = block.text
    .split(NL)
    .map((line) => (ruLines.has(unkz(line)) && CYR.test(line) ? tr(unkz(line), l) : line))
    .join(NL)
    // опечатка английского слайдера оригинала
    .replace(/Energy Sestems/g, "Energy Systems");
}

if (!TODO) {
  await writeFile(path.join(SRC, "site.json"), JSON.stringify(site, null, 1), "utf8");
  await writeFile(path.join(SRC, "products.json"), JSON.stringify(products), "utf8");
  await writeFile(path.join(SRC, "pages.json"), JSON.stringify(pages), "utf8");
  await writeFile(path.join(SRC, "catalog.json"), JSON.stringify(catalog, null, 1), "utf8");
  await writeFile(path.join(SRC, "views.json"), JSON.stringify(views), "utf8");
}

for (const l of LANGS) {
  const chars = [...missing[l].keys()].reduce((n, x) => n + x.length, 0);
  console.log(`${l}: без перевода ${missing[l].size} фрагм., ${chars} симв.`);
}
if (TODO) {
  const all = [...new Set([...missing.kk.keys(), ...missing.en.keys()])];
  await writeFile(path.join(DICT, "todo.txt"), all.map((k) => `${idOf(k)}\t${k}`).join("\n"), "utf8");
}
