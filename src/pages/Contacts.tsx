/**
 * Контакты.
 *
 * Список сотрудников, телефоны, адрес и почта — таблица со страницы
 * «Контакты» оригинала, без изменений. Вместо ссылки «посмотреть на карте»
 * внизу страницы — живая карта с маркером производства (см. OfficeMap).
 */

import Seo from "@/components/Seo";
import Reveal from "@/components/motion/Reveal";
import BackLink from "@/components/ui/BackLink";
import OfficeMap from "@/components/ui/OfficeMap";
import LeadForm from "@/components/lead/LeadForm";
import { loadPage, type PageFull } from "@/lib/data";
import { pick, t, type Lang } from "@/lib/i18n";
import { useRecord } from "@/lib/use-record";
import {
  ADDRESS_LINES,
  EMAIL,
  PHONE,
  PHONE_2,
  PHONE_2_HREF,
  PHONE_HREF,
  whatsappHref,
} from "@/lib/contacts";

/** Страница «Контакты» оригинала. */
const CONTACTS_SLUG = "kontakty";

export default function Contacts({ lang }: { lang: Lang }) {
  const { data } = useRecord<PageFull>(CONTACTS_SLUG, loadPage);

  const table = data?.tables?.[0];

  return (
    <div className="page contacts ground-paper" data-ground="paper">
      <Seo
        lang={lang}
        path="/contacts"
        title={pick(data?.title, lang) || t("nav.contacts", lang)}
        description={`${ADDRESS_LINES.join(" ")} · ${PHONE} · ${EMAIL}`}
      />
      <header className="page__head shell">
        <BackLink to={`/${lang}`} label={t("back.home", lang)} />
        <span className="index">{t("nav.contacts", lang)}</span>
        <Reveal as="h1" className="page__title display" kind="lines">
          {pick(data?.title, lang) || t("nav.contacts", lang)}
        </Reveal>
      </header>

      <section className="shell contacts__top">
        <div className="contacts__block">
          <h2 className="label">{t("contacts.address", lang)}</h2>
          <address className="contacts__address">
            {ADDRESS_LINES[0]}
            <br />
            {ADDRESS_LINES[1]}
          </address>
        </div>
        <div className="contacts__block">
          <h2 className="label">{t("contacts.phone", lang)}</h2>
          <a className="contacts__big mono" href={PHONE_HREF}>
            {PHONE}
          </a>
          <a className="contacts__big mono" href={PHONE_2_HREF}>
            {PHONE_2}
          </a>
        </div>
        <div className="contacts__block">
          <h2 className="label">{t("contacts.email", lang)}</h2>
          <a className="contacts__big mono" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <a
            className="contacts__big mono"
            href={whatsappHref()}
            target="_blank"
            rel="noreferrer noopener"
          >
            WhatsApp
          </a>
        </div>
      </section>

      <section className="shell contacts__lead">
        <div className="contacts__lead-text">
          <h2 className="title contacts__lead-h">{t("home.final", lang)}</h2>
          <p className="contacts__lead-p">{t("home.final.lead", lang)}</p>
        </div>
        <LeadForm lang={lang} mode="quote" direct={false} />
      </section>

      {table && (
        <section className="shell contacts__people">
          <h2 className="label contacts__h">Наши контактные телефоны</h2>
          <div className="spec-wrap">
            <table className="spec">
              <thead>
                <tr>
                  {table[0].map((c, i) => (
                    <th key={i}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.slice(1).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((c, ci) => (
                      <td key={ci}>
                        {/^\+?[\d\s()+-]{7,}$/.test(c) ? (
                          <a href={`tel:${c.replace(/[^\d+]/g, "")}`}>{c}</a>
                        ) : (
                          c
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="shell contacts__map">
        <h2 className="label contacts__h">{t("contacts.map", lang)}</h2>
        <OfficeMap lang={lang} />
      </section>
    </div>
  );
}
