/**
 * Подбор по задаче — для тех, кто не знает маркировку.
 *
 * Слева — задачи объекта, справа — разделы каталога, в которых лежат
 * подходящие изделия. При смене задачи разделы поднимаются из-под маски
 * лесенкой: движение показывает, что набор сменился, а не просто мигнул.
 * Внизу — выход на инженера, если и задача не подошла.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate, stagger } from "animejs";
import Img from "@/components/ui/Img";
import { TASKS, taskCount, taskSections } from "@/lib/tasks";
import { categoryPath } from "@/lib/routes";
import { pick, t, type Lang } from "@/lib/i18n";
import { reducedMotion } from "@/motion/clock";
import { useLead } from "@/components/lead/LeadProvider";

export default function TaskPicker({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0);
  const panel = useRef<HTMLUListElement>(null);
  const openLead = useLead();
  const task = TASKS[active];
  const sections = taskSections(task);

  useEffect(() => {
    const el = panel.current;
    if (!el || reducedMotion()) return;
    const a = animate(Array.from(el.children), {
      clipPath: ["inset(100% 0 0 0)", "inset(0% 0 0 0)"],
      y: ["1.2rem", "0rem"],
      duration: 760,
      delay: stagger(60),
      ease: "out(4)",
    });
    return () => {
      a.revert();
    };
  }, [active]);

  return (
    <div className="tasks">
      <ul className="tasks__list">
        {TASKS.map((tk, i) => (
          <li key={tk.key}>
            <button
              type="button"
              className="tasks__tab"
              aria-pressed={i === active}
              aria-controls="tasks-panel"
              onClick={() => setActive(i)}
            >
              <span className="tasks__no mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="tasks__name">{t(`task.${tk.key}`, lang)}</span>
              <span className="tasks__n mono">{taskCount(tk)}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="tasks__panel" id="tasks-panel" aria-live="polite">
        <ul className="tasks__sections" ref={panel}>
          {sections.map((c) => (
            <li key={c.slug}>
              <Link to={categoryPath(lang, c.slug)} className="tasks__sect">
                <span className="tasks__shot">
                  <Img
                    file={c.image}
                    alt=""
                    sizes="(max-width: 860px) 40vw, 14vw"
                    fit="contain"
                  />
                </span>
                <span className="tasks__sect-h">{pick(c.title, lang)}</span>
                <span className="tasks__sect-n mono">
                  {c.count} {t("common.items", lang)} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="link-arrow tasks__help"
          onClick={() =>
            openLead({ mode: "consult", topic: t(`task.${task.key}`, lang) })
          }
        >
          <span>{t("cta.consult", lang)}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
