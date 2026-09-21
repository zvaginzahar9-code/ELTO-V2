/**
 * СЦЕНА 08 — КОНТАКТ
 *
 * Последний кадр отдаётся тому, ради чего человек листал: как связаться.
 * Адрес, телефон и почта — дословно с оригинала.
 */

import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import { t, type Lang } from "@/lib/i18n";

export default function ContactCta({ lang }: { lang: Lang }) {
  return (
    <section id="contact" className="scene cta" data-ground="dark">
      <div className="shell cta__inner">
        <span className="index">08 — {t("home.contacts", lang)}</span>
        {/* заголовок формы обратной связи с оригинала */}
        <Reveal as="h2" className="cta__title display display--tight" kind="lines">
          Остались вопросы?
        </Reveal>

        <div className="cta__grid">
          <div className="cta__col">
            <span className="label">{t("contacts.phone", lang)}</span>
            <a className="cta__big mono" href="tel:+77003700704">
              +7 700 370 07 04
            </a>
          </div>
          <div className="cta__col">
            <span className="label">{t("contacts.email", lang)}</span>
            <a className="cta__big mono" href="mailto:sales@elto.kz">
              sales@elto.kz
            </a>
          </div>
          <div className="cta__col">
            <span className="label">{t("contacts.address", lang)}</span>
            <address className="cta__address">
              г. Караганда, район Алихана Букейханова,
              <br />
              учетный квартал 018, строение 20
            </address>
          </div>
        </div>

        <div className="cta__actions">
          <Link className="btn btn--solid" to={`/${lang}/contacts`}>
            {t("nav.contacts", lang)}
          </Link>
          <Link className="btn" to={`/${lang}/catalog`}>
            {t("catalog.all", lang)}
          </Link>
        </div>
      </div>
    </section>
  );
}
