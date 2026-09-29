/**
 * Главная на телефоне.
 *
 * Отдельный экран, а не ужатый десктоп. Десктоп — это кино из сгенерированных
 * сцен; на телефоне оно тормозит и читается как рендер. Здесь другое правило:
 * говорит сам завод. Первый кадр — цех горячего цинкования ELTO, изделия —
 * на белом, как на стенде, производство — настоящими фотографиями.
 *
 * Типографика: узкая Fira Sans Condensed в заголовках — как маркировка на
 * металле и надписи дорожных знаков, — обычная Fira Sans в тексте. Никаких
 * надписей капсом над заголовками, свечений и появлений по прокрутке:
 * прокрутка — родная прокрутка телефона.
 *
 * Тексты — те же, что на десктопе, и так же взяты с оригинала.
 */

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Img from "@/components/ui/Img";
import TaskPicker from "@/components/ui/TaskPicker";
import { pages, products, site, topCategories } from "@/lib/data";
import { categoryPath, productPath, toRoute } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import { ADDRESS_LINES, EMAIL, PHONE, PHONE_HREF, whatsappHref } from "@/lib/contacts";
import { useLead } from "@/components/lead/LeadProvider";
import {
  PHONE_HERO_ALT,
  PHONE_HERO_AVIF,
  PHONE_HERO_CAPTION,
  PHONE_HERO_SRC,
  PHONE_HERO_WEBP,
  heroTitle,
} from "@/scenes/hero-copy";
import views from "@/data/views.json";

/** Изделия на «стенде» — разделы, за которыми приходят чаще всего. */
const SHELF = [
  "opory-osveshcheniya-granyonye",
  "machty-osveshcheniya-pmo-vmo",
  "opora-lep",
  "kronshteyny-opor-osveshcheniya",
  "zakladnye-detali-fundamenta",
  "svetodiodnye-svetilniki",
];

/** Разделов в оглавлении до кнопки «показать все». */
const INDEX_SHOWN = 8;

/** Этапы производства — фото завода и страницы услуг оригинала. */
const STEPS = [
  { title: "Плазменная резка металла", photo: "rezka_katochka.jpg", slug: "plazmennaya-rezka-metalla" },
  { title: "Гибка металла", photo: "gibka_katochka.jpg", slug: "gibka-metalla" },
  { title: "Сборка и сварка", photo: "1_11.jpg" },
  { title: "Горячее цинкование", photo: "img_20250818_160758.jpg", slug: "uslugi-goryachego-cinkovaniya" },
];

/** Порядок — как в блоке «Преимущество» на главной оригинала. */
const ADVANTAGE_SLUGS = [
  "качество-продукции",
  "высокий-уровень-обслуживания",
  "оптимальная-цена-на-продукцию",
  "содействие-в-представлении-инженерных-решений",
  "короткие-сроки-выполнения-заказа",
  "гарантийное-и-сервисное-обслуживание",
];

type Partner = { slug: string; title: string; image: string };
const partnerTable = views as unknown as Record<Lang, Record<string, Partner[]>>;

const plural = (n: number, one: string, few: string, many: string) => {
  const d = n % 10;
  const h = n % 100;
  if (d === 1 && h !== 11) return one;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return few;
  return many;
};

export function PhoneHero({ lang }: { lang: Lang }) {
  const title = heroTitle(lang);
  const openLead = useLead();
  return (
    <section className="ph-hero" data-ground="paper">
      <div className="ph-hero__text">
        <h1 className="ph-hero__h1">{title.lines.join(" ")}</h1>
        {title.where && <p className="ph-hero__where">{title.where}</p>}
        <div className="ph-hero__actions">
          <Link className="ph-btn ph-btn--ink" to={`/${lang}/catalog`}>
            {t("cta.catalog", lang)}
          </Link>
          <button type="button" className="ph-btn" onClick={() => openLead()}>
            {t("cta.quote", lang)}
          </button>
        </div>
      </div>
      <figure className="ph-hero__photo">
        <picture>
          <source type="image/avif" srcSet={PHONE_HERO_AVIF} sizes="100vw" />
          <source type="image/webp" srcSet={PHONE_HERO_WEBP} sizes="100vw" />
          <img src={PHONE_HERO_SRC} alt={PHONE_HERO_ALT} width={1080} height={1350} fetchPriority="high" />
        </picture>
        <figcaption>{PHONE_HERO_CAPTION}</figcaption>
      </figure>
    </section>
  );
}

