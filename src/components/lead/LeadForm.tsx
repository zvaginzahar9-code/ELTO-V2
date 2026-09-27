/**
 * Форма заявки.
 *
 * Четыре поля и файл — больше B2B-клиенту на первом шаге не нужно: кто он,
 * откуда, как ответить и что нужно. Тема (изделие или раздел) подставляется
 * сама, если форму открыли из карточки.
 *
 * Отправка идёт в /api/lead. Если серверная функция недоступна или ещё не
 * настроена, заявка не теряется: форма собирает тот же текст и предлагает
 * отправить его письмом или в WhatsApp.
 */

import { useId, useRef, useState, type FormEvent } from "react";
import { t, type Lang } from "@/lib/i18n";
import { mailtoHref, whatsappHref, PHONE, PHONE_HREF, EMAIL } from "@/lib/contacts";
import {
  FILE_ACCEPT,
  FILE_EXT,
  MAX_FILE,
  isContact,
  leadText,
  type LeadFields,
  type LeadMode,
} from "./rules";

type Status = "idle" | "sending" | "sent" | "fallback";
type Errors = Partial<Record<"name" | "contact" | "file" | "form", string>>;

type Props = {
  lang: Lang;
  mode: LeadMode;
  topic?: string;
  /** на тёмном грунте поля светлые по буквам */
  tone?: "paper" | "night";
  /** строка с телефоном и почтой под формой — там, где контактов рядом нет */
  direct?: boolean;
  onDone?: () => void;
};

