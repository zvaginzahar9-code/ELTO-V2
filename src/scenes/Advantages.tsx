/**
 * СЦЕНА 05 — ПОЧЕМУ МЫ
 *
 * Шесть преимуществ и восемь пунктов блока «Почему мы» — дословно с главной
 * elto.kz.
 *
 * Карточки намеренно никуда не ведут. На оригинале за каждой стоит отдельная
 * страница, но текста на ней нет вовсе — только красный значок под белый фон.
 * Переход туда обрывает чтение и приводит на пустую страницу со значком,
 * поэтому заголовок преимущества остаётся просто заголовком.
 */

import Reveal from "@/components/motion/Reveal";
import { pages } from "@/lib/data";
import { pick, t, type Lang } from "@/lib/i18n";

/** Порядок — как в блоке «Преимущество» на главной оригинала. */
const ADVANTAGE_SLUGS = [
  "качество-продукции",
  "высокий-уровень-обслуживания",
  "оптимальная-цена-на-продукцию",
  "содействие-в-представлении-инженерных-решений",
  "короткие-сроки-выполнения-заказа",
  "гарантийное-и-сервисное-обслуживание",
];

/** Блок «Почему мы» с главной — восемь пунктов, дословно. */
const WHY = [
  "Работа с нами – работа с производителем, без посредников. Мы работаем от завода изготовителя.",
  "У нас современное оборудование.",
  "Мониторинг качества продукции на всех этапах производства.",
  "Гарантия и контроль качества.",
  "Доступные цены.",
  "Ваши заказы оформляются и доставляются вовремя!",
  "Индивидуальный подход и внимательное отношение к каждому заказчику.",
  "Доставка в любой регион РК, России и СНГ быстро и в срок.",
];

export default function Advantages({ lang }: { lang: Lang }) {
  const byslug = new Map(pages.map((p) => [p.s, p]));
  const cards = ADVANTAGE_SLUGS.map((s) => byslug.get(s)).filter(Boolean);

  return (
    <section id="why" className="scene why ground-paper" data-ground="paper">
      <div className="shell why__inner">
        <header className="why__head">
          <span className="index">06 — {t("home.why", lang)}</span>
          <Reveal as="h2" className="why__title display" kind="lines">
            Преимущество
          </Reveal>
        </header>

        <ul className="why__cards">
          {cards.map((p, i) => (
            <li className="why__card" key={p!.s}>
              <span className="why__no mono">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="why__h title">{pick(p!.t, lang)}</h3>
            </li>
          ))}
        </ul>

        <ul className="why__list">
          {WHY.map((line, i) => (
            <li className="why__line" key={i}>
              <span className="why__bullet" aria-hidden="true" />
              <Reveal as="p" delay={i * 40}>
                {line}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