export default function PhoneHome({ lang }: { lang: Lang }) {
  const navigate = useNavigate();
  const openLead = useLead();
  const [query, setQuery] = useState("");
  const [allSections, setAllSections] = useState(false);

  const search = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(`/${lang}/catalog${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  const bySlug = new Map(topCategories.map((c) => [c.slug, c]));
  const shelf = SHELF.map((s) => bySlug.get(s)).filter(Boolean);
  const index = allSections ? topCategories : topCategories.slice(0, INDEX_SHOWN);

  const pageBySlug = new Map(pages.map((p) => [p.s, p]));
  const advantages = ADVANTAGE_SLUGS.map((s) => pageBySlug.get(s)).filter(Boolean);
  const partners = (
    partnerTable[lang]?.partners?.length ? partnerTable[lang].partners : partnerTable.ru.partners || []
  ).filter((p) => p.image);
  const news = (site.home.ru?.news?.items ?? [])
    .filter((n) => n.title && n.href)
    .slice(0, 5)
    .map((n) => {
      const slug = n.href.replace(/\/+$/, "").split("/").pop() || "";
      const page = pageBySlug.get(slug);
      return {
        slug,
        href: toRoute(n.href, lang),
        title: page ? pick(page.t, lang) : n.title,
        image: page?.i || "",
      };
    });

  const itemsWord =
    lang === "ru" ? plural(products.length, "изделие", "изделия", "изделий") : t("common.items", lang);
  const sectionsWord =
    lang === "ru" ? plural(topCategories.length, "разделе", "разделах", "разделах") : t("common.sections", lang);

  return (
    <div className="ph">
      <PhoneHero lang={lang} />

      {/* ── каталог ── */}
      <section className="ph-sec" data-ground="paper" id="catalog">
        <h2 className="ph-h2">{t("catalog.title", lang)}</h2>
        <p className="ph-sub">
          {lang === "ru"
            ? `${products.length} ${itemsWord} в ${topCategories.length} ${sectionsWord}`
            : `${products.length} ${itemsWord}, ${topCategories.length} ${sectionsWord}`}
        </p>

        <form className="ph-search" role="search" onSubmit={search}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M13 13l4.5 4.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.short", lang)}
            aria-label={t("common.search", lang)}
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
          />
        </form>

        {/* стенд: изделия на белом, листаются пальцем */}
        <ul className="ph-shelf">
          {shelf.map((c) => (
            <li key={c!.slug}>
              <Link className="ph-item" to={categoryPath(lang, c!.slug)}>
                <span className="ph-item__img">
                  <Img file={c!.image} alt="" sizes="64vw" fit="contain" />
                </span>
                <span className="ph-item__name">{pick(c!.title, lang)}</span>
                <span className="ph-item__n">{c!.count}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* оглавление каталога — все разделы оригинала по порядку */}
        <ul className="ph-index">
          {index.map((c) => (
            <li key={c.slug}>
              <Link to={categoryPath(lang, c.slug)}>
                <span>{pick(c.title, lang)}</span>
                <span className="ph-index__n">{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>
        {!allSections && (
          <button type="button" className="ph-link" onClick={() => setAllSections(true)}>
            {t("catalog.showAll", lang)} ({topCategories.length})
          </button>
        )}
      </section>

      {/* ── подбор по задаче ── */}
      <section className="ph-sec ph-sec--white" data-ground="paper">
        <h2 className="ph-h2">{t("task.title", lang)}</h2>
        <p className="ph-sub">{t("task.lead", lang)}</p>
        <div className="ph-tasks">
          <TaskPicker lang={lang} />
        </div>
      </section>

      {/* ── производство: этапы по порядку ── */}
      <section className="ph-sec" data-ground="paper">
        <h2 className="ph-h2">От листа до цинка</h2>
        <p className="ph-sub">Собственное производство в Караганде.</p>
        <ol className="ph-steps">
          {STEPS.map((s, i) => {
            const body = (
              <>
                <span className="ph-step__img">
                  <Img file={s.photo} alt="" sizes="(min-width: 600px) 45vw, 88vw" fit="cover" />
                </span>
                <span className="ph-step__t">
                  <span className="ph-step__no">{i + 1}</span>
                  {s.title}
                </span>
              </>
            );
            return (
              <li key={s.title}>
                {s.slug ? (
                  <Link className="ph-step" to={productPath(lang, s.slug)}>
                    {body}
                  </Link>
                ) : (
                  <div className="ph-step">{body}</div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* ── где стоят изделия ── */}
      <section className="ph-sec ph-sec--white" data-ground="paper">
        {/* обе фразы — дословно из публикации о компании на elto.kz */}
        <h2 className="ph-h2">Установлены во всех областных центрах и крупных городах</h2>
        <p className="ph-sub">
          Оборудованием укомплектованы тысячи энергетических объектов не только в
          Казахстане, но и странах СНГ. Завод работает с 2014 года.
        </p>
        <figure className="ph-wide">
          <Img file="whatsapp_image_2024-04-09_at_19.25.24_1.jpg" alt="Освещение стадиона на опорах ELTO" sizes="100vw" fit="cover" />
        </figure>
        {partners.length > 0 && (
          <>
            <h3 className="ph-h3">{t("home.partners", lang)}</h3>
            <ul className="ph-logos">
              {partners.slice(0, 9).map((p) => (
                <li key={p.slug}>
                  <Img file={p.image} alt={p.title} sizes="30vw" fit="contain" />
                </li>
              ))}
            </ul>
            <Link className="ph-link" to={`/${lang}/partners`}>
              {t("common.all", lang)} ({partners.length})
            </Link>
          </>
        )}
      </section>

      {/* ── почему ELTO ── */}
      <section className="ph-sec" data-ground="paper">
        <h2 className="ph-h2">Работа с производителем, без посредников</h2>
        <ul className="ph-why">
          {advantages.map((p) => (
            <li key={p!.s}>{pick(p!.t, lang)}</li>
          ))}
        </ul>
      </section>

      {/* ── новости ── */}
      {news.length > 0 && (
        <section className="ph-sec ph-sec--white" data-ground="paper">
          <div className="ph-row">
            <h2 className="ph-h2">{t("home.news", lang)}</h2>
            <Link className="ph-link" to={`/${lang}/news`}>
              {t("common.all", lang)}
            </Link>
          </div>
          <ul className="ph-rail">
            {news.map((n) => (
              <li key={n.slug}>
                <Link className="ph-news" to={n.href}>
                  <span className="ph-news__img">
                    {n.image && <Img file={n.image} alt="" sizes="72vw" fit="cover" />}
                  </span>
                  <span className="ph-news__t">{n.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── связь: номер телефона — главный элемент экрана ── */}
      <section className="ph-contact" data-ground="dark" id="contact">
        <h2 className="ph-h2">{t("home.final", lang)}</h2>
        <p className="ph-sub">{t("home.final.lead", lang)}</p>
        <a className="ph-phone" href={PHONE_HREF}>
          {PHONE}
        </a>
        <div className="ph-contact__actions">
          <button type="button" className="ph-btn ph-btn--light" onClick={() => openLead()}>
            {t("cta.quote", lang)}
          </button>
          <a className="ph-btn ph-btn--line" href={whatsappHref()} target="_blank" rel="noreferrer noopener">
            WhatsApp
          </a>
        </div>
        <p className="ph-contact__meta">
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <br />
          {ADDRESS_LINES[0]}, {ADDRESS_LINES[1]}
        </p>
      </section>
    </div>
  );
}
