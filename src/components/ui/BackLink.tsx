/**
 * Возврат на уровень выше.
 *
 * Намеренно не `history.back()`: история может вести куда угодно — из поиска,
 * с другого сайта, из середины каталога. Ссылка называет место, куда ведёт,
 * поэтому человек заранее знает, где окажется, и на страницу можно попасть
 * по прямой ссылке без риска упереться в тупик.
 *
 * Исключение — когда пользователь действительно пришёл с той же страницы,
 * куда ведёт ссылка: тогда возвращаем его назад по истории, чтобы сохранить
 * позицию прокрутки и место в длинном списке.
 */

import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { previousPath } from "@/lib/nav-history";

type Props = {
  to: string;
  label: string;
  /** модификатор для страниц с собственной навигационной иерархией */
  className?: string;
};

export default function BackLink({ to, label, className }: Props) {
  const navigate = useNavigate();

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (previousPath() === to) {
        e.preventDefault();
        navigate(-1);
      }
    },
    [navigate, to]
  );

  return (
    <Link className={className ? `back ${className}` : "back"} to={to} onClick={onClick}>
      <span className="back__arrow" aria-hidden="true">
        ←
      </span>
      <span className="back__label">{label}</span>
    </Link>
  );
}
