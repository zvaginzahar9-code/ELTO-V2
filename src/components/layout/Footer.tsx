/**
 * Подвал.
 *
 * Адрес, почта, телефон и подпись — дословно с оригинала. Дальше разделы
 * каталога в том же порядке, что на elto.kz, и документы, которые там
 * действительно лежат.
 */

import { Link } from "react-router-dom";
import { topCategories } from "@/lib/data";
import { pick, t, type Lang } from "@/lib/i18n";
import { categoryPath } from "@/lib/routes";
import {
  CATALOG_DOCS,
  EMAIL,
  INSTAGRAM,
  PHONE,
  PHONE_HREF,
  whatsappHref,
} from "@/lib/contacts";
import Logo from "@/components/ui/Logo";
import { privacyPath } from "@/lib/privacy";

const SOCIAL = [
  { label: "WhatsApp", href: whatsappHref() },
  { label: "Instagram", href: INSTAGRAM },
];

export default function Footer({ lang }: { lang: Lang }) {

  return (
    <footer className="foot" data-ground="dark">
      {/* знак во всю ширину: на главной поток проходит за буквами и перед ними */}
      <div className="foot__mark shell" aria-hidden="true">
        <Logo tagline={false} />
      </div>
      <div className="foot__inner shell">
        <div className="foot__brand">
          <Logo className="foot__logo" title="ELTO" />
          <p className="foot__claim lead">
            {t("brand.claim", lang)}
          </p>
        </div>

        <div className="foot__col foot__col--cats">
          <h2 className="label foot__h">{t("catalog.sections", lang)}</h2>
          <ul className="foot__list">
            {topCategories.map((c) => (
              <li key={c.slug}>
                <Link to={categoryPath(lang, c.slug)}>{pick(c.title, lang)}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="foot__col">
          <h2 className="label foot__h">{t("contacts.address", lang)}</h2>
          <address className="foot__address">
            {t("address.1", lang)}
            <br />
            {t("address.2", lang)}
          </address>

          <h2 className="label foot__h foot__h--gap">{t("contacts.phone", lang)}</h2>
          <a className="foot__big mono" href={PHONE_HREF}>
            {PHONE}
          </a>
          <a className="foot__big mono" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>

          <ul className="foot__social">
            {SOCIAL.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="label"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <ul className="foot__social">
            {CATALOG_DOCS.map((d) => (
              <li key={d.href}>
                <a href={d.href} target="_blank" rel="noreferrer" className="label">
                  ↓ {t(`doc.${d.key}`, lang)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="foot__bar shell">
        <span className="mono">{t("brand.legal", lang)} © {new Date().getFullYear()}</span>
        <Link className="mono" to={`/${lang}/contacts`}>
          {t("nav.contacts", lang)}
        </Link>
        <Link className="mono" to={privacyPath(lang)}>
          {t("privacy.link", lang)}
        </Link>
      </div>
    </footer>
  );
}
