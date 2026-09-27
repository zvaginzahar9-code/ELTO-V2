/**
 * Заявка из любой точки сайта.
 *
 * Шапка, герой, раздел, карточка изделия и нижняя панель телефона открывают
 * одну и ту же панель — с нужным режимом (расчёт, ТЗ, консультация) и темой.
 * Панель — нативный <dialog>: фокус заперт внутри, Esc закрывает, фон
 * недоступен для чтения с экрана. Прокрутка страницы на это время стоит.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { lockScroll } from "@/motion/clock";
import { t, type Lang } from "@/lib/i18n";
import LeadForm from "./LeadForm";
import type { LeadMode } from "./rules";

type Request = { mode?: LeadMode; topic?: string };
type Open = (r?: Request) => void;
type Ctx = { open: Open; setPageTopic: (topic: string) => void };

const LeadContext = createContext<Ctx>({ open: () => {}, setPageTopic: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export const useLead = () => useContext(LeadContext).open;

/**
 * Тема страницы по умолчанию: на карточке изделия заявка из шапки или
 * нижней панели сразу знает, о каком изделии речь.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useLeadTopic(topic: string) {
  const { setPageTopic } = useContext(LeadContext);
  useEffect(() => {
    setPageTopic(topic);
    return () => setPageTopic("");
  }, [topic, setPageTopic]);
}

export default function LeadProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [req, setReq] = useState<Required<Request> & { n: number }>({
    mode: "quote",
    topic: "",
    n: 0,
  });
  const [open, setOpen] = useState(false);
  const pageTopic = useRef("");

  const openLead = useCallback<Open>((r) => {
    // новый ключ формы на каждое открытие: прошлый статус «отправлено» не остаётся
    setReq((prev) => ({
      mode: r?.mode ?? "quote",
      topic: r?.topic ?? pageTopic.current,
      n: prev.n + 1,
    }));
    setOpen(true);
  }, []);

  const setPageTopic = useCallback((topic: string) => {
    pageTopic.current = topic;
  }, []);
  const ctx = useMemo(() => ({ open: openLead, setPageTopic }), [openLead, setPageTopic]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    lockScroll(open);
  }, [open]);

  useEffect(() => () => lockScroll(false), []);

  return (
    <LeadContext.Provider value={ctx}>
      {children}
      <dialog
        ref={dialog}
        className="sheet"
        aria-labelledby="sheet-title"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // щелчок по подложке, а не по панели
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="sheet__panel ground-paper" data-lenis-prevent>
          <header className="sheet__head">
            <div>
              <span className="index">{t(`cta.${req.mode}`, lang)}</span>
              <h2 id="sheet-title" className="sheet__title title">
                {t(`lead.title.${req.mode}`, lang)}
              </h2>
              <p className="sheet__intro">{t(`lead.intro.${req.mode}`, lang)}</p>
            </div>
            <button type="button" className="sheet__close" onClick={() => setOpen(false)}>
              <span className="sr-only">{t("lead.close", lang)}</span>
              <i aria-hidden="true" />
              <i aria-hidden="true" />
            </button>
          </header>
          {open && (
            <LeadForm
              key={req.n}
              lang={lang}
              mode={req.mode}
              topic={req.topic}
              onDone={() => setOpen(false)}
            />
          )}
        </div>
      </dialog>
    </LeadContext.Provider>
  );
}
