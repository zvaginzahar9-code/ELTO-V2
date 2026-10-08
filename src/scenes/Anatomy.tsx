/**
 * СЦЕНА 03 — ИЗДЕЛИЕ
 *
 * Опора собирается на глазах: анкерные болты, фланец, секции ствола,
 * кронштейн, светильник встают на место по мере прокрутки. Опора стоит в
 * стеклянной витрине, а поток идёт наискось за стеклом — из правого
 * верхнего угла в левый нижний — и стекло его размывает. Кадр снят на
 * светлом фоне; здесь он вывернут в негатив и сложен со стеклом по
 * screen: фон растворяется, остаётся сама сталь.
 *
 * Когда узел встаёт на место, от него вычерчивается выноска, как на
 * сборочном чертеже, — и ведёт в раздел каталога, где этот узел лежит.
 * Выноски — один таймлайн anime.js, который прокрутка перематывает
 * вперёд и назад (seek): линия чертится, подпись проявляется лесенкой.
 *
 * Слева — «Преимущество» с главной оригинала. Не список, а один пункт
 * за раз крупным набором: сменился этап сборки — номер и формулировка
 * выкатываются из-под маски, прежние уходят вверх. Шкала из шести
 * делений под ними заполняется вместе со сборкой.
 */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createTimeline, svg, stagger } from "animejs";
