/**
 * Разбор текста оригинала в editorial-иерархию.
 *
 * На elto.kz всё тело новости — это два-три <p>, внутри которых строки
 * разделены <br>: перечень продукции, подпись, вводный вопрос. В вёрстке
 * оригинала они выглядят одинаковой серой массой, и «в ассортименте» ничем
 * не отличается от пункта перечня.
 *
 * Здесь ни одно слово не меняется — меняется только разметка: строка,
 * кончающаяся двоеточием, становится подзаголовком, подряд идущие короткие
 * строки с точкой с запятой — списком. Всё, что не опознано, остаётся
 * обычным абзацем: текст завода важнее красивой догадки.
 *
 * Отдельно отсюда убираются картинки: на странице они показываются через
 * свой конвейер (webp/avif, три ширины), а не ссылкой на elto.kz.
 */

/** Разделитель строк внутри абзаца оригинала. */
const BR = /<br\s*\/?>/gi;
/** Картинка, завёрнутая в лайтбокс друпала. */
const IMG_LINK = /<a\b[^>]*class="[^"]*colorbox[^"]*"[^>]*>[\s\S]*?<\/a>/gi;
const IMG = /<img\b[^>]*>/gi;
const P = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;

/** Пункт перечня: короткая строка, кончающаяся точкой с запятой или запятой. */
const ITEM = /[;,]$/;
const TAIL = /\.$/;
const SUB = /:$/;

const MAX_ITEM = 140;
const MAX_SUB = 80;

const text = (html: string) => html.replace(/<[^>]+>/g, "").trim();

/** Абзац оригинала → один или несколько блоков с разной ролью. */
function paragraph(inner: string): string {
  const parts = inner
    .split(BR)
    .map((s) => s.trim())
    .filter((s) => text(s).length);

  if (parts.length < 2) return `<p>${inner}</p>`;

  const out: string[] = [];
  let list: string[] = [];

  const flush = () => {
    // один «пункт» списком не бывает — это просто строка
    if (list.length >= 2) out.push(`<ul>${list.map((i) => `<li>${i}</li>`).join("")}</ul>`);
    else if (list.length) out.push(`<p>${list[0]}</p>`);
    list = [];
  };

  for (const part of parts) {
    const t = text(part);
    const short = t.length <= MAX_ITEM;

    if (short && ITEM.test(t)) {
      list.push(part);
      continue;
    }
    // «…; …; ….» — последний пункт перечня кончается точкой
    if (list.length >= 2 && short && TAIL.test(t)) {
      list.push(part);
      flush();
      continue;
    }

    flush();
    if (SUB.test(t) && t.length <= MAX_SUB) out.push(`<p class="prose__sub">${part}</p>`);
    else out.push(`<p>${part}</p>`);
  }
  flush();

  return out.join("");
}

/** Перебрать абзацы, оставив всё прочее (таблицы, заголовки, видео) как есть. */
function blocks(html: string): string {
  const out: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  P.lastIndex = 0;
  while ((m = P.exec(html))) {
    if (m.index > last) out.push(html.slice(last, m.index));
    out.push(paragraph(m[1]));
    last = m.index + m[0].length;
  }
  if (last < html.length) out.push(html.slice(last));
  return out.join("");
}

/*
 * У части новостей дата публикации лежит голым текстом перед первым абзацем
 * — «13 июля 2019», «11.11.2022». Своего поля под неё в выгрузке нет, и
 * выдумывать дату там, где её не было, нельзя: показываем ровно у тех
 * материалов, где она есть, и ровно в том виде, как написано на оригинале.
 */
const DATE =
  /^\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{1,2}\s+[^\s<]{3,12}\s+\d{4})(\s*(г\.|ж\.|года))?\s*$/i;

export type Article = {
  /** дата публикации, если оригинал её указывал */
  date: string;
  /** первый абзац — он же врезка в шапке */
  lead: string;
  /** остальное тело */
  body: string;
};

/**
 * Готовит статью: убирает картинки, размечает иерархию и отделяет первый
 * абзац во врезку. Если кроме него ничего нет, врезку не делаем — материал
 * из одной фразы не должен остаться с пустым телом.
 */
export function article(html: string): Article {
  let clean = blocks(html.replace(IMG_LINK, "").replace(IMG, ""));

  let date = "";
  const head = /^([^<]+)(?=<)/.exec(clean);
  if (head && DATE.test(head[1])) {
    date = head[1].trim();
    clean = clean.slice(head[0].length);
  }

  const first = /^\s*<p>([\s\S]*?)<\/p>/.exec(clean);
  if (!first) return { date, lead: "", body: clean };

  const rest = clean.slice(first[0].length).trim();
  if (!text(rest).length) return { date, lead: "", body: clean };

  return { date, lead: first[1], body: rest };
}
