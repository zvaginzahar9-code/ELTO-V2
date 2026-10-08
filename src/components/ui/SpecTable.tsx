/**
 * Таблица характеристик.
 *
 * На широком экране — обычная таблица. На телефоне таблица в десять колонок
 * не помещается, и листать её вбок неудобно, поэтому каждая строка
 * становится карточкой: марка — заголовком, ниже параметры «подпись —
 * значение», строки-подзаголовки таблицы («Для опор типа СТВ…») — разделами.
 *
 * Шапка в выгрузке оригинала бывает двухуровневой без объединения ячеек:
 * сверху группы («Размеры, мм»), под ними колонки («Н», «А», «В»). Подписи
 * колонок восстанавливаются здесь; если раскладку групп не удалось понять
 * однозначно, телефон получает ту же таблицу с прокруткой — лучше так, чем
 * подписать цифру чужим параметром.
 */

import type { CSSProperties } from "react";
import { clean, isSection, layout } from "@/lib/spec-layout";

type Props = { table: string[][]; label?: string };

export default function SpecTable({ table, label }: Props) {
  const plan = layout(table);
  return (
    <>
      <div
        className={"spec-wrap" + (plan ? " spec-wrap--wide" : "")}
        tabIndex={0}
        role="region"
        aria-label={label}
      >
        <table className="spec">
          <thead>
            <tr>
              {table[0].map((cell, i) => (
                <th key={i}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.slice(1).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {plan && (
        <div className="spec-cards" aria-label={label}>
          {plan.body.map((row, ri) =>
            isSection(row) ? (
              <p className="spec-cards__section" key={ri}>
                {clean(row[0])}
              </p>
            ) : (
              <article className="spec-card" key={ri} style={{ "--i": ri } as CSSProperties}>
                <h3 className="spec-card__title">
                  {plan.labels[0] && <span className="spec-card__key">{plan.labels[0]}</span>}
                  {clean(row[0])}
                </h3>
                <dl className="spec-card__list">
                  {row.slice(1).map((cell, ci) =>
                    clean(cell) ? (
                      <div key={ci}>
                        <dt>{plan.labels[ci + 1]}</dt>
                        <dd>{clean(cell)}</dd>
                      </div>
                    ) : null
                  )}
                </dl>
              </article>
            )
          )}
        </div>
      )}
    </>
  );
}