import ScrollSequence, { type SequenceHandle } from "@/components/motion/ScrollSequence";
import Title from "@/components/motion/Title";
import { MEDIA } from "@/motion/media";
import { registerScene, span } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";
import { useFlowStop } from "@/motion/use-flow";
import { assemblyFlow } from "./flow-shapes";
import { categoryOf, pages } from "@/lib/data";
import { categoryPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";

/**
 * Выноски: раздел каталога, момент сборки, когда узел встаёт на место,
 * и высота узла в кадре (доля от верха) — по конечному кадру ролика.
 */
const CALLOUTS = [
  { slug: "svetodiodnye-svetilniki", at: 0.84, y: 0.13, side: "right" },
  { slug: "kronshteyny-opor-osveshcheniya", at: 0.66, y: 0.27, side: "right" },
  { slug: "opory-osveshcheniya-granyonye", at: 0.42, y: 0.56, side: "right" },
  { slug: "zakladnye-detali-fundamenta", at: 0.14, y: 0.9, side: "right" },
]
  .map((c) => ({ ...c, cat: categoryOf(c.slug) }))
  .filter((c) => c.cat);

/** Блок «Преимущество» с главной оригинала — шесть пунктов, в его порядке. */
const ADVANTAGES = [
  "качество-продукции",
  "высокий-уровень-обслуживания",
  "оптимальная-цена-на-продукцию",
  "содействие-в-представлении-инженерных-решений",
  "короткие-сроки-выполнения-заказа",
  "гарантийное-и-сервисное-обслуживание",
]
  .map((s) => pages.find((p) => p.s === s))
  .filter((p): p is (typeof pages)[number] => Boolean(p));

const pad = (n: number) => String(n).padStart(2, "0");

export default function Anatomy({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const seq = useRef<SequenceHandle>(null);
  const shot = MEDIA.sborka;
  const ready = (shot.portraitSeq.count ?? 0) > 1;
  useFlowStop(root, assemblyFlow);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const tags = Array.from(el.querySelectorAll<HTMLElement>(".anat__tag"));
    const rolls = Array.from(el.querySelectorAll<HTMLElement>(".anat__roll"));
    const ticks = Array.from(el.querySelectorAll<HTMLElement>(".anat__scale i"));
    const n = ADVANTAGES.length;
    let shown = 0;
    // в кадре один пункт: прежние ушли вверх, следующие ждут под маской
    const focus = (i: number) => {
      if (i === shown) return;
      shown = i;
      rolls.forEach((roll) =>
        Array.from(roll.children).forEach((c, k) =>
          c.setAttribute("data-at", k < i ? "past" : k === i ? "on" : "next")
        )
      );
    };

    if (reducedMotion()) {
      seq.current?.draw(1);
      tags.forEach((t) => t.style.setProperty("--on", "1"));
      ticks.forEach((t) => t.style.setProperty("--f", "1"));
      return;
    }

    // Таймлайн выносок: 1000 мс на всю сборку, каждая выноска стартует
    // в момент, когда её узел встаёт на место, — и прокрутка его листает.
    const tl = createTimeline({ autoplay: false, defaults: { ease: "out(3)" } });
    CALLOUTS.forEach((c, i) => {
      const tag = tags[i];
      if (!tag) return;
      const lines = svg.createDrawable(tag.querySelector("path")!);
      const words = tag.querySelectorAll(".anat__t > *");
      tl.add(lines, { draw: ["0 0", "0 1"], duration: 140 }, c.at * 1000)
        .add(tag.querySelector(".anat__dot")!, { scale: [0, 1], opacity: [0, 1], duration: 80 }, c.at * 1000)
        .add(
          words,
          { opacity: [0, 1], translateY: ["0.6em", "0em"], filter: ["blur(6px)", "blur(0px)"], duration: 160, delay: stagger(40) },
          c.at * 1000 + 70
        );
    });
    // таймлайн длиной ровно в сборку: 0 мс — детали врозь, 1000 мс — опора стоит
    tl.add({ v: 0 }, { v: 1, duration: 1 }, 999);

    const off = registerScene(el, {
      mode: "cover",
      onUpdate(p) {
        const build = span(p, 0.06, 0.82);
        seq.current?.draw(build);
        tl.seek(build * 1000, true);
        focus(Math.min(n - 1, Math.floor(build * n)));
        ticks.forEach((t, k) => t.style.setProperty("--f", Math.min(1, Math.max(0, build * n - k)).toFixed(3)));
      },
    });
    return () => {
      off();
      tl.revert();
    };
  }, []);

  return (
    <section id="anatomy" ref={root} className="scene anat" data-ground="paper">
      <div className="anat__stage">
        <div className="shell anat__inner">
          <div className="anat__copy">
            <Title className="anat__title" text={t("home.advantage", lang)} />
            {/* для чтения с экрана — обычный список, анимация только для глаз */}
            <ol className="sr-only">
              {ADVANTAGES.map((p) => (
                <li key={p.s}>{pick(p.t, lang)}</li>
              ))}
            </ol>
            <div className="anat__adv" aria-hidden="true">
              <div className="anat__num">
                <span className="anat__roll anat__roll--num">
                  {ADVANTAGES.map((p, k) => (
                    <span key={p.s} data-at={k === 0 ? "on" : "next"}>
                      {pad(k + 1)}
                    </span>
                  ))}
                </span>
                <span className="anat__of">/{pad(ADVANTAGES.length)}</span>
              </div>
              <p className="anat__roll anat__roll--text">
                {ADVANTAGES.map((p, k) => (
                  <span key={p.s} data-at={k === 0 ? "on" : "next"}>
                    {pick(p.t, lang)}
                  </span>
                ))}
              </p>
              <div className="anat__scale">
                {ADVANTAGES.map((p) => (
                  <i key={p.s} />
                ))}
              </div>
            </div>
          </div>

          <div className="anat__frame">
            <div className="anat__glass bezel">
              <div className="bezel__core anat__core">
                <div className="anat__plate">
                  {ready ? (
                    <ScrollSequence
                      ref={seq}
                      spec={shot.portraitSeq}
                      mobileSpec={shot.portraitMobileSeq}
                      poster={shot.portraitPoster}
                      className="fill"
                    />
                  ) : (
                    <img className="fill" src={shot.portraitPoster} alt="" aria-hidden="true" />
                  )}
                </div>
              </div>
            </div>

            <ul className="anat__tags">
              {CALLOUTS.map((c) => (
                <li
                  key={c.slug}
                  className={"anat__tag anat__tag--" + c.side}
                  style={{ top: `${c.y * 100}%` }}
                >
                  <span className="anat__dot" aria-hidden="true" />
                  <svg className="anat__line" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
                    <path d={c.side === "right" ? "M0 10 L40 10 L60 2 L100 2" : "M100 10 L60 10 L40 2 L0 2"} />
                  </svg>
                  <Link className="anat__t" to={categoryPath(lang, c.slug)}>
                    <span className="anat__name">{pick(c.cat!.title, lang)}</span>
                    <span className="anat__count">{c.cat!.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
