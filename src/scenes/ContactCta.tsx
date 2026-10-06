/**
 * СЦЕНА 09 — ЗАЯВКА
 *
 * Последний кадр отдаётся тому, ради чего человек листал: форма расчёта
 * прямо на странице, на светлой карточке посреди ночи. Аргоновая дуга
 * в последний раз проходит через кадр и обнимает карточку — страница
 * заканчивается тем же светом, с которого началась. Рядом — телефон,
 * почта, WhatsApp и адрес с оригинала.
 */

import { useRef } from "react";
import LeadForm from "@/components/lead/LeadForm";
import { useArcStop } from "@/motion/use-arc";
import { finaleArc } from "./arc-shapes";
import { t, type Lang } from "@/lib/i18n";
import { ADDRESS_LINES, EMAIL, PHONE, PHONE_HREF, whatsappHref } from "@/lib/contacts";

/** «Расчёт под | ваш объект»: последние два слова — курсивом. */
function splitFinal(s: string) {
  const words = s.split(" ");
  if (words.length < 3) return { head: s, tail: "" };
  return { head: words.slice(0, -2).join(" "), tail: words.slice(-2).join(" ") };
}

export default function ContactCta({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  useArcStop(root, finaleArc);
  const title = splitFinal(t("home.final", lang));

  return (
    <section id="contact" ref={root} className="scene fin" data-ground="dark">
      <div className="shell fin__inner">
        <div className="fin__intro">
          <p className="fin__kicker">{t("cta.quote", lang)}</p>
          <h2 className="fin__title">
            {title.head} {title.tail && <em>{title.tail}</em>}
          </h2>
          <p className="fin__lead">{t("home.final.lead", lang)}</p>

          <dl className="fin__contacts">
            <div>
              <dt>{t("contacts.phone", lang)}</dt>
              <dd>
                <a href={PHONE_HREF}>{PHONE}</a>
              </dd>
            </div>
            <div>
              <dt>{t("contacts.email", lang)}</dt>
              <dd>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>
                <a href={whatsappHref()} target="_blank" rel="noreferrer noopener">
                  {PHONE}
                </a>
              </dd>
            </div>
            <div>
              <dt>{t("contacts.address", lang)}</dt>
              <dd>
                <address>
                  {ADDRESS_LINES[0]}
                  <br />
                  {ADDRESS_LINES[1]}
                </address>
              </dd>
            </div>
          </dl>
        </div>

        <div className="fin__card">
          <LeadForm lang={lang} mode="quote" tone="paper" direct={false} />
        </div>
      </div>
    </section>
  );
}
