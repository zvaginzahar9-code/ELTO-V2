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
  "hero.since": {
    ru: "Караганда · с 2014 года",
    kk: "Қарағанды · 2014 жылдан",
    en: "Karaganda · since 2014",
  },
  "hero.place": {
    ru: "Караганда · Казахстан",
    kk: "Қарағанды · Қазақстан",
    en: "Karaganda · Kazakhstan",
  },
  "hero.mark": { ru: "Энергосистемы", kk: "Энергожүйелер", en: "Energy Systems" },

  "common.all": { ru: "Все", kk: "Барлығы", en: "All" },
  "common.more": { ru: "Подробнее", kk: "Толығырақ", en: "More" },
  "common.back": { ru: "Назад", kk: "Артқа", en: "Back" },
  "back.home": { ru: "На главную", kk: "Басты бетке", en: "Home" },
  "back.catalog": { ru: "В каталог", kk: "Каталогқа", en: "To the catalogue" },
  "back.to": { ru: "В раздел", kk: "Бөлімге", en: "To section" },
  "common.loading": { ru: "Загрузка", kk: "Жүктелуде", en: "Loading" },
  "common.notfound": {
    ru: "Страница не найдена",
    kk: "Бет табылмады",
    en: "Page not found",
  },
  "common.search": {
    ru: "Поиск по каталогу",
    kk: "Каталогтан іздеу",
    en: "Search the catalogue",
  },
  "common.nothing": {
    ru: "Ничего не найдено",
    kk: "Ештеңе табылмады",
    en: "Nothing found",
  },
  "common.items": { ru: "позиций", kk: "позиция", en: "items" },
  "common.sections": { ru: "разделов", kk: "бөлім", en: "sections" },

  "catalog.title": {
    ru: "Каталог продукции",
    kk: "Өнім каталогы",
    en: "Product catalogue",
  },
  "catalog.all": { ru: "Весь каталог", kk: "Толық каталог", en: "Full catalogue" },
  "catalog.sections": { ru: "Разделы", kk: "Бөлімдер", en: "Sections" },
  "catalog.open": { ru: "Открыть раздел", kk: "Бөлімді ашу", en: "Open section" },
  "catalog.subsections": { ru: "Подразделы", kk: "Ішкі бөлімдер", en: "Subsections" },
  "catalog.download": {
    ru: "Скачать каталог",
    kk: "Каталогты жүктеу",
    en: "Download catalogue",
  },

  "product.specs": {
    ru: "Технические характеристики",
    kk: "Техникалық сипаттамалар",
    en: "Technical specifications",
  },
  "product.description": { ru: "Описание", kk: "Сипаттама", en: "Description" },
  "product.drawing": { ru: "Чертёж", kk: "Сызба", en: "Drawing" },
  "product.photo": { ru: "Фото", kk: "Фото", en: "Photo" },
  "product.docs": { ru: "Документы", kk: "Құжаттар", en: "Documents" },
  "product.related": {
    ru: "Сопутствующая продукция",
    kk: "Қосымша өнім",
    en: "Related products",
  },
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

  "map.office": {
    ru: "Производство и офис",
    kk: "Өндіріс және кеңсе",
    en: "Plant and office",
  },
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

  "cta.quote": { ru: "Запросить расчёт", kk: "Есептеуді сұрау", en: "Request a quote" },
  "cta.tz": { ru: "Отправить ТЗ", kk: "ТТ жіберу", en: "Send specifications" },
  "cta.consult": { ru: "Получить консультацию", kk: "Кеңес алу", en: "Get advice" },
  "cta.call": { ru: "Позвонить", kk: "Қоңырау шалу", en: "Call" },
  "cta.whatsapp": { ru: "WhatsApp", kk: "WhatsApp", en: "WhatsApp" },
  "cta.catalog": { ru: "Каталог", kk: "Каталог", en: "Catalogue" },
  "cta.pdf": { ru: "PDF-каталог", kk: "PDF-каталог", en: "PDF catalogue" },
  /* короткие подписи нижней панели телефона: в ней четыре кнопки по четверти экрана */
  "dock.quote": { ru: "Расчёт", kk: "Есептеу", en: "Quote" },
  "dock.call": { ru: "Звонок", kk: "Қоңырау", en: "Call" },
  "catalog.showAll": {
    ru: "Показать все разделы",
    kk: "Барлық бөлімдерді көрсету",
    en: "Show all sections",
  },

  "lead.title.quote": {
    ru: "Расчёт стоимости",
    kk: "Құнын есептеу",
    en: "Price calculation",
  },
  "lead.title.tz": {
    ru: "Техническое задание",
    kk: "Техникалық тапсырма",
    en: "Technical specifications",
  },
  "lead.title.consult": {
    ru: "Консультация инженера",
    kk: "Инженер кеңесі",
    en: "Engineering advice",
  },
  "lead.intro.quote": {
    ru: "Опишите, что нужно и в каком количестве — отдел продаж подготовит расчёт.",
    kk: "Не және қанша қажет екенін жазыңыз — сату бөлімі есеп дайындайды.",
    en: "Tell us what you need and how many — the sales team will prepare a quote.",
  },
  "lead.intro.tz": {
    ru: "Приложите чертёж, спецификацию или проект — ответим по существу.",
    kk: "Сызбаны, спецификацияны немесе жобаны тіркеңіз.",
    en: "Attach a drawing, specification or project and we will reply in detail.",
  },
  "lead.intro.consult": {
    ru: "Не знаете точную маркировку? Опишите задачу — поможем подобрать изделие.",
    kk: "Нақты таңбалауды білмейсіз бе? Міндетті сипаттаңыз — таңдауға көмектесеміз.",
    en: "Not sure of the exact type? Describe the task and we will help you choose.",
  },
  "lead.topic": { ru: "Заявка по", kk: "Өтінім тақырыбы", en: "Request about" },
  "lead.name": { ru: "Имя", kk: "Аты", en: "Name" },
  "lead.company": { ru: "Компания", kk: "Компания", en: "Company" },
  "lead.contact": {
    ru: "Телефон или e-mail",
    kk: "Телефон немесе e-mail",
    en: "Phone or e-mail",
  },
  "lead.message": { ru: "Что нужно", kk: "Не қажет", en: "What you need" },
  "lead.message.ph": {
    ru: "Изделие, маркировка, количество, объект, сроки",
    kk: "Өнім, таңбалау, саны, нысан, мерзімі",
    en: "Product, type, quantity, site, timing",
  },
  "lead.file": {
    ru: "Прикрепить ТЗ или чертёж",
    kk: "ТТ немесе сызбаны тіркеу",
    en: "Attach specs or a drawing",
  },
  "lead.file.hint": {
    ru: "PDF, DOC, XLS, DWG, DXF, JPG, PNG, ZIP · до 4 МБ",
    kk: "PDF, DOC, XLS, DWG, DXF, JPG, PNG, ZIP · 4 МБ дейін",
    en: "PDF, DOC, XLS, DWG, DXF, JPG, PNG, ZIP · up to 4 MB",
  },
  "lead.file.remove": { ru: "Убрать файл", kk: "Файлды алып тастау", en: "Remove file" },
  "lead.optional": { ru: "необязательно", kk: "міндетті емес", en: "optional" },
  "lead.send": { ru: "Отправить заявку", kk: "Өтінімді жіберу", en: "Send request" },
  "lead.sending": { ru: "Отправляем…", kk: "Жіберілуде…", en: "Sending…" },
  /*
   * Согласие по пункту 4 статьи 8 Закона РК «О персональных данных и их
   * защите»: оператор и БИН ({op}, {bin}), перечень данных, цель,
   * трансграничная передача, срок. Подробности — в политике по ссылке.
   */
  "lead.consent": {
    ru: "Даю согласие {op} (БИН {bin}) на сбор и обработку данных из этой формы — имени, телефона или e-mail, названия компании, текста заявки и файла — для ответа на заявку, в том числе на их трансграничную передачу в США через сервисы Vercel и Resend. Согласие действует до достижения этой цели или до его отзыва. Подробно — в",
    kk: "{op}-ке (БСН {bin}) осы формадағы деректерді — атын, телефонын немесе e-mail-ін, компания атауын, өтінім мәтінін және файлды — өтінімге жауап беру үшін жинауға және өңдеуге, соның ішінде оларды Vercel және Resend сервистері арқылы АҚШ-қа трансшекаралық беруге келісім беремін. Келісім осы мақсатқа жеткенге дейін немесе қайтарып алынғанға дейін әрекет етеді. Толығырақ —",
    en: "I consent to {op} (BIN {bin}) collecting and processing the data in this form — name, phone or e-mail, company, request text and file — to answer my request, including their cross-border transfer to the USA via the Vercel and Resend services. The consent is valid until this purpose is achieved or until I withdraw it. Details are in the",
  },
  "lead.consent.link": {
    ru: "Политике обработки персональных данных",
    kk: "дербес деректерді өңдеу саясатында",
    en: "Personal Data Policy (in Russian)",
  },
  "lead.err.consent": {
    ru: "Без согласия заявку отправить нельзя. Можно позвонить:",
    kk: "Келісімсіз өтінімді жіберу мүмкін емес. Қоңырау шалуға болады:",
    en: "The request can't be sent without consent. You can call instead:",
  },
  "privacy.link": {
    ru: "Политика обработки персональных данных",
    kk: "Дербес деректерді өңдеу саясаты",
    en: "Personal data policy",
  },
  "lead.err.name": { ru: "Укажите имя", kk: "Атыңызды жазыңыз", en: "Enter your name" },
  "lead.err.contact": {
    ru: "Нужен телефон или e-mail, чтобы ответить",
    kk: "Жауап беру үшін телефон немесе e-mail қажет",
    en: "We need a phone or e-mail to reply",
  },
  "lead.err.file.size": {
    ru: "Файл больше 4 МБ",
    kk: "Файл 4 МБ-тан үлкен",
    en: "The file exceeds 4 MB",
  },
  "lead.err.file.type": {
    ru: "Этот формат не принимается",
    kk: "Бұл формат қабылданбайды",
    en: "This format is not accepted",
  },
  "lead.err.rate": {
    ru: "Слишком много заявок подряд. Попробуйте через несколько минут или позвоните.",
    kk: "Өтінім тым көп. Бірнеше минуттан кейін қайталаңыз немесе қоңырау шалыңыз.",
    en: "Too many requests. Try again in a few minutes or call us.",
  },
  "lead.done.title": {
    ru: "Заявка отправлена",
    kk: "Өтінім жіберілді",
    en: "Request sent",
  },
  "lead.done.text": {
    ru: "Отдел продаж свяжется с вами по указанному контакту.",
    kk: "Сату бөлімі көрсетілген байланыс арқылы хабарласады.",
    en: "The sales team will contact you shortly.",
  },
  "lead.fallback.title": {
    ru: "Отправьте заявку напрямую",
    kk: "Өтінімді тікелей жіберіңіз",
    en: "Send the request directly",
  },
  "lead.fallback.text": {
    ru: "Онлайн-отправка сейчас недоступна. Текст заявки уже собран — выберите, куда его отправить. Файл ТЗ приложите к письму.",
    kk: "Онлайн жіберу қазір қолжетімсіз. Өтінім мәтіні дайын — қайда жіберетініңізді таңдаңыз. ТТ файлын хатқа тіркеңіз.",
    en: "Online sending is unavailable right now. Your request text is ready — choose where to send it and attach the file to the e-mail.",
  },
  "lead.fallback.mail": { ru: "Письмом", kk: "Хатпен", en: "By e-mail" },
  "lead.close": { ru: "Закрыть", kk: "Жабу", en: "Close" },
  "lead.again": { ru: "Новая заявка", kk: "Жаңа өтінім", en: "New request" },
  "lead.direct": { ru: "Или напрямую", kk: "Немесе тікелей", en: "Or directly" },

  "hero.h1": {
    ru: "Опоры освещения, мачты и металлоконструкции — от завода в Караганде",
    kk: "Жарық тіректері, мачталар және металл конструкциялар — Қарағандыдағы зауыттан",
    en: "Lighting poles, masts and steel structures — made at our plant in Karaganda",
  },
  "hero.quick": { ru: "Быстрый вход", kk: "Жылдам кіру", en: "Quick access" },

  "task.title": {
    ru: "Подбор по задаче",
    kk: "Міндет бойынша таңдау",
    en: "Choose by task",
  },
  "task.lead": {
    ru: "Не знаете маркировку — начните с объекта. Каждая задача ведёт в разделы каталога с подходящими изделиями.",
    kk: "Таңбалауды білмесеңіз — нысаннан бастаңыз. Әр міндет каталогтың тиісті бөлімдеріне апарады.",
    en: "Not sure of the type? Start from the site: each task leads to the matching catalogue sections.",
  },
  "task.streets": {
    ru: "Улицы и дороги",
    kk: "Көшелер мен жолдар",
    en: "Streets and roads",
  },
  "task.parks": {
    ru: "Парки, площади, дворы",
    kk: "Саябақтар, алаңдар, аулалар",
    en: "Parks, squares, yards",
  },
  "task.areas": {
    ru: "Большие площадки и развязки",
    kk: "Үлкен алаңдар мен айрықтар",
    en: "Large areas and interchanges",
  },
  "task.power": {
    ru: "Линии электропередачи",
    kk: "Электр беру желілері",
    en: "Power lines",
  },
  "task.telecom": {
    ru: "Связь и радиорелейные линии",
    kk: "Байланыс және радиорелелік желілер",
    en: "Telecom and radio relay",
  },
  "task.cable": {
    ru: "Кабельные трассы и электромонтаж",
    kk: "Кабель трассалары және электр монтаж",
    en: "Cable routes and wiring",
  },
  "task.traffic": {
    ru: "Дорожная инфраструктура",
    kk: "Жол инфрақұрылымы",
    en: "Road infrastructure",
  },
  "task.steel": {
    ru: "Металлоконструкции и услуги",
    kk: "Металл конструкциялар және қызметтер",
    en: "Steel structures and services",
  },

  "search.mark": {
    ru: "Маркировка или название: СТВ 9, ЗФ-220, лоток…",
    kk: "Таңбалау немесе атауы: СТВ 9, ЗФ-220…",
    en: "Type or name: STV 9, ZF-220, tray…",
  },
  "search.short": {
    ru: "СТВ 9, ЗФ-220, лоток…",
    kk: "СТВ 9, ЗФ-220, науа…",
    en: "STV 9, ZF-220, tray…",
  },
  "search.byMark": { ru: "по маркировке", kk: "таңбалау бойынша", en: "by type" },
  "search.know": {
    ru: "Я знаю, что нужно",
    kk: "Не қажет екенін білемін",
    en: "I know what I need",
  },
  "search.help": {
    ru: "Помогите подобрать",
    kk: "Таңдауға көмектесіңіз",
    en: "Help me choose",
  },

  "card.specs": { ru: "ТТХ", kk: "Сипаттама", en: "Specs" },
  "product.actions": {
    ru: "Заказ и документы",
    kk: "Тапсырыс және құжаттар",
    en: "Order and documents",
  },
  "product.priceNote": {
    ru: "Цена зависит от исполнения, количества и доставки — рассчитаем под ваш объект.",
    kk: "Баға орындалуына, санына және жеткізуге байланысты — нысаныңызға есептейміз.",
    en: "Price depends on design, quantity and delivery — we will calculate it for your site.",
  },
  "product.variants": {
    ru: "исполнений в таблицах",
    kk: "кестедегі орындау",
    en: "variants in tables",
  },

  "home.assembly": { ru: "Сборка", kk: "Құрастыру", en: "Assembly" },
  "assembly.title": {
    ru: "Из деталей — в изделие",
    kk: "Бөлшектерден — бұйымға",
    en: "From parts to product",
  },
  "assembly.lead": {
    ru: "Закладные детали, опоры, кронштейны и светильники — разделы одного каталога ELTO.",
    kk: "Іргетас бөлшектері, тіректер, кронштейндер және шамдар — бір каталогтың бөлімдері.",
    en: "Foundation parts, poles, brackets and luminaires are sections of one catalogue.",
  },
  "home.final": {
    ru: "Расчёт под ваш объект",
    kk: "Нысаныңызға есеп",
    en: "A quote for your site",
  },
  "home.final.lead": {
    ru: "Пришлите спецификацию, чертёж или просто список изделий — отдел продаж ответит расчётом.",
    kk: "Спецификацияны, сызбаны немесе өнімдер тізімін жіберіңіз — сату бөлімі есеппен жауап береді.",
    en: "Send a specification, a drawing or just a list of products — the sales team will reply with a quote.",
  },

  "a11y.langs": { ru: "Выбор языка", kk: "Тілді таңдау", en: "Language" },
  "a11y.mainnav": {
    ru: "Основная навигация",
    kk: "Негізгі навигация",
    en: "Main navigation",
  },
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
