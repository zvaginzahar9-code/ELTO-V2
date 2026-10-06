/**
 * СЦЕНА 03 — ИЗ ЛИСТА В ОПОРУ
 *
 * Производство ELTO — линия, по которой лист металла последовательно
 * превращается в опору. Кадр закреплён, прокрутка ведёт по этапам: слева
 * экран, где плиты этапов сменяют друг друга шторкой снизу вверх с
 * наездом из глубины, справа — список этапов, где текущий стоит в полный
 * голос, а пройденные и будущие приглушены. Под кадром аргоновая дуга
 * ложится линией реза — тот же свет, что был опорой в манифесте.
 *
 * Этапы и описания — реальные страницы услуг elto.kz, дословно. Плиты —
 * метафоры этапов в мире ARGON; пока петля не отрендерена, плита держит
 * заводскую фотографию.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AmbientVideo from "@/components/motion/AmbientVideo";
import Img from "@/components/ui/Img";
import { MEDIA } from "@/motion/media";
import { registerScene, span } from "@/motion/scene";
import { useReducedMotion } from "@/motion/use-reduced-motion";
import { useArcStop } from "@/motion/use-arc";
import { cutArc } from "./arc-shapes";
import { loadProduct } from "@/lib/data";
import { productPath } from "@/lib/routes";
import { t, type Lang } from "@/lib/i18n";
import mediaCounts from "@/data/media.json";

type Stage = {
  no: string;
  slug?: string;
  title: string;
  shot?: keyof typeof MEDIA;
  photo: string;
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
  const body = useStageText();
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(0);
  useArcStop(root, cutArc);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const plates = Array.from(el.querySelectorAll<HTMLElement>(".pd__plate"));
    const steps = Array.from(el.querySelectorAll<HTMLElement>(".pd__step"));
    const bar = el.querySelector<HTMLElement>(".pd__bar > span");
    const screen = el.querySelector<HTMLElement>(".pd__screen");
    const n = STAGES.length;
    let shown = 0;

    return registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        // экран въезжает из глубины в начале сцены и уходит в неё в конце
        if (screen) {
          const enter = span(p, 0, 0.1);
          const leave = span(p, 0.92, 1);
          screen.style.setProperty("--enter", enter.toFixed(3));
          screen.style.setProperty("--leave", leave.toFixed(3));
        }

        // этап i занимает свою долю сцены; шторка — на стыке долей
        const pos = span(p, 0.06, 0.94) * n;
        plates.forEach((plate, i) => {
          if (i === 0) {
            plate.style.setProperty("--wipe", "1");
          } else {
            const w = Math.min(1, Math.max(0, (pos - i + 0.18) / 0.36));
            plate.style.setProperty("--wipe", w.toFixed(3));
          }
          // уже закрытая следующей плитой уходит в глубину
          const under = Math.min(1, Math.max(0, pos - i - 0.82) / 0.36);
          plate.style.setProperty("--under", under.toFixed(3));
        });

        const idx = Math.min(n - 1, Math.floor(pos));
        steps.forEach((s, i) => s.setAttribute("data-on", String(i === idx)));
        if (bar) bar.style.transform = `scaleY(${(pos / n).toFixed(4)})`;
        if (idx !== shown) {
          shown = idx;
          setCurrent(idx);
        }
      },
    });
  }, [reduced]);

  return (
    <section
      id="production"
      ref={root}
      className="scene pd"
      data-ground="paper"
      data-static={reduced ? "true" : "false"}
    >
      <div className="pd__stage">
        <div className="shell pd__inner">
          <header className="pd__head">
            <p className="pd__kicker">{t("home.production", lang)}</p>
            <h2 className="pd__title">
              Из листа <em>в опору</em>
            </h2>
          </header>

          <div className="pd__screen">
            {STAGES.map((s, i) => {
              const loop =
                hasLoop(s.shot) && s.shot
                  ? (MEDIA[s.shot] as { video: string; mobile: string; poster: string })
                  : null;
              return (
                <div className="pd__plate" key={s.no} style={{ zIndex: i + 1 }}>
                  <div className="pd__plate-in">
                    {loop ? (
                      <AmbientVideo
                        src={loop.video}
                        mobileSrc={loop.mobile}
                        poster={loop.poster}
                        className="fill"
                      />
                    ) : (
                      <Img file={s.photo} alt={s.title} sizes="56vw" fit="cover" />
                    )}
                  </div>
                </div>
              );
            })}
            <span className="pd__count" aria-hidden="true">
              <b>{STAGES[current].no}</b> / {String(STAGES.length).padStart(2, "0")}
            </span>
          </div>

          <ol className="pd__steps">
            <span className="pd__bar" aria-hidden="true">
              <span />
            </span>
            {STAGES.map((s, i) => {
              const text = s.slug ? body[s.slug] || "" : s.text || "";
              return (
                <li className="pd__step" key={s.no} data-on={i === 0 ? "true" : "false"}>
                  <span className="pd__no">{s.no}</span>
                  <div>
                    <h3 className="pd__h">{s.title}</h3>
                    <p className="pd__p">{text}</p>
                    {s.slug && (
                      <Link className="pd__link" to={productPath(lang, s.slug)}>
                        {t("common.more", lang)}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
