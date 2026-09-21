/**
 * Подвал.
 *
 * Адрес, почта, телефон и подпись — дословно с оригинала. Дальше разделы
 * каталога в том же порядке, что на elto.kz, и документы, которые там
 * действительно лежат.
 */

import { Link } from "react-router-dom";
import { site, topCategories } from "@/lib/data";
import { pick, t, type Lang } from "@/lib/i18n";
import { categoryPath } from "@/lib/routes";

const SOCIAL = [
  { label: "WhatsApp", href: "https://api.whatsapp.com/send?phone=77003700704" },
  { label: "Instagram", href: "https://www.instagram.com/energosistemy_elto/" },
];

const DOCS = [
  { label: "Каталог опор освещения", href: "/docs/katalog_opor_elto.pdf" },
  { label: "Каталог опор ЛЭП", href: "/docs/katalog_novyy_do_330kvpdf.pdf" },
];

export default function Footer({ lang }: { lang: Lang }) {
  const copyright = site.copyright[lang] || site.copyright.ru;

  return (
    <footer className="foot" data-ground="dark">
      <div className="foot__inner shell">
        <div className="foot__brand">
          <img className="foot__logo" src="/logo_elto-1.svg" alt="ELTO" width={299} height={111} />
          <p className="foot__claim lead">
            ТОО «Энергосистемы ЭЛТО» — завод-производитель опор освещения, мачт
            и металлоконструкций различного назначения.
          </p>
        </div>

        <div className="foot__col">
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
            г. Караганда, район Алихана Букейханова,
            <br />
            учетный квартал 018, строение 20
          </address>

          <h2 className="label foot__h foot__h--gap">{t("contacts.phone", lang)}</h2>
          <a className="foot__big mono" href="tel:+77003700704">
            +7 700 370 07 04
          </a>
          <a className="foot__big mono" href="mailto:sales@elto.kz">
            sales@elto.kz
          </a>

          <ul className="foot__social">
            {SOCIAL.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noreferrer noopener" className="label">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <ul className="foot__social">
            {DOCS.map((d) => (
              <li key={d.href}>
                <a href={d.href} target="_blank" rel="noreferrer" className="label">
                  ↓ {d.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="foot__bar shell">
        <span className="mono">{copyright}</span>
        <Link className="mono" to={`/${lang}/contacts`}>
          {t("nav.contacts", lang)}
        </Link>
      </div>
    </footer>
  );
}
