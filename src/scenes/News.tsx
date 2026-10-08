/**
 * СЦЕНА 07 — НОВОСТИ
 *
 * Лента компании как она есть на оригинале: заголовок, первая строка, дата
 * отсутствует и на elto.kz — выдумывать её не будем. Порядок — с главной.
 */

import { useRef } from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import Img from "@/components/ui/Img";
import { descOf, pages, site } from "@/lib/data";
import { toRoute } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";

const clean = (teaser: string, title: string) =>
  teaser
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && l !== title && l !== "Читать далее" && l !== "Толығырақ")
    .join(" ");

export default function News({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const block = site.home.ru?.news;
  const byslug = new Map(pages.map((p) => [p.s, p]));

  const items = (block?.items ?? [])
    .filter((n) => n.title && n.href)
    .slice(0, 6)
    .map((n) => {
      const slug = n.href.replace(/\/+$/, "").split("/").pop() || "";
      const page = byslug.get(slug);
      return {
        slug,
        href: toRoute(n.href, lang),
        title: page ? pick(page.t, lang) : n.title,
        teaser: (page && descOf(page, lang)) || clean(n.teaser, n.title),
        image: page?.i || "",
      };
    });

  if (!items.length) return null;

  return (
    <section id="news" ref={root} className="scene news" data-ground="paper">
      <div className="shell news__inner">
        <header className="news__head">
                    <Reveal as="h2" className="news__title display" kind="lines">
            {t("home.news", lang)}
          </Reveal>
          <Link className="btn news__all" to={`/${lang}/news`}>
            {t("common.more", lang)}
          </Link>
        </header>

        <ul className="news__grid">
          {items.map((n) => (
            <li className="news__card" key={n.slug}>
              <Link to={n.href}>
                <div className="news__shot">
                  {n.image ? (
                    <Img file={n.image} alt="" sizes="(max-width: 860px) 92vw, 30vw" fit="cover" />
                  ) : (
                    <span className="news__blank" aria-hidden="true" />
                  )}
                </div>
                <h3 className="news__h title">{n.title}</h3>
                <p className="news__p muted">{n.teaser}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
