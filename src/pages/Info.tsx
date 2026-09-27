/**
 * Материал раздела: новость, вакансия, партнёр, полезная информация.
 *
 * Страница собрана как разворот издания, а не как карточка CMS. Ширина
 * работает по очереди: рубрика и заголовок идут широко, кадр — во всю
 * полосу, а текст сужается до читаемой колонки и встаёт по центру. Так
 * материал из двух абзацев не выглядит текстом, забытым в левом углу
 * полуторатысячного экрана.
 *
 * Текст, факты, даты и картинки — из выгрузки оригинала, дословно.
 * Меняется только подача.
 */

import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import Seo from "@/components/Seo";
import ArticleShot from "@/components/ui/ArticleShot";
import BackLink from "@/components/ui/BackLink";
import Img from "@/components/ui/Img";
import { loadPage, pages, type PageFull } from "@/lib/data";
import { article } from "@/lib/prose";
import { rewriteLinks } from "@/lib/routes";
import { imgSrc } from "@/lib/image-url";
import { pick, t, type Lang } from "@/lib/i18n";
import { useRecord } from "@/lib/use-record";
import views from "@/data/views.json";
import NotFound from "./NotFound";

type Loc = Record<Lang, string>;

/** В каком списке оригинала лежит эта страница — туда и возвращаем. */
const LISTS: { view: string; path: string; title: Loc; all: Loc }[] = [
  {
    view: "news",
    path: "news",
    title: { ru: "Новости", kk: "Жаңалықтар", en: "News" },
    all: { ru: "Все новости", kk: "Барлық жаңалықтар", en: "All news" },
  },
  {
    view: "partners",
    path: "partners",
    title: { ru: "Партнеры", kk: "Серіктестер", en: "Partners" },
    all: { ru: "Все партнёры", kk: "Барлық серіктестер", en: "All partners" },
  },
  {
    view: "vacancy",
    path: "vacancy",
    title: { ru: "Вакансии", kk: "Вакансиялар", en: "Vacancies" },
    all: { ru: "Все вакансии", kk: "Барлық вакансиялар", en: "All vacancies" },
  },
  {
    view: "gallery",
    path: "gallery",
    title: { ru: "Фотогалерея", kk: "Фотогалерея", en: "Photogallery" },
    all: { ru: "Вся фотогалерея", kk: "Толық фотогалерея", en: "Full photogallery" },
  },
  {
    view: "usefullinf",
    path: "info",
    title: {
      ru: "Полезная информация",
      kk: "Пайдалы ақпараттар",
      en: "Useful Information",
    },
    all: {
      ru: "Вся полезная информация",
      kk: "Барлық пайдалы ақпарат",
      en: "All useful information",
    },
  },
];

type Row = { slug: string; title: string; href: string; image: string };
const viewTable = views as unknown as Record<string, Record<string, Row[]>>;

type Place = {
  /** адрес списка и подпись возврата */
  to: string;
  all: string;
  /** название рубрики */
  section: string;
  /** позиция в списке — материал такой-то из стольких */
  no: number;
  total: number;
  prev: Row | null;
  next: Row | null;
};

/**
 * Место материала в своём разделе. Список берём на языке страницы, а если
 * на нём этого раздела нет — русский: так же ведёт себя и сам список.
 */
function placeOf(slug: string, lang: Lang): Place | null {
  for (const list of LISTS) {
    const rows =
      (viewTable[lang]?.[list.view]?.length
        ? viewTable[lang][list.view]
        : viewTable.ru?.[list.view]) || [];
    const i = rows.findIndex((r) => r.slug === slug);
    if (i === -1) continue;
    return {
      to: `/${lang}/${list.path}`,
      all: list.all[lang] || list.all.ru,
      section: list.title[lang] || list.title.ru,
      no: i + 1,
      total: rows.length,
      prev: rows[i - 1] ?? null,
      next: rows[i + 1] ?? null,
    };
  }
  return null;
}

/** Длинному заголовку нужен кегль поменьше, иначе он съедает весь экран. */
const titleSize = (s: string) => (s.length > 78 ? "sm" : s.length > 38 ? "md" : "lg");

