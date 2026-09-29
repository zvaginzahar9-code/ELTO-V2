/**
 * Нижняя панель телефона.
 *
 * На телефоне шапка уходит при прокрутке, а до подвала далеко. Четыре
 * действия, ради которых сюда приходят, остаются под большим пальцем на
 * любой странице: каталог, расчёт, звонок, WhatsApp. На широком экране
 * панели нет — там всё это в шапке.
 */

import { Link } from "react-router-dom";
import { t, type Lang } from "@/lib/i18n";
import { PHONE_HREF, whatsappHref } from "@/lib/contacts";
import { useLead } from "@/components/lead/LeadProvider";

export default function Dock({ lang }: { lang: Lang }) {
  const openLead = useLead();

  return (
    <nav className="dock" aria-label={t("product.actions", lang)}>
      <Link className="dock__item" to={`/${lang}/catalog`}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" />
        </svg>
        {t("cta.catalog", lang)}
      </Link>
      <button
        type="button"
        className="dock__item dock__item--main"
        onClick={() => openLead()}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 2h7l3 3v13H5zM8 9h5M8 12h5M8 15h3" />
        </svg>
        {t("dock.quote", lang)}
      </button>
      <a className="dock__item" href={PHONE_HREF}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M6 2.5l2.5 4-2 1.6a10 10 0 0 0 5.4 5.4l1.6-2 4 2.5-1.2 3A2 2 0 0 1 14.4 18 13.5 13.5 0 0 1 2 5.6a2 2 0 0 1 1-1.9z" />
        </svg>
        {t("dock.call", lang)}
      </a>
      <a
        className="dock__item"
        href={whatsappHref()}
        target="_blank"
        rel="noreferrer noopener"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 17l1.2-3.6A7.5 7.5 0 1 1 7 16.2zM7.5 7c0 3 2.5 5.5 5.5 5.5" />
        </svg>
        WhatsApp
      </a>
    </nav>
  );
}
