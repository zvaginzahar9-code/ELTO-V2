/**
 * СЦЕНА 02 — КОМПАНИЯ
 *
 * Первая светлая секция: после кинематографичного открытия зритель попадает
 * на «бумагу», где можно читать. Текст — дословно со страницы «О нас»
 * оригинала, ни одного нового предложения; полная версия по ссылке.
 */

import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import Counter from "@/components/motion/Counter";
import Img from "@/components/ui/Img";
import { loadPage, products, topCategories, type PageFull } from "@/lib/data";
import { pick, t, type Lang } from "@/lib/i18n";
import { useRecord } from "@/lib/use-record";

/** Страница «О нас» оригинала — из неё берутся первые абзацы. */
const ABOUT_SLUG = "o-nas";

export default function Company({ lang }: { lang: Lang }) {
  const { data: page } = useRecord<PageFull>(ABOUT_SLUG, loadPage);
  const paragraphs = (page?.body?.[lang] || page?.body?.ru || "")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 30)
    .slice(0, 3);

  return (
    <section id="company" className="scene company ground-paper" data-ground="paper">
      <div className="shell company__inner">
        <header className="company__head">
          <span className="index">02 — {t("home.company", lang)}</span>
          {/* формулировка первой фразы страницы «О нас» оригинала */}
          <Reveal as="h2" className="company__title display" kind="lines">
            Завод — производитель опор освещения,
            <br />
            мачт и металлоконструкций
            <br />
            различного назначения
          </Reveal>
        </header>

        <div className="company__body">
          <div className="company__text prose">
            {paragraphs.length
              ? paragraphs.map((p, i) => (
                  <Reveal as="p" key={i} className="lead" delay={i * 60}>
                    {p}
                  </Reveal>
                ))
              : null}
            <Link className="btn company__more" to={`/${lang}/about`}>
              {t("common.more", lang)}
            </Link>
          </div>

          <figure className="company__figure">
            <Img
              file="elto_3v_1.jpg"
              alt="Продукция ЭЛТО на объектах"
              sizes="(max-width: 980px) 92vw, 46vw"
              fit="cover"
            />
            <figcaption className="label muted">
              {pick(page?.title, lang) || "О нас"}
            </figcaption>
          </figure>
        </div>

        <dl className="company__figures">
          <div className="fig">
            <dt className="label">Год основания</dt>
            <dd className="fig__v mono">
              <Counter to={2014} />
            </dd>
          </div>
          <div className="fig">
            <dt className="label">{t("common.sections", lang)} каталога</dt>
            <dd className="fig__v mono">
              <Counter to={topCategories.length} />
            </dd>
          </div>
          <div className="fig">
            <dt className="label">{t("common.items", lang)} продукции</dt>
            <dd className="fig__v mono">
              <Counter to={products.length} />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
