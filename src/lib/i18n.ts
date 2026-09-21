/**
 * Языки сайта повторяют оригинал: русский, казахский, английский.
 *
 * Здесь живут только подписи интерфейса — кнопки, заголовки блоков,
 * служебные строки. Содержательный текст, названия изделий и характеристики
 * берутся из выгрузки оригинала и не переводятся заново: если на elto.kz
 * перевода нет, показывается русский оригинал.
 */

export const LANGS = ["ru", "kk", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ru";

export const isLang = (v: string | undefined): v is Lang =>
  !!v && (LANGS as readonly string[]).includes(v);

export const LANG_LABEL: Record<Lang, string> = { ru: "RU", kk: "KZ", en: "EN" };

type Dict = Record<string, Record<Lang, string>>;

const T: Dict = {
  "nav.catalog": { ru: "Каталог", kk: "Каталог", en: "Catalogue" },
  "nav.company": { ru: "О нас", kk: "Біз туралы", en: "About us" },
  "nav.production": { ru: "Производство", kk: "Өндіріс", en: "Production" },
  "nav.projects": { ru: "Проекты", kk: "Жобалар", en: "Projects" },
  "nav.news": { ru: "Новости", kk: "Жаңалықтар", en: "News" },
  "nav.contacts": { ru: "Контакты", kk: "Байланыс", en: "Contacts" },
  "nav.menu": { ru: "Меню", kk: "Мәзір", en: "Menu" },
  "nav.close": { ru: "Закрыть", kk: "Жабу", en: "Close" },
  "nav.home": { ru: "Главная", kk: "Басты бет", en: "Home" },

  "hero.scroll": { ru: "Листайте", kk: "Төмен жылжытыңыз", en: "Scroll" },
  "hero.since": { ru: "Караганда · с 2014 года", kk: "Қарағанды · 2014 жылдан", en: "Karaganda · since 2014" },
  "hero.place": { ru: "Караганда · Казахстан", kk: "Қарағанды · Қазақстан", en: "Karaganda · Kazakhstan" },
  "hero.mark": { ru: "Энергосистемы", kk: "Энергожүйелер", en: "Energy Systems" },

  "common.all": { ru: "Все", kk: "Барлығы", en: "All" },
  "common.more": { ru: "Подробнее", kk: "Толығырақ", en: "More" },
  "common.back": { ru: "Назад", kk: "Артқа", en: "Back" },
  "back.home": { ru: "На главную", kk: "Басты бетке", en: "Home" },
  "back.catalog": { ru: "В каталог", kk: "Каталогқа", en: "To the catalogue" },
  "back.to": { ru: "В раздел", kk: "Бөлімге", en: "To section" },
  "common.loading": { ru: "Загрузка", kk: "Жүктелуде", en: "Loading" },
  "common.notfound": { ru: "Страница не найдена", kk: "Бет табылмады", en: "Page not found" },
  "common.search": { ru: "Поиск по каталогу", kk: "Каталогтан іздеу", en: "Search the catalogue" },
  "common.nothing": { ru: "Ничего не найдено", kk: "Ештеңе табылмады", en: "Nothing found" },
  "common.items": { ru: "позиций", kk: "позиция", en: "items" },
  "common.sections": { ru: "разделов", kk: "бөлім", en: "sections" },

  "catalog.title": { ru: "Каталог продукции", kk: "Өнім каталогы", en: "Product catalogue" },
  "catalog.all": { ru: "Весь каталог", kk: "Толық каталог", en: "Full catalogue" },
  "catalog.sections": { ru: "Разделы", kk: "Бөлімдер", en: "Sections" },
  "catalog.open": { ru: "Открыть раздел", kk: "Бөлімді ашу", en: "Open section" },
  "catalog.subsections": { ru: "Подразделы", kk: "Ішкі бөлімдер", en: "Subsections" },
  "catalog.download": { ru: "Скачать каталог", kk: "Каталогты жүктеу", en: "Download catalogue" },

  "product.specs": { ru: "Технические характеристики", kk: "Техникалық сипаттамалар", en: "Technical specifications" },
  "product.description": { ru: "Описание", kk: "Сипаттама", en: "Description" },
  "product.drawing": { ru: "Чертёж", kk: "Сызба", en: "Drawing" },
  "product.photo": { ru: "Фото", kk: "Фото", en: "Photo" },
  "product.docs": { ru: "Документы", kk: "Құжаттар", en: "Documents" },
  "product.related": { ru: "Сопутствующая продукция", kk: "Қосымша өнім", en: "Related products" },
  "product.section": { ru: "Раздел", kk: "Бөлім", en: "Section" },
  "product.request": { ru: "Запросить цену", kk: "Бағаны сұрау", en: "Request a price" },
  "product.gallery": { ru: "Изображения", kk: "Суреттер", en: "Images" },

  "contacts.address": { ru: "Наш адрес", kk: "Мекенжайымыз", en: "Our address" },
  "contacts.phone": { ru: "Телефон", kk: "Телефон", en: "Phone" },
  "contacts.email": { ru: "E-mail", kk: "E-mail", en: "E-mail" },
  "contacts.map": { ru: "Карта проезда", kk: "Бағыт картасы", en: "Directions" },
  "contacts.write": { ru: "Написать нам", kk: "Бізге жазу", en: "Write to us" },

  "article.prev": { ru: "Предыдущий материал", kk: "Алдыңғы материал", en: "Previous" },
  "article.next": { ru: "Следующий материал", kk: "Келесі материал", en: "Next" },

  "map.office": { ru: "Производство и офис", kk: "Өндіріс және кеңсе", en: "Plant and office" },
  "map.route": { ru: "Маршрут", kk: "Бағыт", en: "Directions" },
  "map.copy": { ru: "Скопировать", kk: "Көшіру", en: "Copy" },
  "map.copied": { ru: "Скопировано", kk: "Көшірілді", en: "Copied" },
  "map.drag": { ru: "Тяните карту", kk: "Картаны жылжытыңыз", en: "Drag the map" },
  "map.plan": { ru: "Схема", kk: "Схема", en: "Map" },
  "map.sat": { ru: "Спутник", kk: "Спутник", en: "Satellite" },
  "map.layer": { ru: "Вид карты", kk: "Карта түрі", en: "Map view" },
  "map.zoomin": { ru: "Приблизить", kk: "Жақындату", en: "Zoom in" },
  "map.zoomout": { ru: "Отдалить", kk: "Алыстату", en: "Zoom out" },
  "map.recenter": { ru: "К объекту", kk: "Нысанға оралу", en: "Back to the plant" },
  "map.aria": {
    ru: "Карта: расположение производства ELTO в Караганде",
    kk: "Карта: ELTO өндірісінің Қарағандыдағы орналасуы",
    en: "Map: the ELTO plant in Karaganda",
  },

  "home.company": { ru: "Компания", kk: "Компания", en: "Company" },
  "home.production": { ru: "Производство", kk: "Өндіріс", en: "Production" },
  "home.catalog": { ru: "Продукция", kk: "Өнім", en: "Products" },
  "home.why": { ru: "Почему мы", kk: "Неліктен біз", en: "Why us" },
  "home.partners": { ru: "Партнёры", kk: "Серіктестер", en: "Partners" },
  "home.news": { ru: "Новости", kk: "Жаңалықтар", en: "News" },
  "home.contacts": { ru: "Контакты", kk: "Байланыс", en: "Contacts" },
  "home.watch": { ru: "Посмотреть ролик", kk: "Роликті көру", en: "Watch the film" },

  "a11y.langs": { ru: "Выбор языка", kk: "Тілді таңдау", en: "Language" },
  "a11y.mainnav": { ru: "Основная навигация", kk: "Негізгі навигация", en: "Main navigation" },
};

export function t(key: string, lang: Lang): string {
  const row = T[key];
  if (!row) return key;
  return row[lang] || row.ru;
}

/** Перевод, если он есть на оригинале; иначе русский текст оригинала. */
export function pick(
  value: Partial<Record<Lang, string>> | string | undefined,
  lang: Lang
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.ru || Object.values(value)[0] || "";
}
