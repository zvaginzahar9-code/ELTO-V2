/**
 * О компании.
 *
 * Страница «О нас» оригинала целиком, плюс её подразделы — сертификаты,
 * награды, благодарственные письма, презентация — и корпоративный ролик,
 * который уже был на elto.kz.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Reveal from "@/components/motion/Reveal";
import BackLink from "@/components/ui/BackLink";
import Counter from "@/components/motion/Counter";
import Img from "@/components/ui/Img";
import { loadPage, pages, products, topCategories, type PageFull, localize, descOf } from "@/lib/data";
import { infoPath, rewriteLinks } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import { useRecord } from "@/lib/use-record";

/** Подразделы «О нас» — в порядке меню оригинала. */
const SUBPAGES = ["сертификаты", "награды", "blagodarstvennye-pisma", "презентация"];

/**
 * Показываем подраздел, только если на оригинале там что-то есть.
 *
 * «Награды» и «Презентация» на elto.kz пусты полностью — ни текста, ни
 * изображений, ни файлов. Ссылка на такую страницу обрывает чтение и
 * приводит в никуда, поэтому её просто нет.
 */
const hasContent = (p: { d: string; i: string }) => Boolean(p.d || p.i);

/** Страница «О нас» оригинала. */
const ABOUT_SLUG = "o-nas";

/** Ролик, который стоит на главной оригинала. */
// youtube-nocookie — единственный адрес видео, который разрешает CSP (vercel.json)
const FILM = "https://www.youtube-nocookie.com/embed/2lW6Hn6otPU";

export default function About({ lang }: { lang: Lang }) {
  const { data: raw } = useRecord<PageFull>(ABOUT_SLUG, loadPage);
  const data = useMemo(() => localize(raw, lang), [raw, lang]);
  const [film, setFilm] = useState(false);

  const byslug = new Map(pages.map((p) => [p.s, p]));
  const subs = SUBPAGES.map((s) => byslug.get(s)).filter((p) => p && hasContent(p));
  const html = data ? rewriteLinks(data.html[lang] || data.html.ru || "", lang) : "";

  return (
    <div className="page about ground-paper" data-ground="paper">
      <Seo
        lang={lang}
        path="/about"
        title={pick(data?.title, lang) || t("nav.company", lang)}
        description={data?.description || data?.lead}
      />
      <header className="page__head shell">
        <BackLink to={`/${lang}`} label={t("back.home", lang)} />
        <span className="index">{t("home.company", lang)}</span>
        <Reveal as="h1" className="page__title display" kind="lines">
          {pick(data?.title, lang) || t("nav.company", lang)}
        </Reveal>
      </header>

      <section className="shell about__top">
        <div className="prose about__prose">
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="lead">{t("common.loading", lang)}</p>
          )}
        </div>

        <aside className="about__side">
          <div className="about__film">
            {film ? (
              <iframe
                src={`${FILM}?autoplay=1`}
                title="ELTO"
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button className="about__play" onClick={() => setFilm(true)}>
                <Img file="elto_3v_1.jpg" alt="" sizes="40vw" fit="cover" />
                <span className="about__play-label label">{t("home.watch", lang)}</span>
              </button>
            )}
          </div>

          <dl className="about__figures">
            <div className="fig">
              <dt className="label">{t("about.founded", lang)}</dt>
              <dd className="fig__v mono">
                <Counter to={2014} />
              </dd>
            </div>
            <div className="fig">
              <dt className="label">{t("common.sections", lang)}</dt>
              <dd className="fig__v mono">
                <Counter to={topCategories.length} />
              </dd>
            </div>
            <div className="fig">
              <dt className="label">{t("common.items", lang)}</dt>
              <dd className="fig__v mono">
                <Counter to={products.length} />
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      {!!subs.length && (
        <section className="shell about__subs">
          <h2 className="label">{t("product.docs", lang)}</h2>
          <ul className="grid grid--sections">
            {subs.map((p) => (
              <li className="sect" key={p!.s}>
                <Link to={infoPath(lang, p!.s)}>
                  {/* у части подразделов есть только текст — тогда в кадре
                      стоит он, а не пустая рамка */}
                  <div className="sect__shot" data-text={p!.i ? "false" : "true"}>
                    {p!.i ? (
                      <Img
                        file={p!.i}
                        alt=""
                        sizes="(max-width: 860px) 46vw, 24vw"
                        fit="contain"
                      />
                    ) : (
                      <p className="sect__excerpt">{descOf(p!, lang)}</p>
                    )}
                  </div>
                  <h3 className="sect__h title">{pick(p!.t, lang)}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
