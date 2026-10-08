/**
 * СЦЕНА 04 — ИЗ ЛИСТА В ОПОРУ
 *
 * Производство ELTO — линия, по которой лист металла последовательно
 * превращается в опору. Поэтому здесь поток выпрямляется в линии
 * конвейера под карточками, а прокрутка ведёт камеру вдоль них: четыре
 * этапа едут слева направо в стеклянных карточках.
 * На быстрой прокрутке карточки чуть наклоняются по ходу — линия
 * ощущается как движение массы, а не как перелистывание.
 *
 * Этапы и описания — реальные страницы услуг elto.kz, дословно. Плиты —
 * метафоры этапов в мире ARGON; пока петля не отрендерена, плита держит
 * заводскую фотографию. Нумерация здесь по делу: это настоящая
 * последовательность операций.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "@phosphor-icons/react";
import AmbientVideo from "@/components/motion/AmbientVideo";
import Img from "@/components/ui/Img";
import Title from "@/components/motion/Title";
import { MEDIA } from "@/motion/media";
import { registerScene } from "@/motion/scene";
import { useReducedMotion } from "@/motion/use-reduced-motion";
import { useFlowStop } from "@/motion/use-flow";
import { laneFlow } from "./flow-shapes";
import { loadProduct } from "@/lib/data";
import { productPath } from "@/lib/routes";
import { t, type Lang } from "@/lib/i18n";
import mediaCounts from "@/data/media.json";

type Stage = {
  no: string;
  slug?: string;
  /** ключ словаря */
  title: string;
  shot?: keyof typeof MEDIA;
  photo: string;
  /** ключ словаря — для этапа без своей страницы в каталоге */
  text?: string;
};

const STAGES: Stage[] = [
  { no: "01", slug: "plazmennaya-rezka-metalla", title: "stage.cut", shot: "rez", photo: "rezka_katochka.jpg" },
  { no: "02", slug: "gibka-metalla", title: "stage.bend", shot: "gib", photo: "gibka_katochka.jpg" },
  {
    no: "03",
    // первые слова описания из карточек ПМО оригинала
    title: "stage.assembly",
    shot: "styk",
    photo: "1_11.jpg",
    text: "stage.assembly.text",
  },
  {
    no: "04",
    slug: "uslugi-goryachego-cinkovaniya",
    title: "stage.zinc",
    shot: "zinc",
    photo: "img_20250818_155550_1.jpg",
  },
];

const counts = mediaCounts as Record<string, number | undefined>;
const hasLoop = (key?: keyof typeof MEDIA) => !!key && (counts[`${key}-loop`] ?? 0) > 0;

function useStageText(lang: Lang) {
  const [text, setText] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    Promise.all(
      STAGES.filter((s) => s.slug).map((s) =>
        loadProduct(s.slug!)
          .then((p) => [s.slug!, p.body[lang] || p.body.ru] as const)
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
  }, [lang]);
  return text;
}

export default function Production({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const body = useStageText(lang);
  const reduced = useReducedMotion();
  useFlowStop(root, laneFlow);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || reduced) return;
    const cards = Array.from(tr.querySelectorAll<HTMLElement>(".line__card"));
    const bar = el.querySelector<HTMLElement>(".line__bar > span");
    let last = 0;
    let lean = 0;

    return registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        const travel = Math.max(0, tr.scrollWidth - window.innerWidth);
        tr.style.transform = `translate3d(${(-travel * p).toFixed(1)}px, 0, 0)`;
        if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;

        // наклон по скорости: масса едет, а не листается
        const v = (p - last) * 60;
        last = p;
        lean += (Math.max(-1, Math.min(1, v)) - lean) * 0.2;

        // сначала все замеры, потом все записи — иначе браузер пересчитывает
        // раскладку на каждой карточке
        const vw = window.innerWidth;
        const centres = cards.map((card) => {
          const r = card.getBoundingClientRect();
          return (r.left + r.width / 2) / vw - 0.5;
        });
        cards.forEach((card, i) => {
          // карточка у центра стоит ровно; к краям уходит в перспективу
          card.style.setProperty("--c", centres[i].toFixed(3));
          card.style.setProperty("--lean", lean.toFixed(3));
        });
      },
    });
  }, [reduced]);

  return (
    <section
      id="production"
      ref={root}
      className="scene line"
      data-ground="paper"
      data-static={reduced ? "true" : "false"}
    >
      <div className="line__stage">
        <header className="shell line__head">
          {/* раздел каталога оригинала, в котором лежат эти четыре страницы */}
          <Title className="line__title" text={t("home.services", lang)} />
        </header>

        <div className="line__track" ref={track}>
          {STAGES.map((s) => {
            const text = s.slug ? body[s.slug] || "" : (s.text ? t(s.text, lang) : "");
            const loop =
              hasLoop(s.shot) && s.shot
                ? (MEDIA[s.shot] as { video: string; mobile: string; poster: string })
                : null;
            return (
              <article className="line__card bezel" key={s.no}>
                <div className="bezel__core line__core">
                  <div className="line__plate">
                    {loop ? (
                      <AmbientVideo src={loop.video} mobileSrc={loop.mobile} poster={loop.poster} className="fill" />
                    ) : (
                      <Img file={s.photo} alt={t(s.title, lang)} sizes="40vw" fit="cover" />
                    )}
                  </div>
                  <div className="line__text">
                    <span className="line__no">{s.no}</span>
                    <h3 className="line__h">{t(s.title, lang)}</h3>
                    <p className="line__p">{text}</p>
                    {s.slug && (
                      <Link className="line__link" to={productPath(lang, s.slug)}>
                        {t("common.more", lang)}
                        <ArrowUpRight weight="light" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="shell line__foot" aria-hidden="true">
          <span className="line__bar">
            <span />
          </span>
        </div>
      </div>
    </section>
  );
}
