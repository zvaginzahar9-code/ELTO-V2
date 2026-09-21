/**
 * Списковые разделы: новости, партнёры, вакансии, фотогалерея, полезное.
 *
 * Состав и порядок — как на оригинале, включая языковые различия: на
 * казахской и английской версиях elto.kz часть материалов отсутствует,
 * и придумывать их здесь никто не станет.
 */

import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import BackLink from "@/components/ui/BackLink";
import Img from "@/components/ui/Img";
import views from "@/data/views.json";
import { toRoute } from "@/lib/routes";
import { t, type Lang } from "@/lib/i18n";

type Kind = "news" | "partners" | "vacancy" | "gallery" | "info";

const VIEW: Record<Kind, string> = {
  news: "news",
  partners: "partners",
  vacancy: "vacancy",
  gallery: "gallery",
  info: "usefullinf",
};

const HEADING: Record<Kind, Record<Lang, string>> = {
  news: { ru: "Новости", kk: "Жаңалықтар", en: "News" },
  partners: { ru: "Партнеры", kk: "Серіктестер", en: "Partners" },
  vacancy: { ru: "Вакансии", kk: "Вакансиялар", en: "Vacancies" },
  gallery: { ru: "Фотогалерея", kk: "Фотогалерея", en: "Photogallery" },
  info: { ru: "Полезная информация", kk: "Пайдалы ақпараттар", en: "Useful Information" },
};

type Item = { slug: string; title: string; href: string; image: string; lead: string };
const table = views as unknown as Record<Lang, Record<string, Item[]>>;

export default function InfoList({ lang, kind }: { lang: Lang; kind: Kind }) {
  const view = VIEW[kind];
  const items = table[lang]?.[view]?.length ? table[lang][view] : table.ru[view] || [];
  const heading = HEADING[kind][lang];
  const cards = kind === "partners";

  return (
    <div className="page ground-paper" data-ground="paper">
      <header className="page__head shell">
        <BackLink to={`/${lang}`} label={t("back.home", lang)} />
        <span className="index">{heading}</span>
        <Reveal as="h1" className="page__title display" kind="lines">
          {heading}
        </Reveal>
        <p className="page__meta mono muted">{items.length}</p>
      </header>

      <section className="shell">
        {!items.length && <p className="lead">{t("common.nothing", lang)}</p>}

        {cards ? (
          <ul className="grid grid--logos">
            {items.map((it) => (
              <li className="logo-card" key={it.slug}>
                <Img file={it.image} alt={it.title} sizes="(max-width: 860px) 40vw, 18vw" fit="contain" />
                <span className="label">{it.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="list">
            {items.map((it) => {
              const to = it.href ? toRoute(it.href, lang) : null;
              const inner = (
                <>
                  {it.image && (
                    <div className="list__shot">
                      <Img file={it.image} alt="" sizes="(max-width: 860px) 92vw, 22vw" fit="cover" />
                    </div>
                  )}
                  <div className="list__text">
                    <h2 className="list__h title">{it.title}</h2>
                    {it.lead && <p className="list__p muted">{it.lead}</p>}
                  </div>
                </>
              );
              return (
                <li className="list__row" key={it.slug}>
                  {to ? <Link to={to}>{inner}</Link> : <div>{inner}</div>}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
