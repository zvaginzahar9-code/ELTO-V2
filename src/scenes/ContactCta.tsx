/**
 * СЦЕНА 09 — ЗАЯВКА
 *
 * Последний кадр отдаётся тому, ради чего человек листал. Поток собирается
 * в один яркий луч, который входит справа и уходит за карточку с формой,
 * а знак ELTO — курьер, проделавший весь путь от героя через плиту
 * слогана, — садится в финальную строку. Заголовок крупный, на всю ширину: форма расчёта
 * стоит прямо на странице, без перехода и без поиска кнопки.
 */

import { useRef } from "react";
import LeadForm from "@/components/lead/LeadForm";
import Title from "@/components/motion/Title";
import { useDock, useFlowStop } from "@/motion/use-flow";
import { finaleFlow } from "./flow-shapes";
import { t, type Lang } from "@/lib/i18n";
import { EMAIL, PHONE, PHONE_HREF, whatsappHref } from "@/lib/contacts";

export default function ContactCta({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const dock = useRef<HTMLSpanElement>(null);
  useFlowStop(root, finaleFlow);
  useDock(dock, "final");

  return (
    <section id="contact" ref={root} className="scene fin" data-ground="paper">
      <div className="shell fin__inner">
        <div className="fin__head">
          <Title className="fin__title" text={t("home.final", lang)} />
          <span className="fin__dock" ref={dock} aria-hidden="true" />
        </div>

        <div className="fin__grid">
          <div className="fin__side">
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
                    {t("address.1", lang)}
                    <br />
                    {t("address.2", lang)}
                  </address>
                </dd>
              </div>
            </dl>
          </div>

          <div className="fin__card bezel">
            <div className="bezel__core fin__core">
              <LeadForm lang={lang} mode="quote" tone="paper" direct={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
