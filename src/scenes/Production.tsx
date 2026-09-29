/**
 * СЦЕНА 03 — ИЗ ЛИСТА В ОПОРУ
 *
 * Единственная горизонтальная сцена на сайте, и она горизонтальна по делу:
 * производство ELTO — это линия, по которой лист металла последовательно
 * превращается в опору. Вертикальная прокрутка ведёт камеру вдоль этой линии.
 *
 * Все четыре этапа и их описания — реальные страницы услуг elto.kz; текст
 * взят дословно. Плиты — метафоры этапов в мире ARGON: плазма режет лист,
 * лист складывается в восьмигранник, секции входят «конус в конус», цинк
 * расцветает кристаллами. Пока петля не отрендерена, плита держит заводскую
 * фотографию.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/motion/Reveal";
import AmbientVideo from "@/components/motion/AmbientVideo";
import Img from "@/components/ui/Img";
import { MEDIA } from "@/motion/media";
import { registerScene } from "@/motion/scene";
import { useReducedMotion } from "@/motion/use-reduced-motion";
import { PHONE, useMedia } from "@/motion/use-media";
import { loadProduct } from "@/lib/data";
import { productPath } from "@/lib/routes";
import { t, type Lang } from "@/lib/i18n";
import mediaCounts from "@/data/media.json";

type Stage = {
  no: string;
  slug?: string;
  title: string;
  /** ключ сгенерированной плиты-петли, если она уже отрендерена */
  shot?: keyof typeof MEDIA;
  photo: string;
  /** запасной текст, если страницы услуги нет */
  text?: string;
};

const STAGES: Stage[] = [
  {
    no: "01",
    slug: "plazmennaya-rezka-metalla",
    title: "Плазменная резка металла",
    shot: "rez",
    photo: "rezka_katochka.jpg",
  },
  {
    no: "02",
    slug: "gibka-metalla",
    title: "Гибка металла",
    shot: "gib",
    photo: "gibka_katochka.jpg",
  },
  {
    no: "03",
    title: "Сборка и сварка",
    shot: "styk",
    photo: "1_11.jpg",
    text:
      "Сборка секций осуществляется посадкой одной секции в другую методом «конус в конус» " +
      "на расстоянии порядка 1м. Стяжка секций производится со значительным возрастающим " +
      "усилием, порядка 1,5 -2 тонн, что обеспечивает надёжное и неразборное соединение за " +
      "счёт заклинивания граней смежных секций между собой, без необходимости сварных работ.",
  },
  {
    no: "04",
    slug: "uslugi-goryachego-cinkovaniya",
    title: "Услуги горячего цинкования",
    shot: "zinc",
    photo: "img_20250818_155550_1.jpg",
  },
];

const counts = mediaCounts as Record<string, number | undefined>;
const hasLoop = (key?: keyof typeof MEDIA) => !!key && (counts[`${key}-loop`] ?? 0) > 0;

/** Первый содержательный абзац описания услуги — без служебного «Описание:». */
function useStageText() {
  const [text, setText] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    Promise.all(
      STAGES.filter((s) => s.slug).map((s) =>
        loadProduct(s.slug!)
          .then((p) => [s.slug!, p.body.ru] as const)
          .catch(() => [s.slug!, ""] as const)
      )
    ).then((rows) => {
      if (!alive) return;
      const out: Record<string, string> = {};
      for (const [slug, body] of rows) {
        const para = body
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 60 && !/^описание:?$/i.test(l));
        out[slug] = para[0] ?? "";
      }
      setText(out);
    });
    return () => {
      alive = false;
    };
  }, []);
  return text;
}

