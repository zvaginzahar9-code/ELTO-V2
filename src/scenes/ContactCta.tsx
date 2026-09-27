/**
 * СЦЕНА 08 — ЗАЯВКА
 *
 * Последний кадр отдаётся тому, ради чего человек листал: форма расчёта
 * прямо на странице, без перехода и без поиска кнопки. Рядом — телефон,
 * почта, WhatsApp и адрес с оригинала. Над формой горит тот же натриевый
 * свет, что встречал в герое: страница заканчивается там, где началась.
 */

import Reveal from "@/components/motion/Reveal";
import LeadForm from "@/components/lead/LeadForm";
import { t, type Lang } from "@/lib/i18n";
import { ADDRESS_LINES, EMAIL, PHONE, PHONE_HREF, whatsappHref } from "@/lib/contacts";

export default function ContactCta({ lang }: { lang: Lang }) {
  return (
    <section id="contact" className="scene cta" data-ground="dark">
      <div className="cta__glow" aria-hidden="true" />
      <div className="shell cta__inner">
        <div className="cta__intro">
          <span className="index">08 — {t("cta.quote", lang)}</span>
          <Reveal as="h2" className="cta__title display display--tight" kind="lines">
            {t("home.final", lang)}
          </Reveal>
          <p className="cta__lead lead">{t("home.final.lead", lang)}</p>

          <dl className="cta__contacts">
            <div>
              <dt className="label">{t("contacts.phone", lang)}</dt>
              <dd>
                <a className="cta__big mono" href={PHONE_HREF}>
                  {PHONE}
                </a>
              </dd>
            </div>
            <div>
              <dt className="label">{t("contacts.email", lang)}</dt>
              <dd>
                <a className="cta__big mono" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
              </dd>
            </div>
            <div>
              <dt className="label">WhatsApp</dt>
              <dd>
                <a
                  className="cta__big mono"
                  href={whatsappHref()}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {PHONE}
                </a>
              </dd>
            </div>
            <div>
              <dt className="label">{t("contacts.address", lang)}</dt>
              <dd>
                <address className="cta__address">
                  {ADDRESS_LINES[0]}
                  <br />
                  {ADDRESS_LINES[1]}
                </address>
              </dd>
            </div>
          </dl>
        </div>

        <div className="cta__form">
          <LeadForm lang={lang} mode="quote" tone="night" direct={false} />
        </div>
      </div>
    </section>
  );
}