export default function Info({ lang }: { lang: Lang }) {
  const { slug = "" } = useParams();
  const brief = pages.find((p) => p.s === slug);
  const { data, failed } = useRecord<PageFull>(slug, loadPage);
  const body = useRef<HTMLDivElement>(null);

  /* тело материала приходит спокойно, по факту появления в кадре */
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "true");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    el.querySelectorAll(".art__rise").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [data]);

  if (!brief || failed) return <NotFound lang={lang} />;

  const title = pick(brief.t, lang);
  const place = placeOf(slug, lang);
  const raw = data ? rewriteLinks(data.html[lang] || data.html.ru || "", lang) : "";
  const { date, lead, body: text } = article(raw);

  /* до загрузки карточки кадр берём из индекса — чтобы шапка не прыгала,
     когда придут полные данные и картинка окажется той же самой */
  const shots = data?.images?.length ? data.images : brief.i ? [brief.i] : [];
  const hero = shots[0] || "";
  const rest = shots.slice(1, 13);

  return (
    /* грунт на корне держит шапку светлой, тёмная полоса кадра и тело
       переключают её сами — наблюдатель в шапке слушает именно их */
    <article className="page art ground-paper" data-ground="paper">
      <Seo
        lang={lang}
        path={`/info/${slug}`}
        title={title}
        description={data?.description || lead || brief.d}
        image={hero ? imgSrc(hero, 1600) : undefined}
        type="article"
      />
      <header className="art__head shell" data-ground="paper">
        <div className="art__nav art__in">
          <BackLink
            to={place?.to ?? `/${lang}`}
            label={place?.all ?? t("back.home", lang)}
            className="back--art"
          />
        </div>

        <div className="art__eyebrow art__in">
          <span className="index">{place?.section ?? t("nav.home", lang)}</span>
          {date && <time className="mono art__date">{date}</time>}
          <span className="rule art__eyebrow-rule" aria-hidden="true" />
          {place && (
            <span className="mono muted art__no">
              {String(place.no).padStart(2, "0")} / {place.total}
            </span>
          )}
        </div>

        <Reveal
          as="h1"
          className={`art__title display art__title--${titleSize(title)}`}
          kind="lines"
          immediate
          delay={120}
        >
          {title}
        </Reveal>

        <div className="art__intro">
          <div className="art__meta art__in">
            <span className="label">ELTO</span>
            <span className="label muted">{place?.section}</span>
            <span className="label muted">
              {lang === "en" ? "Karaganda" : lang === "kk" ? "Қарағанды" : "Караганда"}
            </span>
          </div>

          {(lead || brief.d) && (
            /* врезка приходит разметкой оригинала — её не режем на строки,
               иначе ссылка внутри абзаца развалится на куски */
            <p
              className="art__lead lead art__in"
              dangerouslySetInnerHTML={{ __html: lead || brief.d }}
            />
          )}
        </div>
      </header>

      {hero && <ArticleShot file={hero} alt={title} />}

      <div className="art__main" data-ground="paper" ref={body}>
        <div className="shell">
          <div className="art__col art__rise">
            {text ? (
              <div className="prose" dangerouslySetInnerHTML={{ __html: text }} />
            ) : (
              !lead && <p className="lead">{brief.d || t("common.loading", lang)}</p>
            )}
          </div>

          {!!data?.tables.length && (
            <div className="art__col art__col--wide art__rise">
              {data.tables.map((table, ti) => (
                <div className="spec-wrap" key={ti}>
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
                            <td key={ci}>{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {!!data?.docs.length && (
            <div className="art__col art__rise">
              <h2 className="label art__h">{t("product.docs", lang)}</h2>
              <ul className="docs">
                {data.docs.map((d) => (
                  <li key={d.href}>
                    <a href={d.href} target="_blank" rel="noreferrer">
                      ↓ {d.text || d.href.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!!rest.length && (
            <div className="art__gallery art__rise">
              <h2 className="label art__h">{t("product.gallery", lang)}</h2>
              <ul className="art__grid">
                {rest.map((f) => (
                  <li key={f}>
                    <Img
                      file={f}
                      alt=""
                      sizes="(max-width: 860px) 46vw, 30vw"
                      fit="contain"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {place && (place.prev || place.next) && (
            /* у первого и последнего материала раздела сосед один — тогда
               его карточка занимает полосу целиком, а не половину с дырой */
            <nav
              className="art__more art__rise"
              aria-label={place.section}
              data-pair={place.prev && place.next ? "both" : place.next ? "next" : "prev"}
            >
              {[place.prev, place.next].map((row, i) =>
                row ? (
                  <Link
                    className="art__more-card"
                    key={row.slug}
                    to={`/${lang}/info/${row.slug}`}
                    data-dir={i ? "next" : "prev"}
                  >
                    <span className="label muted art__more-label">
                      {i ? t("article.next", lang) : t("article.prev", lang)}
                    </span>
                    <span className="art__more-h title">{row.title}</span>
                  </Link>
                ) : null
              )}
            </nav>
          )}
        </div>
      </div>
    </article>
  );
}
