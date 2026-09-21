/**
 * Шапка.
 *
 * Навигация не аттракцион: логотип, разделы, язык, телефон — и всё это
 * читается сразу. Движения ровно столько, сколько помогает: волосяная линия
 * прогресса, уход шапки вниз по прокрутке и возврат при обратном движении,
 * да смена грунта, когда под шапкой светлая секция.
 *
 * Подписи пунктов взяты с оригинала на соответствующем языке.
 */

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { animate, stagger } from "animejs";
import { LANGS, LANG_LABEL, t, type Lang } from "@/lib/i18n";
import { site } from "@/lib/data";
import { toRoute } from "@/lib/routes";
import { lockScroll, reducedMotion } from "@/motion/clock";

const PHONE = "+7 700 370 07 04";
const PHONE_HREF = "tel:+77003700704";

export default function Nav({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [onPaper, setOnPaper] = useState(false);
  const location = useLocation();

  const menu = (site.menu[lang]?.length ? site.menu[lang] : site.menu.ru) ?? [];

  // Меню закрывается при переходе — в том числе по кнопке «назад» браузера.
  // Правка состояния во время рендера, а не в эффекте: эффект дал бы лишний
  // кадр с уже открытым меню поверх новой страницы.
  const [shownFor, setShownFor] = useState(location.pathname);
  if (shownFor !== location.pathname) {
    setShownFor(location.pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    lockScroll(open);
    return () => lockScroll(false);
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
          if (e.isIntersecting) setOnPaper(e.target.getAttribute("data-ground") === "paper");
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
    animate(items, {
      y: ["1.1em", "0em"],
      opacity: [0, 1],
      duration: 700,
      delay: stagger(45, { start: 80 }),
      ease: "out(3)",
    });
  }, [open]);

  return (
    <>
      <header
        ref={root}
        className="nav"
        data-hidden={hidden ? "true" : "false"}
        data-solid={solid ? "true" : "false"}
        data-paper={onPaper && !open ? "true" : "false"}
        data-open={open ? "true" : "false"}
      >
        <div className="nav__inner shell">
          <Link to={`/${lang}`} className="nav__logo" aria-label="ELTO">
            <img src="/logo_elto-1.svg" alt="" width={299} height={111} />
          </Link>

          <nav className="nav__links" aria-label={t("a11y.mainnav", lang)}>
            {menu.map((m) => (
              <NavLink
                key={m.href + m.text}
                to={toRoute(m.href, lang)}
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
                >
                  {LANG_LABEL[l]}
                </Link>
              ))}
            </div>
            <button
              className="nav__burger"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-panel"
            >
              <span className="sr-only">{open ? t("nav.close", lang) : t("nav.menu", lang)}</span>
              <i />
              <i />
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
      >
        <div className="menu__inner shell">
          <ul className="menu__list">
            {menu.map((m, i) => (
              <li className="menu__item" key={m.href + m.text}>
                <Link to={toRoute(m.href, lang)} className="menu__link display">
                  <span className="menu__no mono">{String(i + 1).padStart(2, "0")}</span>
                  {m.text}
                </Link>
              </li>
            ))}
          </ul>
          <div className="menu__foot">
            <a className="menu__phone mono" href={PHONE_HREF}>
              {PHONE}
            </a>
            <a className="menu__mail mono" href="mailto:sales@elto.kz">
              sales@elto.kz
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
