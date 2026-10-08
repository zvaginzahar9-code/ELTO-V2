/**
 * Контакты компании — в одном месте.
 *
 * Все значения — с действующего elto.kz: шапка, подвал и страница
 * «Контакты». Раньше номера были переписаны в каждом компоненте отдельно.
 */

export const PHONE = "+7 700 370 07 04";
export const PHONE_HREF = "tel:+77003700704";

/** Второй номер со страницы «Контакты». */
export const PHONE_2 = "+7 705 759 00 30";
export const PHONE_2_HREF = "tel:+77057590030";

export const EMAIL = "sales@elto.kz";

export const INSTAGRAM = "https://www.instagram.com/energosistemy_elto/";

/** WhatsApp отдела продаж — тот же номер, что в шапке оригинала. */
export function whatsappHref(text?: string) {
  const base = "https://api.whatsapp.com/send?phone=77003700704";
  return text ? `${base}&text=${encodeURIComponent(text)}` : base;
}

export function mailtoHref(subject: string, body = "") {
  const q = new URLSearchParams({ subject, body }).toString().replace(/\+/g, "%20");
  return `mailto:${EMAIL}?${q}`;
}

/** PDF-каталоги, которые лежат на оригинале; подпись — ключ словаря doc.<key>. */
export const CATALOG_DOCS = [
  { key: "poles", href: "/docs/katalog_opor_elto.pdf" },
  { key: "lep", href: "/docs/katalog_novyy_do_330kvpdf.pdf" },
] as const;

/** Разделы, к которым относится PDF-каталог опор освещения. */
const POLE_SECTIONS = new Set([
  "opory-osveshcheniya-granyonye",
  "machty-osveshcheniya-pmo-vmo",
  "opory-trubchatye",
  "kronshteyny-opor-osveshcheniya",
  "zakladnye-detali-fundamenta",
  "opory-dekorativnogo-osveshcheniya",
  "svetofornye-opory",
]);

/**
 * PDF-каталог, который относится к изделию или разделу: опоры ЛЭП —
 * к каталогу ЛЭП, опоры и мачты освещения — к каталогу опор. Для остальных
 * разделов на оригинале PDF нет, и ссылка не показывается.
 */
export function catalogDocFor(
  categorySlugs: string[],
  parentOf: (s: string) => string | null | undefined
) {
  const roots = categorySlugs.map((s) => parentOf(s) || s);
  if (roots.some((s) => s === "opora-lep" || s === "mnogogrannye-opory-lep"))
    return CATALOG_DOCS[1];
  if (roots.some((s) => POLE_SECTIONS.has(s))) return CATALOG_DOCS[0];
  return null;
}
