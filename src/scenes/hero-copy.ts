/**
 * Текст первого экрана.
 *
 * Им пользуются двое: сцена героя и сборка — она кладёт тот же заголовок,
 * те же кнопки и те же входы в разделы прямо в HTML главной (vite.config.ts),
 * чтобы первый экран был виден до загрузки скриптов. Поэтому здесь нет
 * ничего от React и браузера.
 */

import { t, type Lang } from "../lib/i18n";

/** Описание главной — формулировки со страницы «О нас» оригинала. */
export const HOME_DESCRIPTION: Record<Lang, string> = {
  ru: "ТОО «Энергосистемы ЭЛТО» является заводом производителем опор освещения, мачт и металлоконструкций различного назначения. Наше собственное производство находится в Казахстане в городе Караганда.",
  kk: "«Энергосистемы ЭЛТО» ЖШС — жарық тіректерін, мачталарды және металл конструкцияларды өндіруші зауыт. Қарағандыдағы өз өндірісі.",
  en: "ELTO Energy Systems LLP is a manufacturer of lighting poles, masts and steel structures for various purposes. Our own production facility is in Karaganda, Kazakhstan.",
};

/**
 * Заголовок режется на строки заранее: каждая строка едет из собственной
 * маски, и перенос внутри маски обрезал бы всё ниже первой строки.
 */
export function breakLines(text: string, perLine: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${w}` : w;
    if (line && next.length > perLine) {
      out.push(line);
      line = w;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

/** Заголовок — крупно, строками; два последних слова — акцентной строкой. */
export function heroTitle(lang: Lang) {
  const full = t("hero.h1", lang);
  // два последних слова формулировки оригинала — акцентной строкой
  const words = full.split(" ");
  const what = words.slice(0, -2).join(" ");
  const where = words.slice(-2).join(" ");
  return { full, lines: breakLines(what, 22), where };
}

/**
 * Первый кадр телефона — цех горячего цинкования на заводе ELTO. Отдельная
 * нарезка 4:5 под кадр героя: общая картинка в 1600 px весила вчетверо больше.
 */
export const PHONE_HERO_AVIF = "/media/phone/hero-720.avif 720w, /media/phone/hero-1080.avif 1080w";
export const PHONE_HERO_WEBP = "/media/phone/hero-720.webp 720w, /media/phone/hero-1080.webp 1080w";
export const PHONE_HERO_SRC = "/media/phone/hero-720.webp";
export const PHONE_HERO_ALT = "alt.zincShop";
export const PHONE_HERO_CAPTION = "caption.zincShop";
