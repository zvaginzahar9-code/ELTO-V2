/**
 * Заявка с сайта → письмо в отдел продаж.
 *
 * Серверная функция Vercel. Принимает multipart-форму (имя, компания,
 * контакт, сообщение, необязательный файл ТЗ), проверяет её и отправляет
 * письмо через Resend API. Ключи живут только в переменных окружения:
 *
 *   RESEND_API_KEY   ключ Resend
 *   LEAD_FROM        проверенный отправитель, например "ELTO <site@elto.kz>"
 *   LEAD_TO          получатель, по умолчанию sales@elto.kz
 *
 * Пока ключ не задан, функция отвечает 503 — форма на сайте тогда предлагает
 * отправить ту же заявку почтой или в WhatsApp, заявка не теряется.
 *
 * Ограничения совпадают с src/components/lead/rules.ts.
 */

const MAX_FILE = 4 * 1024 * 1024;
const FILE_EXT = /\.(pdf|docx?|xlsx?|dwg|dxf|jpe?g|png|zip)$/i;
const LIMITS = { name: 80, company: 120, contact: 120, message: 3000, topic: 200 };

/* ограничение частоты: best-effort в пределах одного экземпляра функции */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const field = (form: FormData, key: keyof typeof LIMITS) => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim().slice(0, LIMITS[key]) : "";
};

const isContact = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || v.replace(/\D/g, "").length >= 10;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host)
    return json(403, { error: "origin" });

  const ip =
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return json(429, { error: "rate" });

  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_FILE + 64 * 1024) return json(413, { error: "file_size" });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { error: "form" });
  }

  // поле-приманка: человек его не видит и не заполняет
  const trap = form.get("website");
  if (typeof trap === "string" && trap !== "") return json(200, { ok: true });

  const name = field(form, "name");
  const company = field(form, "company");
  const contact = field(form, "contact");
  const message = field(form, "message");
  const topic = field(form, "topic");

  // согласие субъекта — условие сбора (ст. 7, 8 Закона РК «О персональных
  // данных и их защите»); форма присылает редакцию политики, которую приняли
  const consent = form.get("consent");
  const policy =
    typeof consent === "string" && /^\d{4}-\d{2}-\d{2}$/.test(consent) ? consent : "";

  const errors: Record<string, string> = {};
  if (!policy) errors.consent = "required";
  if (name.length < 2) errors.name = "required";
  if (!isContact(contact)) errors.contact = "invalid";

  const file = form.get("file");
  let attachment: { filename: string; content: string } | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE) errors.file = "size";
    else if (!FILE_EXT.test(file.name)) errors.file = "type";
    else {
      const buf = Buffer.from(await file.arrayBuffer());
      attachment = {
        filename: file.name.replace(/[^\p{L}\p{N}._ -]/gu, "_"),
        content: buf.toString("base64"),
      };
    }
  }
  if (Object.keys(errors).length)
    return json(422, { error: "validation", fields: errors });

  const key = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_FROM;
  if (!key || !from) return json(503, { error: "not_configured" });

  const head = [
    topic && `Тема: ${topic}`,
    `Имя: ${name}`,
    company && `Должность: ${company}`,
    `Контакт: ${contact}`,
    attachment && `Вложение: ${attachment.filename}`,
  ].filter(Boolean);
  // подтверждение получения согласия (подп. 5 п. 2 ст. 25 Закона) — в самой заявке
  const proof =
    `Согласие на сбор и обработку персональных данных, включая трансграничную ` +
    `передачу: дано в форме на сайте ${new Date().toISOString()} (UTC), ` +
    `редакция политики ${policy}.`;
  const text = `${head.join("\n")}\n\n${message || "(без сообщения)"}\n\n${proof}`;

  const email = contact.includes("@") ? contact : undefined;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: [process.env.LEAD_TO || "sales@elto.kz"],
      subject: `Заявка с сайта: ${topic || name}`.slice(0, 180),
      text,
      ...(email ? { reply_to: email } : {}),
      ...(attachment ? { attachments: [attachment] } : {}),
    }),
  }).catch(() => null);

  if (!res || !res.ok) return json(502, { error: "delivery" });
  return json(200, { ok: true });
}
