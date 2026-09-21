/**
 * Главный кадр материала.
 *
 * Картинки новостей на elto.kz какие угодно: афиша в портрет, квадратная
 * открытка, широкое фото с монтажа. Единый кроп 16:9 срезал бы у афиши
 * половину текста, поэтому кадр устроен иначе — тёмная полоса во всю ширину
 * и снимок внутри целиком, без обрезки и растяжения. Пустоту по бокам
 * закрывает он же: размытый, приглушённый, как свет от экрана.
 *
 * Движение тут одно и медленное: пока полоса идёт через экран, фон чуть
 * расходится, а сам кадр едва смещается. Новость — не главная страница.
 */

import { useEffect, useRef } from "react";
import Img from "@/components/ui/Img";
import { registerScene, span, lerp } from "@/motion/scene";
import { reducedMotion } from "@/motion/clock";

export default function ArticleShot({ file, alt }: { file: string; alt: string }) {
  const root = useRef<HTMLElement>(null);

  /*
   * Среди новостей попадаются баннеры в 250 пикселей шириной. Растянутый на
   * всю полосу такой файл превращается в кашу, поэтому кадр не бывает больше
   * самого снимка: собственный размер картинки становится его потолком.
   */
  useEffect(() => {
    const el = root.current;
    const img = el?.querySelector<HTMLImageElement>(".art__frame img");
    if (!el || !img) return;

    const measure = () => {
      if (!img.naturalWidth) return;
      el.style.setProperty("--shot-w", `${img.naturalWidth}px`);
      el.style.setProperty("--shot-h", `${img.naturalHeight}px`);
    };

    if (img.complete) measure();
    img.addEventListener("load", measure);
    return () => img.removeEventListener("load", measure);
  }, [file]);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;

    const bg = el.querySelector<HTMLElement>(".art__amb");
    const shot = el.querySelector<HTMLElement>(".art__frame");

    return registerScene(el, {
      mode: "enter",
      onUpdate(p) {
        const t = span(p, 0, 1);
        if (bg) bg.style.transform = `scale(${lerp(1.22, 1.08, t).toFixed(4)})`;
        if (shot) shot.style.transform = `translate3d(0, ${lerp(2.4, -2.4, t).toFixed(2)}%, 0)`;
      },
    });
  }, []);

  if (!file) return null;

  return (
    <figure className="art__stage" ref={root} data-ground="dark">
      <div className="art__amb gpu" aria-hidden="true">
        <Img file={file} alt="" sizes="100vw" fit="cover" priority />
      </div>
      <div className="art__frame gpu">
        <Img file={file} alt={alt} sizes="(max-width: 860px) 92vw, 70vw" fit="contain" priority />
      </div>
    </figure>
  );
}
