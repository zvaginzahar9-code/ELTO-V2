/**
 * Главная на телефоне.
 *
 * Не ужатая версия десктопа, а отдельный экран под палец. Десктоп — это кино:
 * закреплённые сцены, кадры по прокрутке, выноски. На телефоне всё это
 * тормозит и не помещается, поэтому здесь другой жанр — каталог-приложение:
 * крупный заголовок, поиск и разделы сразу под пальцем, короткие блоки,
 * которые читаются за один взгляд, и ни одного закреплённого экрана.
 *
 * Движение — только появление блоков при входе в кадр, на CSS: прокрутка
 * остаётся родной прокруткой телефона.
 *
 * Тексты — те же, что на десктопе, и так же взяты с оригинала.
 */

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Img from "@/components/ui/Img";
import TaskPicker from "@/components/ui/TaskPicker";
import { pages, products, site, topCategories } from "@/lib/data";
import { categoryPath, productPath, toRoute } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import { ADDRESS_LINES, EMAIL, PHONE, PHONE_HREF, whatsappHref } from "@/lib/contacts";
import { useLead } from "@/components/lead/LeadProvider";
import { heroTitle } from "@/scenes/hero-copy";
import views from "@/data/views.json";

/** Разделы на главной — первые шесть в порядке оригинала, остальное в каталоге. */
const CATS_SHOWN = 6;

/** Этапы производства — реальные фото завода и страницы услуг оригинала. */
const STEPS = [
  { no: "01", title: "Плазменная резка металла", photo: "rezka_katochka.jpg", slug: "plazmennaya-rezka-metalla" },
  { no: "02", title: "Гибка металла", photo: "gibka_katochka.jpg", slug: "gibka-metalla" },
  { no: "03", title: "Сборка и сварка", photo: "1_11.jpg" },
  { no: "04", title: "Горячее цинкование", photo: "img_20250818_155550_1.jpg", slug: "uslugi-goryachego-cinkovaniya" },
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

/** Блок появляется, когда входит в кадр, — один раз, без повторов. */
function useAppear(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-in]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [root]);
}

function Arrow() {
  return (
    <svg className="ph-arrow" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
    </svg>
  );
}

export function PhoneHero({ lang }: { lang: Lang }) {
  const title = heroTitle(lang);
  const openLead = useLead();
  return (
    <section className="ph-hero" data-ground="paper">
      <div className="ph-hero__art" aria-hidden="true">
        <img src="/media/posters/iskra-phone.webp" alt="" width={720} height={810} fetchPriority="high" />
      </div>
      <div className="ph-hero__sheet">
        <p className="ph-hero__eyebrow">
          <i aria-hidden="true" />
          {t("hero.since", lang)}
        </p>
        <h1 className="ph-hero__h1">{title.lines.join(" ")}</h1>
        {title.where && <p className="ph-hero__where">{title.where}</p>}
        <div className="ph-hero__actions">
          <Link className="ph-btn ph-btn--solid" to={`/${lang}/catalog`}>
            {t("cta.catalog", lang)}
            <Arrow />
          </Link>
          <button type="button" className="ph-btn" onClick={() => openLead()}>
            {t("cta.quote", lang)}
          </button>
        </div>
      </div>
    </section>
  );
}

