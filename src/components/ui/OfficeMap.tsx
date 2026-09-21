/**
 * Карта проезда на странице «Контакты».
 *
 * Вместо ссылки «посмотреть на карте» — настоящая карта: тёмная схема или
 * снимок со спутника, свой маркер и карточка адреса поверх. Библиотеки
 * нет намеренно: слой тайлов — это сетка <img>, а весь «слиппи-маппинг»
 * сводится к двум формулам проекции Меркатора и одному transform при
 * перетаскивании. Leaflet ради одной точки на одной странице весил бы
 * больше, чем всё остальное на ней.
 *
 * Тайлы начинают грузиться только когда блок подъехал к экрану, и тянется
 * карта только мышью: на телефоне палец на карте не должен отнимать
 * прокрутку страницы — там ведут кнопки маршрута.
 */

import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";

/** Производство и офис ELTO, Караганда. */
const LAT = 49.90003885896065;
const LON = 73.21785271167757;

const COORDS = `${LAT.toFixed(6)}, ${LON.toFixed(6)}`;

/** Карточка организации в 2ГИС — та же, что стояла в ссылке раньше. */
const GIS =
  "https://2gis.kz/karaganda/firm/11822477302831764/center/73.21785271167757,49.90003885896065/zoom/16";
/** Маршрут в 2ГИС: пустая первая точка — «откуда я сейчас». */
const GIS_ROUTE = `https://2gis.kz/karaganda/directions/points/${encodeURIComponent(
  `|${LON.toFixed(6)},${LAT.toFixed(6)}`
)}`;
const GOOGLE = `https://www.google.com/maps/dir/?api=1&destination=${LAT.toFixed(6)},${LON.toFixed(
  6
)}`;

/**
 * Подложки. Обе отдаются публичными сервисами Esri без ключа; «схема» в
 * Казахстане нарезана до 16-го зума, снимок — до 17-го, отсюда разный max.
 */
const LAYERS = {
  plan: {
    base: "Canvas/World_Dark_Gray_Base",
    /** прозрачный слой подписей поверх схемы */
    ref: "Canvas/World_Dark_Gray_Reference",
    max: 16,
    attr: "Esri · HERE · OpenStreetMap",
  },
  sat: {
    base: "World_Imagery",
    ref: null,
    /* глубже 17-го Esri на Караганду отдаёт заглушку «нет данных» */
    max: 17,
    attr: "Esri · Maxar · Earthstar Geographics",
  },
} as const;

type LayerKey = keyof typeof LAYERS;

const TILE = 256;
const MIN_Z = 12;
const START_Z = 16;
/** Насколько далеко можно утащить карту от объекта, px текущего зума. */
const MAX_PAN = 900;
/** Запас тайлов за краями кадра — чтобы при перетаскивании не было пустоты. */
const BUFFER = 1;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Долгота → пиксель мировой карты на зуме z. */
const lonToX = (lon: number, z: number) => ((lon + 180) / 360) * TILE * 2 ** z;

/** Широта → пиксель мировой карты на зуме z (Меркатор). */
const latToY = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * TILE * 2 ** z;
};