export default function Production({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const body = useStageText();
  const reduced = useReducedMotion();
  /*
   * На телефоне лента не едет по вертикальной прокрутке: четыре экрана
   * закреплённого кадра, где палец тянет вниз, а картинка уходит вбок, —
   * это борьба с жестом. Там она листается пальцем, как карусель, а
   * вертикальная прокрутка просто идёт дальше.
   */
  const phone = useMedia(PHONE);
  const swipe = reduced || phone;
  const [current, setCurrent] = useState(0);

  // карусель: полоса прогресса и номер этапа идут за пальцем
  useEffect(() => {
    const tr = track.current;
    if (!tr || !swipe) return;
    const onScroll = () => {
      const max = tr.scrollWidth - tr.clientWidth;
      const p = max > 0 ? tr.scrollLeft / max : 0;
      if (rail.current) rail.current.style.transform = `scaleX(${Math.max(p, 1 / STAGES.length)})`;
      setCurrent(Math.round(p * (STAGES.length - 1)));
    };
    onScroll();
    tr.addEventListener("scroll", onScroll, { passive: true });
    return () => tr.removeEventListener("scroll", onScroll);
  }, [swipe]);

  const goTo = (i: number) => {
    const tr = track.current;
    const card = tr?.querySelectorAll<HTMLElement>(".stage")[i];
    if (tr && card) tr.scrollTo({ left: card.offsetLeft - tr.offsetLeft - 16, behavior: "smooth" });
  };

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || swipe) return;

    const panels = Array.from(tr.querySelectorAll<HTMLElement>(".stage"));

    const off = registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        // линия едет влево ровно на свою избыточную ширину
        const travel = tr.scrollWidth - window.innerWidth;
        tr.style.transform = `translate3d(${-(travel * p).toFixed(2)}px, 0, 0)`;
        if (rail.current) rail.current.style.transform = `scaleX(${p})`;

        // этап, который сейчас в кадре, светится ярче соседей
        const each = 1 / panels.length;
        panels.forEach((panel, i) => {
          const centre = (i + 0.5) * each;
          const near = 1 - Math.min(1, Math.abs(p - centre) / each);
          panel.style.setProperty("--near", near.toFixed(3));
        });
      },
    });
    // окно сузили до телефона — лента становится каруселью без следов сцены
    return () => {
      off();
      tr.style.transform = "";
      panels.forEach((panel) => panel.style.removeProperty("--near"));
    };
  }, [swipe]);

  return (
    <section
      id="production"
      ref={root}
      className="scene production ground-paper"
      data-ground="paper"
      /* без анимации и на телефоне лента не едет сама — тогда она становится
         обычной прокручиваемой полосой, иначе три этапа из четырёх недостижимы */
      data-static={swipe ? "true" : "false"}
      style={swipe ? undefined : { height: `${STAGES.length * 100}vh` }}
    >
      <div className="production__stage">
        <header className="production__head shell">
          <span className="index">03 — {t("home.production", lang)}</span>
          <Reveal as="h2" className="production__title display" kind="lines">
            Из листа в опору
          </Reveal>
        </header>

        <div className="production__track" ref={track}>
          {STAGES.map((s) => {
            const text = s.slug ? body[s.slug] || "" : s.text || "";
            const loop =
              hasLoop(s.shot) && s.shot
                ? (MEDIA[s.shot] as { video: string; mobile: string; poster: string })
                : null;
            return (
              <article className="stage" key={s.no}>
                <div className="stage__plate">
                  {loop ? (
                    <AmbientVideo
                      src={loop.video}
                      mobileSrc={loop.mobile}
                      poster={loop.poster}
                      className="fill stage__video"
                    />
                  ) : (
                    <Img
                      file={s.photo}
                      alt={s.title}
                      sizes="(max-width: 980px) 88vw, 40vw"
                      fit="cover"
                    />
                  )}
                  <span className="stage__no mono">{s.no}</span>
                </div>
                <div className="stage__text">
                  <h3 className="stage__h title">{s.title}</h3>
                  <p className="stage__p">{text}</p>
                  {s.slug && (
                    <Link className="btn" to={productPath(lang, s.slug)}>
                      {t("common.more", lang)}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="production__rail" aria-hidden="true">
          <span ref={rail} />
        </div>

        {swipe && (
          <div className="production__pager shell">
            <span className="mono production__count">
              {STAGES[current].no} <i>/ {STAGES[STAGES.length - 1].no}</i>
            </span>
            <div className="production__dots">
              {STAGES.map((s, i) => (
                <button
                  key={s.no}
                  type="button"
                  className="production__dot"
                  aria-label={s.title}
                  aria-current={i === current}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
