/**
 * Правила формы заявки. Те же ограничения проверяет api/lead.ts —
 * меняются вместе.
 */

export type LeadMode = "quote" | "tz" | "consult";

export const MAX_FILE = 4 * 1024 * 1024;
export const FILE_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.jpg,.jpeg,.png,.zip";
export const FILE_EXT = /\.(pdf|docx?|xlsx?|dwg|dxf|jpe?g|png|zip)$/i;

export const isContact = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || v.replace(/\D/g, "").length >= 10;

export type LeadFields = {
  name: string;
  company: string;
  contact: string;
  message: string;
  topic: string;
};

/** Текст заявки для письма или WhatsApp, когда онлайн-отправка недоступна. */
export function leadText(f: LeadFields, fileName?: string) {
  const head = [
    f.topic && `Тема: ${f.topic}`,
    `Имя: ${f.name}`,
    f.company && `Компания: ${f.company}`,
    `Контакт: ${f.contact}`,
    fileName && `Файл ТЗ: ${fileName} (приложу к письму)`,
  ].filter(Boolean);
  return f.message ? `${head.join("\n")}\n\n${f.message}` : head.join("\n");
}
