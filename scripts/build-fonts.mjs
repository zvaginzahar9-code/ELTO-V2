#!/usr/bin/env node
/**
 * Свои шрифты вместо Google Fonts.
 *
 * Ссылка на fonts.googleapis.com блокирует первую отрисовку и тянет за собой
 * вторую: сначала CSS с одного чужого домена, потом woff2 с другого. На
 * телефоне это соединение, TLS и два круга по сети до того, как на экране
 * появится хоть что-то. Те же файлы, отданные со своего домена и объявленные
 * в бандле, стоят одного круга — и он идёт параллельно со всем остальным.
 *
 * Скрипт забирает у Google ровно те подмножества, которые нужны сайту
 * (латиница и кириллица, включая казахские буквы из cyrillic-ext), кладёт
 * woff2 в public/fonts и пишет src/styles/fonts.css с локальными адресами.
 * Начертания остаются гугловскими: это те же файлы, никакой пересборки.
 *
 *   node scripts/build-fonts.mjs
 */

import { mkdir, writeFile, readdir, unlink } from "node:fs/promises";
import path from "node:path";

const HERE = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(HERE, "public/fonts");
const CSS_OUT = path.join(HERE, "src/styles/fonts.css");

/** Подмножества, которые сайту нужны. Казахские ә, ғ, қ, ң, ө, ұ, ү, һ живут в cyrillic-ext. */
const SUBSETS = new Set(["latin", "latin-ext", "cyrillic", "cyrillic-ext"]);

/** Гарнитура интерфейса и моноширинная для данных. */
const QUERY =
  "family=Onest:wght@300..800&family=JetBrains+Mono:wght@400;500;600" +
  // телефон: Fira Sans для текста и узкая Fira Sans Condensed для заголовков
  "&family=Fira+Sans:wght@400;500&family=Fira+Sans+Condensed:wght@600" +
  // акцентное слово в заголовках главной — курсивная антиква
  "&family=Cormorant:ital,wght@1,500&display=swap";

/* без современного user-agent Google отдаёт ttf вместо woff2 */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const css = await fetch(`https://fonts.googleapis.com/css2?${QUERY}`, {
  headers: { "User-Agent": UA },
}).then((r) => {
  if (!r.ok) throw new Error(`Google Fonts ответил ${r.status}`);
  return r.text();
});

/* CSS приходит блоками «/* subset *\/ @font-face { … }» — разбираем по ним */
const blocks = [];
const re = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]+\})/g;
let m;
while ((m = re.exec(css))) blocks.push({ subset: m[1], rule: m[2] });

const wanted = blocks.filter((b) => SUBSETS.has(b.subset));
if (!wanted.length) throw new Error("не найдено ни одного нужного подмножества");

await mkdir(OUT_DIR, { recursive: true });
for (const f of await readdir(OUT_DIR).catch(() => [])) {
  if (f.endsWith(".woff2")) await unlink(path.join(OUT_DIR, f));
}

/** Переменный шрифт отдаётся одним файлом на подмножество — качаем по разу. */
const files = new Map();
const nameOf = (rule, subset) => {
  const family = /font-family:\s*'([^']+)'/
    .exec(rule)[1]
    .toLowerCase()
    .replace(/\s+/g, "-");
  // у статичных начертаний свой файл на каждый вес, у переменных — один на все
  const weight = /font-weight:\s*([^;]+);/.exec(rule)[1].trim();
  const suffix = /\s/.test(weight) ? "" : `-${weight}`;
  return `${family}${suffix}-${subset}.woff2`;
};

const out = [
  "/* ──────────────────────────────────────────────────────────────",
  "   ELTO — шрифты",
  "",
  "   Файл собран scripts/build-fonts.mjs: те же woff2, что отдаёт",
  "   Google Fonts, но со своего домена. Руками не правится.",
  "   ────────────────────────────────────────────────────────────── */",
  "",
];

for (const { subset, rule } of wanted) {
  const url = /url\((https:\/\/[^)]+\.woff2)\)/.exec(rule)?.[1];
  if (!url) continue;
  const file = nameOf(rule, subset);

  if (!files.has(url)) {
    const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
    await writeFile(path.join(OUT_DIR, file), buf);
    files.set(url, { file, size: buf.length });
  }

  out.push(
    rule
      .replace(/url\(https:\/\/[^)]+\.woff2\)/, `url(/fonts/${files.get(url).file})`)
      .trim(),
    ""
  );
}

await writeFile(CSS_OUT, out.join("\n"), "utf8");

console.log(`подмножеств: ${SUBSETS.size}, правил @font-face: ${wanted.length}`);
for (const { file, size } of files.values())
  console.log(`  ${(size / 1024).toFixed(1).padStart(6)} КБ  ${file}`);
console.log(
  `\nвсего ${([...files.values()].reduce((s, f) => s + f.size, 0) / 1024).toFixed(1)} КБ в public/fonts`
);
console.log(`правила записаны в src/styles/fonts.css`);
