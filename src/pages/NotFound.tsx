import { Link } from "react-router-dom";
import { t, type Lang } from "@/lib/i18n";
import Seo from "@/components/Seo";

export default function NotFound({ lang }: { lang: Lang }) {
  return (
    <div className="page notfound" data-ground="dark">
      <Seo lang={lang} path="/404" title={t("common.notfound", lang)} noindex />
      <div className="shell notfound__inner">
        <span className="index mono">404</span>
        <h1 className="display notfound__title">{t("common.notfound", lang)}</h1>
        <div className="notfound__actions">
          <Link className="btn btn--solid" to={`/${lang}`}>
            {t("nav.home", lang)}
          </Link>
          <Link className="btn" to={`/${lang}/catalog`}>
            {t("catalog.title", lang)}
          </Link>
        </div>
      </div>
    </div>
  );
}
