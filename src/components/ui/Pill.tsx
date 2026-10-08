/**
 * Кнопка-капсула со стрелкой в собственном кружке.
 *
 * Одна кнопка на всю главную, в трёх материалах: аргон (главное действие),
 * стекло (второе) и жемчуг (на аргоновой плите). Стрелка живёт в отдельном
 * кружке и при наведении уходит вперёд-вверх — кнопка отвечает на курсор
 * раньше, чем на нажатие.
 */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "@phosphor-icons/react";

type Common = {
  children: ReactNode;
  tone?: "argon" | "glass" | "pearl";
  className?: string;
  icon?: ReactNode;
};

type AsLink = Common & { to: string; onClick?: never; type?: never };
type AsButton = Common & { onClick: () => void; to?: never; type?: "button" | "submit" };

export default function Pill(props: AsLink | AsButton) {
  const { children, tone = "argon", className, icon } = props;
  const cls = `pill pill--${tone}${className ? " " + className : ""}`;
  const inner = (
    <>
      <span className="pill__label">{children}</span>
      <span className="pill__icon" aria-hidden="true">
        {icon ?? <ArrowUpRight weight="regular" />}
      </span>
    </>
  );
  if ("to" in props && props.to) {
    return (
      <Link className={cls} to={props.to}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={cls} type={props.type ?? "button"} onClick={props.onClick}>
      {inner}
    </button>
  );
}
