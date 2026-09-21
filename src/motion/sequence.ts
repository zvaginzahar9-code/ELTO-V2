/**
 * Загрузчик кадровых последовательностей с общим кэшем.
 *
 * За один и тот же кадр могут попросить и прелоадер, и сама сцена. Кто
 * попросил первым — тот и запускает загрузку, а прогресс считается на саму
 * последовательность, не на просящего.
 *
 * Не отрендеренная сцена (count = 0) не должна ничего подвешивать: она сразу
 * отдаёт пустой список, и кадр остаётся на постере.
 */

export type SequenceSpec = {
  /** например "/seq/podem" */
  dir: string;
  /** количество кадров; файлы 0001.jpg … */
  count: number;
  ext?: string;
};

type Job = {
  images: HTMLImageElement[];
  loaded: number;
  total: number;
  promise: Promise<HTMLImageElement[]>;
  listeners: Set<(ratio: number) => void>;
  done: boolean;
};

const jobs = new Map<string, Job>();

const frameSrc = (s: SequenceSpec, i: number) =>
  `${s.dir}/${String(i + 1).padStart(4, "0")}.${s.ext ?? "jpg"}`;

export function loadSequence(
  spec: SequenceSpec,
  onProgress?: (ratio: number) => void
): Promise<HTMLImageElement[]> {
  if (!spec.count || spec.count < 1) {
    onProgress?.(1);
    return Promise.resolve([]);
  }

  const existing = jobs.get(spec.dir);
  if (existing) {
    if (onProgress) {
      if (existing.done) onProgress(1);
      else {
        existing.listeners.add(onProgress);
        onProgress(existing.loaded / existing.total);
      }
    }
    return existing.promise;
  }

  const images: HTMLImageElement[] = new Array(spec.count);
  const listeners = new Set<(r: number) => void>();
  if (onProgress) listeners.add(onProgress);

  const job: Job = {
    images,
    loaded: 0,
    total: spec.count,
    listeners,
    done: false,
    promise: null as unknown as Promise<HTMLImageElement[]>,
  };

  job.promise = new Promise((resolve) => {
    const settle = () => {
      job.loaded += 1;
      const ratio = job.loaded / job.total;
      job.listeners.forEach((l) => l(ratio));
      if (job.loaded >= job.total) {
        job.done = true;
        job.listeners.clear();
        resolve(images);
      }
    };
    for (let i = 0; i < spec.count; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = settle;
      img.onerror = settle; // потерянный кадр не должен подвесить сайт
      img.src = frameSrc(spec, i);
      images[i] = img;
    }
  });

  jobs.set(spec.dir, job);
  return job.promise;
}

export const peekSequence = (dir: string) => {
  const job = jobs.get(dir);
  return job?.done ? job.images : undefined;
};