export default function PhoneHome({ lang }: { lang: Lang }) {
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const openLead = useLead();
  const [query, setQuery] = useState("");
  useAppear(root);

  const search = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(`/${lang}/catalog${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  const byslug = new Map(pages.map((p) => [p.s, p]));
  const advantages = ADVANTAGE_SLUGS.map((s) => byslug.get(s)).filter(Boolean);
  const partners = (
    partnerTable[lang]?.partners?.length ? partnerTable[lang].partners : partnerTable.ru.partners || []
  ).filter((p) => p.image);
  const news = (site.home.ru?.news?.items ?? [])
    .filter((n) => n.title && n.href)
    .slice(0, 5)
    .map((n) => {
      const slug = n.href.replace(/\/+$/, "").split("/").pop() || "";
      const page = byslug.get(slug);
      return {
        slug,
        href: toRoute(n.href, lang),
        title: page ? pick(page.t, lang) : n.title,
        image: page?.i || "",
      };
    });

  return (
    <div className="ph" ref={root}>
      <PhoneHero lang={lang} />

      {/* ── каталог: поиск и разделы ── */}
      <section className="ph-sec" data-ground="paper" id="catalog">
        <header className="ph-head" data-in>
          <p className="ph-kicker">{t("home.catalog", lang)}</p>
          <h2 className="ph-h2">{t("catalog.title", lang)}</h2>
          <p className="ph-note">
            {topCategories.length} {t("common.sections", lang)} · {products.length}{" "}
            {t("common.items", lang)}
          </p>
        </header>

        <form className="ph-search" role="search" onSubmit={search} data-in>
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

        <ul className="ph-cats">
          {topCategories.slice(0, CATS_SHOWN).map((c) => (
            <li key={c.slug} data-in>
              <Link className="ph-cat" to={categoryPath(lang, c.slug)}>
                <span className="ph-cat__img">
                  <Img file={c.image} alt="" sizes="46vw" fit="contain" />
                </span>
                <span className="ph-cat__name">{pick(c.title, lang)}</span>
                <span className="ph-cat__n">{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link className="ph-more" to={`/${lang}/catalog`} data-in>
          <span>
            {t("catalog.all", lang)}
            <small>
              {topCategories.length} {t("common.sections", lang)}
            </small>
          </span>
          <Arrow />
        </Link>
      </section>

      {/* ── подбор по задаче ── */}
      <section className="ph-sec ph-sec--tint" data-ground="paper">
        <header className="ph-head" data-in>
          <p className="ph-kicker">{t("search.help", lang)}</p>
          <h2 className="ph-h2">{t("task.title", lang)}</h2>
          <p className="ph-lead">{t("task.lead", lang)}</p>
        </header>
        <div className="ph-tasks" data-in>
          <TaskPicker lang={lang} />
        </div>
      </section>

      {/* ── производство ── */}
      <section className="ph-sec" data-ground="paper">
        <header className="ph-head" data-in>
          <p className="ph-kicker">{t("home.production", lang)}</p>
          <h2 className="ph-h2">Из листа в опору</h2>
        </header>
        <ol className="ph-steps">
          {STEPS.map((s) => {
            const body = (
              <>
                <span className="ph-step__img">
                  <Img file={s.photo} alt="" sizes="46vw" fit="cover" />
                  <span className="ph-step__no">{s.no}</span>
                </span>
                <span className="ph-step__t">{s.title}</span>
              </>
            );
            return (
              <li key={s.no} data-in>
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

      {/* ── масштаб: тёмная карточка ── */}
      <section className="ph-sec" data-ground="paper">
        <div className="ph-proof" data-in>
          <p className="ph-kicker ph-kicker--lit">{t("home.partners", lang)}</p>
          {/* обе фразы — дословно из публикации о компании на elto.kz */}
          <h2 className="ph-proof__h">Установлены во всех областных центрах и крупных городах</h2>
          <p className="ph-proof__p">
            Оборудованием укомплектованы тысячи энергетических объектов не только в
            Казахстане, но и странах СНГ.
          </p>
          <dl className="ph-stats">
            <div>
              <dt>Год основания</dt>
              <dd>2014</dd>
            </div>
            <div>
              <dt>{t("common.sections", lang)}</dt>
              <dd>{topCategories.length}</dd>
            </div>
            <div>
              <dt>{t("common.items", lang)}</dt>
              <dd>{products.length}</dd>
            </div>
          </dl>
        </div>

        {partners.length > 0 && (
          <div className="ph-logos" aria-label={t("home.partners", lang)}>
            {/* лента из двух одинаковых половин: сдвиг на половину — бесшовный круг */}
            <ul className="ph-logos__track">
              {[...partners, ...partners].map((p, i) => (
                <li key={p.slug + i} aria-hidden={i >= partners.length}>
                  <Img file={p.image} alt={i < partners.length ? p.title : ""} sizes="120px" fit="contain" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ── почему ELTO ── */}
      <section className="ph-sec ph-sec--tint" data-ground="paper">
        <header className="ph-head" data-in>
          <p className="ph-kicker">{t("home.why", lang)}</p>
          <h2 className="ph-h2">Работа с производителем, без посредников</h2>
        </header>
        <ul className="ph-why">
          {advantages.map((p) => (
            <li key={p!.s} data-in>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4.5 10.5l3.5 3.5 7.5-8" />
              </svg>
              {pick(p!.t, lang)}
            </li>
          ))}
        </ul>
      </section>

      {/* ── новости ── */}
      {news.length > 0 && (
        <section className="ph-sec" data-ground="paper">
          <header className="ph-head ph-head--row" data-in>
            <div>
              <p className="ph-kicker">{t("home.news", lang)}</p>
              <h2 className="ph-h2">{t("home.news", lang)}</h2>
            </div>
            <Link className="ph-chip-link" to={`/${lang}/news`}>
              {t("common.all", lang)}
            </Link>
          </header>
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

      {/* ── связь ── */}
      <section className="ph-contact" data-ground="dark" id="contact">
        <div className="ph-contact__glow" aria-hidden="true" />
        <p className="ph-kicker ph-kicker--lit" data-in>
          {t("cta.quote", lang)}
        </p>
        <h2 className="ph-contact__h" data-in>
          {t("home.final", lang)}
        </h2>
        <p className="ph-contact__p" data-in>
          {t("home.final.lead", lang)}
        </p>
        <button type="button" className="ph-btn ph-btn--solid ph-btn--wide" onClick={() => openLead()}>
          {t("cta.quote", lang)}
          <Arrow />
        </button>
        <div className="ph-contact__row" data-in>
          <a className="ph-btn ph-btn--glass" href={PHONE_HREF}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M6 2.5l2.5 4-2 1.6a10 10 0 0 0 5.4 5.4l1.6-2 4 2.5-1.2 3A2 2 0 0 1 14.4 18 13.5 13.5 0 0 1 2 5.6a2 2 0 0 1 1-1.9z" />
            </svg>
            {t("cta.call", lang)}
          </a>
          <a className="ph-btn ph-btn--glass" href={whatsappHref()} target="_blank" rel="noreferrer noopener">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 17l1.2-3.6A7.5 7.5 0 1 1 7 16.2zM7.5 7c0 3 2.5 5.5 5.5 5.5" />
            </svg>
            WhatsApp
          </a>
        </div>
        <dl className="ph-contact__list" data-in>
          <div>
            <dt>{t("contacts.phone", lang)}</dt>
            <dd>
              <a href={PHONE_HREF}>{PHONE}</a>
            </dd>
          </div>
          <div>
            <dt>{t("contacts.email", lang)}</dt>
            <dd>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </dd>
          </div>
          <div>
            <dt>{t("contacts.address", lang)}</dt>
            <dd>
              {ADDRESS_LINES[0]}, {ADDRESS_LINES[1]}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