export default function LeadForm({
  lang,
  mode,
  topic = "",
  tone = "paper",
  direct = true,
  onDone,
}: Props) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<LeadFields | null>(null);

  const pickFile = (f: File | null) => {
    setErrors((e) => ({ ...e, file: undefined }));
    if (!f) return setFile(null);
    if (f.size > MAX_FILE)
      return setErrors((e) => ({ ...e, file: t("lead.err.file.size", lang) }));
    if (!FILE_EXT.test(f.name))
      return setErrors((e) => ({ ...e, file: t("lead.err.file.type", lang) }));
    setFile(f);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const fields: LeadFields = {
      name: String(data.get("name") || "").trim(),
      company: String(data.get("company") || "").trim(),
      contact: String(data.get("contact") || "").trim(),
      message: String(data.get("message") || "").trim(),
      topic,
    };

    const next: Errors = {};
    if (fields.name.length < 2) next.name = t("lead.err.name", lang);
    if (!isContact(fields.contact)) next.contact = t("lead.err.contact", lang);
    setErrors(next);
    if (next.name || next.contact) {
      // состояние ещё не отрисовано — фокус ставим по имени поля, а не по aria-invalid
      const bad = form.elements.namedItem(next.name ? "name" : "contact");
      if (bad instanceof HTMLElement) bad.focus();
      return;
    }

    data.set("topic", topic);
    if (file) data.set("file", file);
    else data.delete("file");

    setStatus("sending");
    setDraft(fields);

    try {
      const res = await fetch("/api/lead", { method: "POST", body: data });
      // успех — только явный ответ функции: статический хостинг без неё
      // может ответить 200 страницей index.html
      const body = res.ok
        ? ((await res.json().catch(() => null)) as { ok?: boolean } | null)
        : null;
      if (body?.ok) {
        setStatus("sent");
        form.reset();
        setFile(null);
        return;
      }
      if (res.status === 429) {
        setErrors({ form: t("lead.err.rate", lang) });
        setStatus("idle");
        return;
      }
      if (res.status === 422) {
        const detail = (await res.json().catch(() => ({}))) as {
          fields?: Record<string, string>;
        };
        const f = detail.fields || {};
        setErrors({
          name: f.name && t("lead.err.name", lang),
          contact: f.contact && t("lead.err.contact", lang),
          file:
            f.file &&
            t(f.file === "size" ? "lead.err.file.size" : "lead.err.file.type", lang),
        });
        setStatus("idle");
        return;
      }
      setStatus("fallback");
    } catch {
      setStatus("fallback");
    }
  };

  if (status === "sent") {
    return (
      <div className={`lead lead--${tone} lead--done`} role="status">
        <p className="lead__done-mark" aria-hidden="true" />
        <h3 className="lead__done-h title">{t("lead.done.title", lang)}</h3>
        <p className="lead__done-p">{t("lead.done.text", lang)}</p>
        <div className="lead__row">
          {onDone && (
            <button type="button" className="btn btn--solid" onClick={onDone}>
              {t("lead.close", lang)}
            </button>
          )}
          <button type="button" className="btn" onClick={() => setStatus("idle")}>
            {t("lead.again", lang)}
          </button>
        </div>
      </div>
    );
  }

  if (status === "fallback" && draft) {
    const text = leadText(draft, file?.name);
    const subject = `Заявка с сайта: ${draft.topic || draft.name}`;
    return (
      <div className={`lead lead--${tone} lead--fallback`} role="status">
        <h3 className="lead__done-h title">{t("lead.fallback.title", lang)}</h3>
        <p className="lead__done-p">{t("lead.fallback.text", lang)}</p>
        <pre className="lead__preview mono">{text}</pre>
        <div className="lead__row">
          <a className="btn btn--solid" href={mailtoHref(subject, text)}>
            {t("lead.fallback.mail", lang)} · {EMAIL}
          </a>
          <a
            className="btn"
            href={whatsappHref(text)}
            target="_blank"
            rel="noreferrer noopener"
          >
            WhatsApp
          </a>
          <button type="button" className="link-arrow" onClick={() => setStatus("idle")}>
            <span>{t("common.back", lang)}</span>
          </button>
        </div>
      </div>
    );
  }

  const err = (key: keyof Errors) =>
    errors[key] ? (
      <span className="lead__err" id={`${id}-${key}-err`}>
        {errors[key]}
      </span>
    ) : null;

  return (
    <form
      ref={formRef}
      className={`lead lead--${tone}`}
      onSubmit={onSubmit}
      noValidate
      aria-busy={status === "sending"}
    >
      {topic && (
        <p className="lead__topic">
          <span className="lead__label">{t("lead.topic", lang)}</span>
          {topic}
        </p>
      )}
      <div className="lead__grid">
        <label className="lead__field">
          <span className="lead__label">{t("lead.name", lang)}</span>
          <input
            name="name"
            autoComplete="name"
            maxLength={80}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${id}-name-err` : undefined}
          />
          {err("name")}
        </label>

        <label className="lead__field">
          <span className="lead__label">
            {t("lead.company", lang)} <i>· {t("lead.optional", lang)}</i>
          </span>
          <input name="company" autoComplete="organization" maxLength={120} />
        </label>

        <label className="lead__field lead__field--wide">
          <span className="lead__label">{t("lead.contact", lang)}</span>
          <input
            name="contact"
            autoComplete="tel"
            inputMode="text"
            maxLength={120}
            aria-invalid={errors.contact ? true : undefined}
            aria-describedby={errors.contact ? `${id}-contact-err` : undefined}
          />
          {err("contact")}
        </label>

        <label className="lead__field lead__field--wide">
          <span className="lead__label">{t("lead.message", lang)}</span>
          <textarea
            name="message"
            rows={mode === "consult" ? 4 : 3}
            maxLength={3000}
            placeholder={t("lead.message.ph", lang)}
          />
        </label>

        {/* поле-приманка для роботов: человек его не видит */}
        <label className="lead__trap" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>

        <div className="lead__field lead__field--wide">
          <label className={"lead__file" + (file ? " has-file" : "")}>
            <input
              type="file"
              name="file"
              accept={FILE_ACCEPT}
              onChange={(e) => pickFile(e.currentTarget.files?.[0] ?? null)}
              aria-describedby={`${id}-file-hint${errors.file ? ` ${id}-file-err` : ""}`}
            />
            <span className="lead__file-icon" aria-hidden="true">
              +
            </span>
            <span className="lead__file-text">
              <b>{file ? file.name : t("lead.file", lang)}</b>
              <small id={`${id}-file-hint`}>
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} МБ`
                  : t("lead.file.hint", lang)}
              </small>
            </span>
          </label>
          {file && (
            <button
              type="button"
              className="lead__file-x"
              onClick={() => {
                setFile(null);
                const input =
                  formRef.current?.querySelector<HTMLInputElement>('input[type="file"]');
                if (input) input.value = "";
              }}
            >
              {t("lead.file.remove", lang)}
            </button>
          )}
          {err("file")}
        </div>
      </div>

      {errors.form && (
        <p className="lead__err lead__err--form" role="alert">
          {errors.form}
        </p>
      )}

      <div className="lead__foot">
        <button
          type="submit"
          className="btn btn--solid lead__send"
          disabled={status === "sending"}
        >
          {status === "sending" ? t("lead.sending", lang) : t("lead.send", lang)}
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
        <p className="lead__consent">{t("lead.consent", lang)}</p>
      </div>

      {direct && (
        <p className="lead__direct">
          <span>{t("lead.direct", lang)}:</span>
          <a href={PHONE_HREF} className="mono">
            {PHONE}
          </a>
          <a href={whatsappHref()} target="_blank" rel="noreferrer noopener">
            WhatsApp
          </a>
          <a href={`mailto:${EMAIL}`} className="mono">
            {EMAIL}
          </a>
        </p>
      )}
    </form>
  );
}
