/**
 * Подбор по задаче.
 *
 * Проектировщик думает объектом — «осветить развязку», «протянуть кабель»,
 * а каталог оригинала разложен по типам изделий. Задача здесь — только
 * группа реальных разделов каталога: ни одного нового изделия, ни одной
 * новой характеристики. Порядок разделов внутри задачи — как на elto.kz.
 */

import { categoryOf, type CategoryNode } from "./data";

export type Task = { key: string; sections: string[] };

export const TASKS: Task[] = [
  {
    key: "streets",
    sections: [
      "opory-osveshcheniya-granyonye",
      "opory-trubchatye",
      "kronshteyny-opor-osveshcheniya",
      "zakladnye-detali-fundamenta",
      "svetodiodnye-svetilniki",
    ],
  },
  {
    key: "parks",
    sections: [
      "opory-dekorativnogo-osveshcheniya",
      "svetodiodnye-svetilniki",
      "flagshtok-ulichnyy",
    ],
  },
  {
    key: "areas",
    sections: ["machty-osveshcheniya-pmo-vmo", "metallokonstrukcii", "molnieotvody-mogk"],
  },
  {
    key: "power",
    sections: ["opora-lep", "mnogogrannye-opory-lep", "molnieotvody-mogk"],
  },
  { key: "telecom", sections: ["machty-radioreleynye"] },
  { key: "cable", sections: ["elektromontazhnye-izdeliya"] },
  { key: "traffic", sections: ["svetofornye-opory", "zabory-i-ograzhdeniya"] },
  { key: "steel", sections: ["metallokonstrukcii", "uslugi"] },
];

export const taskSections = (task: Task) =>
  task.sections.map((s) => categoryOf(s)).filter(Boolean) as CategoryNode[];

export const taskCount = (task: Task) =>
  taskSections(task).reduce((sum, c) => sum + c.count, 0);
