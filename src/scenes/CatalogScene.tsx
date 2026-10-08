/**
 * СЦЕНА 06 — КАТАЛОГ
 *
 * После знака поток разгоняется: широкий быстрый веер справа, по которому
 * бегут искры, — каталог читается как поток данных. Семнадцать разделов
 * оригинала въезжают строками, каждая со своим запаздыванием, прокрутка
 * задаёт скорость. Под курсором строка загорается, к ней тянется свет
 * потока, а рядом с курсором летит превью раздела — фотография изделия
 * на белом стенде, как в каталоге.
 *
 * Названия, порядок и счётчики позиций — из выгрузки каталога оригинала.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Img from "@/components/ui/Img";
import Pill from "@/components/ui/Pill";
import Title from "@/components/motion/Title";
import { registerScene } from "@/motion/scene";
import { onFrame, reducedMotion } from "@/motion/clock";
import { flowAttract } from "@/motion/flow";
import { useFlowStop } from "@/motion/use-flow";
import { streamFlow } from "./flow-shapes";
import { topCategories } from "@/lib/data";
import { categoryPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";

export default function CatalogScene({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  /** превью показывается только под мышью: при клавиатуре ему негде стоять */
  const [pointer, setPointer] = useState(false);
  useFlowStop(root, streamFlow);

  /* строки въезжают потоком — каждая со своим запаздыванием */
  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>(".cat__row"));
    return registerScene(el, {
      mode: "enter",
      onUpdate(p) {
        rows.forEach((row, i) => {
          const a = 0.06 + i * 0.012;
          const v = Math.min(1, Math.max(0, (p - a) / 0.14));
          const e = 1 - Math.pow(1 - v, 3);
          row.style.setProperty("--in", e.toFixed(3));
        });
      },
    });
  }, []);

  /* превью летит за курсором и наклоняется по скорости */
  useEffect(() => {
    const card = preview.current;
    const el = root.current;
    if (!card || !el) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let off: (() => void) | null = null;
    // превью тикает в общем такте сайта, а не своим циклом
    const tick = () => {
      const dx = tx - x;
      x += dx * 0.16;
      y += (ty - y) * 0.16;
      const tilt = Math.max(-12, Math.min(12, dx * 0.08));
      card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
    };
    const onMove = (e: PointerEvent) => {
      // превью идёт за курсором по высоте, но стоит справа от названий,
      // а по горизонтали лишь чуть тянется к курсору
      const lr = (e.currentTarget as HTMLElement).getBoundingClientRect();
      tx = lr.right + 48 + (e.clientX - lr.left) * 0.04;
      ty = e.clientY - 150;
      if (!off) {
        x = tx;
        y = ty;
        off = onFrame(tick);
        setPointer(true);
      }
    };
    const list = el.querySelector(".cat__list");
    const leave = () => {
      off?.();
      off = null;
      setPointer(false);
      setActive(-1);
      flowAttract(null);
    };
    list?.addEventListener("pointermove", onMove as EventListener);
    list?.addEventListener("pointerleave", leave);
    return () => {
      off?.();
      list?.removeEventListener("pointermove", onMove as EventListener);
      list?.removeEventListener("pointerleave", leave);
      flowAttract(null);
    };
  }, []);

  const focusRow = (i: number, node: HTMLElement) => {
    setActive(i);
    // замер на следующем кадре: фокус с клавиатуры сначала прокручивает строку в кадр
    requestAnimationFrame(() => {
      const r = node.getBoundingClientRect();
      flowAttract([0.7, (r.top + r.height / 2) / window.innerHeight]);
    });
  };

  const [first, ...rest] = t("catalog.title", lang).split(" ");

  return (
    <section id="catalog" ref={root} className="scene cat" data-ground="paper">
      <div className="shell cat__inner">
        <header className="cat__head">
          <Title className="cat__title" text={rest.length ? `${first} *${rest.join(" ")}*` : first} />
          <Pill tone="glass" to={`/${lang}/catalog`}>
            {t("common.more", lang)}
          </Pill>
        </header>

        <ol className="cat__list">
          {topCategories.map((c, i) => (
            <li key={c.slug} className={"cat__row" + (i === active ? " is-on" : "")}>
              <Link
                className="cat__link"
                to={categoryPath(lang, c.slug)}
                onPointerEnter={(e) => focusRow(i, e.currentTarget)}
                onFocus={(e) => focusRow(i, e.currentTarget)}
                onBlur={() => {
                  setActive(-1);
                  flowAttract(null);
                }}
              >
                <span className="cat__name">{pick(c.title, lang)}</span>
                <span className="cat__count">{c.count}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <div className={"cat__preview" + (active > -1 && pointer ? " is-on" : "")} ref={preview} aria-hidden="true">
        <div className="cat__preview-core">
          {topCategories.map((c, i) => (
            <figure key={c.slug} className={"cat__shot" + (i === active ? " is-on" : "")}>
              <Img file={c.image} alt="" sizes="280px" fit="contain" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
