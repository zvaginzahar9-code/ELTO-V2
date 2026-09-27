/**
 * Шапка.
 *
 * Навигация не аттракцион: знак, каталог, несколько разделов, телефон, язык
 * и заявка — всё читается сразу. Каталог стоит первым и отмечен иначе, чем
 * остальные пункты: за ним приходят чаще всего. Остальные пункты меню
 * оригинала живут в полноэкранной панели, она открывается на любой ширине.
 *
 * Движения ровно столько, сколько помогает: линия прогресса, уход шапки при
 * прокрутке вниз и возврат при обратном движении, смена грунта над светлой
 * секцией.
 *
 * Подписи пунктов взяты с оригинала на соответствующем языке.
 */

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { animate, stagger } from "animejs";
import { LANGS, LANG_LABEL, t, type Lang } from "@/lib/i18n";
import { site } from "@/lib/data";
import { toRoute } from "@/lib/routes";
import { EMAIL, PHONE, PHONE_HREF, whatsappHref } from "@/lib/contacts";
import { lockScroll, reducedMotion } from "@/motion/clock";
import Logo from "@/components/ui/Logo";
import { useLead } from "@/components/lead/LeadProvider";

/** Пункты, которые стоят в строке шапки; остальное — в панели меню. */
const PRIMARY = ["/about", "/partners", "/news", "/contacts"];

export default function Nav({ lang }: { lang: Lang }) {
  const bar = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [onPaper, setOnPaper] = useState(false);
  const location = useLocation();
  const openLead = useLead();

  const menu = ((site.menu[lang]?.length ? site.menu[lang] : site.menu.ru) ?? []).map(
    (m) => ({
      ...m,
      to: toRoute(m.href, lang),
    })
  );
  const primary = menu.filter((m) => PRIMARY.some((p) => m.to === `/${lang}${p}`));

  // Меню закрывается при переходе — в том числе по кнопке «назад» браузера.
  // Правка состояния во время рендера, а не в эффекте: эффект дал бы лишний
  // кадр с уже открытым меню поверх новой страницы.
  const [shownFor, setShownFor] = useState(location.pathname);
  if (shownFor !== location.pathname) {
    setShownFor(location.pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* прогресс, направление прокрутки, плотность фона */
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      setSolid(y > 24);
      setHidden(y > 320 && y > last + 4);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* грунт под шапкой: светлая секция — тёмные буквы */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting)
            setOnPaper(e.target.getAttribute("data-ground") === "paper");
        }
      },
      { rootMargin: "-1px 0px -99% 0px", threshold: 0 }
    );
    const watch = () =>
      document.querySelectorAll("[data-ground]").forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [location.pathname]);

  /* раскрытие меню: пункты приходят лесенкой, а не проявляются пачкой */
  useEffect(() => {
    if (!open || !panel.current || reducedMotion()) return;
    const items = panel.current.querySelectorAll(".menu__item");
    const a = animate(items, {
      y: ["1.1em", "0em"],
      opacity: [0, 1],
      duration: 700,
      delay: stagger(45, { start: 80 }),
      ease: "out(3)",
    });
    return () => {
      a.revert();
    };
  }, [open]);

  return (
    <>
      <header
        className="nav"
        data-hidden={hidden && !open ? "true" : "false"}
        data-solid={solid ? "true" : "false"}
        data-paper={onPaper && !open ? "true" : "false"}
        data-open={open ? "true" : "false"}
      >
        <div className="nav__inner shell">
          <Link to={`/${lang}`} className="nav__logo" aria-label="ELTO">
            <Logo tagline={false} />
          </Link>

          <nav className="nav__links" aria-label={t("a11y.mainnav", lang)}>
            <NavLink
              to={`/${lang}/catalog`}
              className={({ isActive }) => "nav__cat" + (isActive ? " is-active" : "")}
            >
              <span className="nav__cat-grid" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              {t("cta.catalog", lang)}
            </NavLink>
            {primary.map((m) => (
              <NavLink
                key={m.href + m.text}
                to={m.to}
                className={({ isActive }) => "nav__link" + (isActive ? " is-active" : "")}
              >
                {m.text}
              </NavLink>
            ))}
          </nav>

          <div className="nav__side">
            <a className="nav__phone mono" href={PHONE_HREF}>
              {PHONE}
            </a>
            <div className="nav__langs" role="group" aria-label={t("a11y.langs", lang)}>
              {LANGS.map((l) => (
                <Link
                  key={l}
                  to={location.pathname.replace(/^\/[^/]+/, `/${l}`) + location.search}
                  className={"nav__lang" + (l === lang ? " is-active" : "")}
                  hrefLang={l}
                  aria-current={l === lang ? "true" : undefined}
                >
                  {LANG_LABEL[l]}
                </Link>
              ))}
            </div>
            <button
              type="button"
              className="btn btn--solid nav__cta"
              onClick={() => openLead()}
            >
              {t("cta.quote", lang)}
            </button>
            <button
              type="button"
              className="nav__burger"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-panel"
            >
              <span className="nav__burger-label mono">
                {open ? t("nav.close", lang) : t("nav.menu", lang)}
              </span>
              <span className="nav__burger-lines" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
        <span className="nav__progress" aria-hidden="true">
          <span ref={bar} />
        </span>
      </header>

      <div
        id="menu-panel"
        ref={panel}
        className="menu"
        data-open={open ? "true" : "false"}
        hidden={!open}
        data-lenis-prevent
      >
        <div className="menu__inner shell">
          <ul className="menu__list">
            {menu.map((m, i) => (
              <li className="menu__item" key={m.href + m.text}>
                <Link to={m.to} className="menu__link">
                  <span className="menu__no mono">{String(i + 1).padStart(2, "0")}</span>
                  {m.text}
                </Link>
              </li>
            ))}
          </ul>
          <div className="menu__foot">
            <button
              type="button"
              className="btn btn--solid"
              onClick={() => {
                setOpen(false);
                openLead();
              }}
            >
              {t("cta.quote", lang)}
            </button>
            <a className="mono" href={PHONE_HREF}>
              {PHONE}
            </a>
            <a className="mono" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
            <a href={whatsappHref()} target="_blank" rel="noreferrer noopener">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