/** У Esri порядок обратный привычному: сначала ряд, потом столбец. */
const tileUrl = (service: string, x: number, y: number, z: number) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/${service}/MapServer/tile/${z}/${y}/${x}`;

export default function OfficeMap({ lang }: { lang: Lang }) {
  const root = useRef<HTMLDivElement>(null);
  const surf = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; dx: number; dy: number } | null>(null);

  const [live, setLive] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [z, setZ] = useState(START_Z);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [held, setHeld] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canPan, setCanPan] = useState(false);
  const [layer, setLayer] = useState<LayerKey>("plan");

  const cfg = LAYERS[layer];
  const maxZ = cfg.max;

  /* тайлы грузим только у экрана: страница открывается на шапке, не на карте */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLive(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* размер считаем по самому кадру: на телефоне карточка адреса лежит под ним */
  useEffect(() => {
    const el = surf.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect;
      setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* грубый указатель — карту не тянем: прокрутка страницы важнее */
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const onChange = () => setCanPan(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const paint = (dx: number, dy: number) => {
    if (world.current) world.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };

  /** Переносит накопленный сдвиг мыши в состояние и перекладывает тайлы. */
  const commit = () => {
    const d = drag.current;
    if (!d || (!d.dx && !d.dy)) return;
    /* сдвиг снимаем в локальные числа: React вызовет обновитель позже, когда
       в d уже будет ноль — на этом легко потерять всё перетаскивание */
    const { dx, dy } = d;
    d.x += dx;
    d.y += dy;
    d.dx = 0;
    d.dy = 0;
    setOff((o) => ({
      x: clamp(o.x - dx, -MAX_PAN, MAX_PAN),
      y: clamp(o.y - dy, -MAX_PAN, MAX_PAN),
    }));
    paint(0, 0);
  };

  /** Шаг зума; вместе с ним можно сменить подложку — см. zoomIn. */
  const zoomTo = (step: number, next: LayerKey = layer) => {
    const nz = clamp(z + step, MIN_Z, LAYERS[next].max);
    if (nz === z && next === layer) return;
    const k = 2 ** (nz - z);
    setLayer(next);
    setZ(nz);
    setOff((o) => ({
      x: clamp(o.x * k, -MAX_PAN, MAX_PAN),
      y: clamp(o.y * k, -MAX_PAN, MAX_PAN),
    }));
  };

  /*
   * Схема в Казахстане нарезана только до 16-го зума. Гасить на нём «плюс»
   * нечестно: человеку, который ищет въезд, нужен как раз следующий шаг.
   * Поэтому на потолке схемы плюс переводит карту на снимок и идёт дальше —
   * переключатель подложки при этом видимо переезжает на «Спутник».
   */
  const zoomIn = () => zoomTo(1, z >= maxZ && layer === "plan" ? "sat" : layer);

  const recenter = () => setOff({ x: 0, y: 0 });

  /* схема нарезана мельче снимка: уходя на неё, подтягиваем зум к её потолку */
  const switchLayer = (next: LayerKey) => {
    setLayer(next);
    setZ((prev) => clamp(prev, MIN_Z, LAYERS[next].max));
  };

  const copy = () => {
    navigator.clipboard?.writeText(COORDS).then(
      () => setCopied(true),
      () => undefined
    );
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 240 : 80;
    const move = (x: number, y: number) => {
      e.preventDefault();
      setOff((o) => ({
        x: clamp(o.x + x, -MAX_PAN, MAX_PAN),
        y: clamp(o.y + y, -MAX_PAN, MAX_PAN),
      }));
    };
    if (e.key === "ArrowLeft") move(-step, 0);
    else if (e.key === "ArrowRight") move(step, 0);
    else if (e.key === "ArrowUp") move(0, -step);
    else if (e.key === "ArrowDown") move(0, step);
    else if (e.key === "+" || e.key === "=") zoomIn();
    else if (e.key === "-") zoomTo(-1);
    else if (e.key === "Home") recenter();
  };

  /* раскладка тайлов вокруг центра кадра */
  const { w, h } = size;
  const count = 2 ** z;
  const left = lonToX(LON, z) + off.x - w / 2;
  const top = latToY(LAT, z) + off.y - h / 2;

  const grid: { key: string; x: number; y: number; tx: number; ty: number }[] = [];
  if (live && w > 0 && h > 0) {
    const x0 = Math.floor(left / TILE) - BUFFER;
    const x1 = Math.floor((left + w) / TILE) + BUFFER;
    const y0 = Math.floor(top / TILE) - BUFFER;
    const y1 = Math.floor((top + h) / TILE) + BUFFER;
    for (let ty = y0; ty <= y1; ty++) {
      if (ty < 0 || ty >= count) continue;
      for (let tx = x0; tx <= x1; tx++) {
        grid.push({
          key: `${z}/${tx}/${ty}`,
          x: Math.round(tx * TILE - left),
          y: Math.round(ty * TILE - top),
          tx: ((tx % count) + count) % count,
          ty,
        });
      }
    }
  }

  /** Один слой тайлов: подложка или прозрачные подписи поверх неё. */
  const sheet = (service: string, kind: string) => (
    <div className={`omap__tiles omap__tiles--${kind}`}>
      {grid.map((tl) => (
        <img
          key={tl.key}
          className="omap__tile"
          src={tileUrl(service, tl.tx, tl.ty, z)}
          alt=""
          aria-hidden="true"
          draggable={false}
          width={TILE}
          height={TILE}
          style={{ transform: `translate3d(${tl.x}px, ${tl.y}px, 0)` }}
          /* сервис изредка отдаёт 500 на отдельный тайл: одна попытка ещё раз,
             и только потом прячем — дырка в кадре заметнее секунды ожидания */
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.retry) {
              img.style.visibility = "hidden";
              return;
            }
            img.dataset.retry = "1";
            const url = img.src;
            window.setTimeout(() => {
              img.src = `${url}?r=1`;
            }, 600);
          }}
        />
      ))}
    </div>
  );

  const moved = off.x !== 0 || off.y !== 0;

  return (
    <div
      className="omap"
      ref={root}
      data-held={held ? "true" : "false"}
      data-layer={layer}
    >
      <div
        className="omap__surface"
        ref={surf}
        data-pan={canPan ? "true" : "false"}
        tabIndex={canPan ? 0 : -1}
        role="group"
        aria-label={t("map.aria", lang)}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          if (!canPan || e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
          setHeld(true);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          d.dx = e.clientX - d.x;
          d.dy = e.clientY - d.y;
          /* утащили далеко — перекладываем тайлы, чтобы не показалась пустота */
          if (Math.abs(d.dx) > 160 || Math.abs(d.dy) > 160) commit();
          else paint(d.dx, d.dy);
        }}
        onPointerUp={(e) => {
          if (!drag.current || drag.current.id !== e.pointerId) return;
          commit();
          drag.current = null;
          setHeld(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          paint(0, 0);
          setHeld(false);
        }}
      >
        <div className="omap__world" ref={world}>
          {sheet(cfg.base, "base")}
          {cfg.ref ? sheet(cfg.ref, "ref") : null}

          {/* маркер стоит на объекте: центр кадра минус сдвиг */}
          <div
            className="omap__pin"
            style={{ left: `${w / 2 - off.x}px`, top: `${h / 2 - off.y}px` }}
            aria-hidden="true"
          >
            <span className="omap__ping" />
            <span className="omap__dot" />
            <span className="omap__flag mono">ELTO</span>
          </div>
        </div>

        <div className="omap__scrim" aria-hidden="true" />
        <div className="omap__grid" aria-hidden="true" />

        {canPan && (
          <span className="omap__hint mono" aria-hidden="true">
            {t("map.drag", lang)}
          </span>
        )}
        <a
          className="omap__attr mono"
          href="https://www.esri.com/en-us/legal/copyright-trademarks"
          target="_blank"
          rel="noreferrer noopener"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {cfg.attr}
        </a>
      </div>

      <div className="omap__layers" role="group" aria-label={t("map.layer", lang)}>
        <button
          type="button"
          className="omap__layer"
          data-on={layer === "plan" ? "true" : "false"}
          aria-pressed={layer === "plan"}
          onClick={() => switchLayer("plan")}
        >
          {t("map.plan", lang)}
        </button>
        <button
          type="button"
          className="omap__layer"
          data-on={layer === "sat" ? "true" : "false"}
          aria-pressed={layer === "sat"}
          onClick={() => switchLayer("sat")}
        >
          {t("map.sat", lang)}
        </button>
      </div>

      <div className="omap__tools">
        <button
          type="button"
          className="omap__tool"
          onClick={zoomIn}
          disabled={z >= LAYERS.sat.max}
          aria-label={t("map.zoomin", lang)}
        >
          +
        </button>
        <button
          type="button"
          className="omap__tool"
          onClick={() => zoomTo(-1)}
          disabled={z <= MIN_Z}
          aria-label={t("map.zoomout", lang)}
        >
          −
        </button>
        <button
          type="button"
          className="omap__tool"
          onClick={recenter}
          disabled={!moved}
          aria-label={t("map.recenter", lang)}
        >
          ⌖
        </button>
      </div>

      <div className="omap__card">
        <span className="index">{t("map.office", lang)}</span>
        <address className="omap__addr">
          г. Караганда, район Алихана Букейханова,
          <br />
          учетный квартал 018, строение 20
        </address>
        <button type="button" className="omap__coords mono" onClick={copy}>
          <span className="omap__coords-val">{COORDS}</span>
          <span className="omap__coords-hint">
            {copied ? t("map.copied", lang) : t("map.copy", lang)}
          </span>
        </button>
        <div className="omap__acts">
          <a className="btn btn--solid" href={GIS_ROUTE} target="_blank" rel="noreferrer noopener">
            {t("map.route", lang)}
          </a>
          <a className="btn" href={GIS} target="_blank" rel="noreferrer noopener">
            2ГИС
          </a>
          <a className="btn" href={GOOGLE} target="_blank" rel="noreferrer noopener">
            Google
          </a>
        </div>
      </div>

    </div>
  );
}
