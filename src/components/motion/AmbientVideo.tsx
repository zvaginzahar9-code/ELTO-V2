/**
 * Плита-петля.
 *
 * Не запрашивается, пока не подошла к экрану; не играет, пока не в кадре;
 * всегда подстрахована постером, если сеть или кодек подвели. На телефоне
 * подставляется облегчённая дорожка — незачем тянуть настольный файл.
 */

import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "@/motion/clock";

type Props = {
  src: string;
  mobileSrc?: string;
  poster: string;
  className?: string;
  playbackRate?: number;
};

export default function AmbientVideo({
  src,
  mobileSrc,
  poster,
  className,
  playbackRate = 1,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el || reducedMotion()) return;

    const pick = () =>
      mobileSrc && window.matchMedia("(max-width: 860px)").matches ? mobileSrc : src;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSource((s) => s ?? pick());
            video.current?.play().catch(() => {});
          } else {
            video.current?.pause();
          }
        }
      },
      { rootMargin: "60% 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src, mobileSrc]);

  useEffect(() => {
    if (video.current) video.current.playbackRate = playbackRate;
  }, [playbackRate, source]);

  return (
    <div ref={wrap} className={className}>
      <img className="fill plate__poster" src={poster} alt="" aria-hidden="true" />
      {source && (
        <video
          ref={video}
          className="fill plate__video"
          data-ready={ready ? "true" : "false"}
          src={source}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          onCanPlay={() => {
            setReady(true);
            video.current?.play().catch(() => {});
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
