/**
 * Языки сайта повторяют оригинал: русский, казахский, английский.
 *
 * Здесь живут подписи интерфейса — кнопки, заголовки блоков, служебные
 * строки — и короткие формулировки главной. Каталог, страницы и новости
 * на elto.kz есть только по-русски; их казахский и английский переводы
 * лежат в i18n/ и накладываются на данные скриптом scripts/build-i18n.mjs.
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
    // как в меню оригинала
    ru: "Каталог",
    kk: "Каталог",
    en: "Catalogue",
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
    en: "Specifications",
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
  "product.prev": { ru: "Предыдущее изображение", kk: "Алдыңғы сурет", en: "Previous image" },
  "product.next": { ru: "Следующее изображение", kk: "Келесі сурет", en: "Next image" },
  "product.gallery": { ru: "Изображения", kk: "Суреттер", en: "Images" },

  "contacts.address": { ru: "Наш адрес", kk: "Мекенжайымыз", en: "Our address" },
  "contacts.phone": { ru: "Контактный телефон", kk: "Байланыс телефоны", en: "Contact phone" },
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
  "map.plan": { ru: "Схема", kk: "Сызба", en: "Map" },
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
  "home.partners": { ru: "Партнеры", kk: "Серіктестер", en: "Partners" },
  "home.news": { ru: "Новости", kk: "Жаңалықтар", en: "News" },
  "home.contacts": { ru: "Контакты", kk: "Байланыс", en: "Contacts" },
  // кнопка слайдера оригинала
  "home.aboutMore": { ru: "Подробнее о нас", kk: "Біз туралы толығырақ", en: "More about us" },
  "home.watch": { ru: "Посмотреть ролик", kk: "Роликті көру", en: "Watch the film" },

  "cta.quote": { ru: "Написать нам", kk: "Бізге жазу", en: "Write to us" },
  "cta.tz": { ru: "Написать нам", kk: "Бізге жазу", en: "Write to us" },
  "cta.consult": { ru: "Заказать звонок", kk: "Қоңырауға тапсырыс", en: "Request a call" },
  "cta.call": { ru: "Позвонить", kk: "Қоңырау шалу", en: "Call" },
  "cta.whatsapp": { ru: "WhatsApp", kk: "WhatsApp", en: "WhatsApp" },
  "cta.catalog": { ru: "Каталог", kk: "Каталог", en: "Catalogue" },
  "cta.pdf": { ru: "PDF-каталог", kk: "PDF-каталог", en: "PDF catalogue" },
  /* короткие подписи нижней панели телефона: в ней четыре кнопки по четверти экрана */
  "dock.quote": { ru: "Написать нам", kk: "Бізге жазу", en: "Write to us" },
  "dock.call": { ru: "Звонок", kk: "Қоңырау", en: "Call" },
  "catalog.showAll": {
    ru: "Показать все разделы",
    kk: "Барлық бөлімдерді көрсету",
    en: "Show all sections",
  },

  "lead.title.quote": {
    ru: "Написать нам",
    kk: "Бізге жазу",
    en: "Write to us",
  },
  "lead.title.tz": {
    ru: "Написать нам",
    kk: "Бізге жазу",
    en: "Write to us",
  },
  "lead.title.consult": {
    ru: "Заказать звонок",
    kk: "Қоңырауға тапсырыс",
    en: "Request a call",
  },
  "lead.intro.quote": {
    ru: "",
    kk: "",
    en: "",
  },
  "lead.intro.tz": {
    ru: "",
    kk: "",
    en: "",
  },
  "lead.intro.consult": {
    ru: "",
    kk: "",
    en: "",
  },
  "lead.topic": { ru: "Заявка по", kk: "Өтінім тақырыбы", en: "Request about" },
  "lead.name": { ru: "Имя / Организация", kk: "Аты / Ұйым", en: "Name / Organisation" },
  "lead.company": { ru: "Должность", kk: "Лауазымы", en: "Position" },
  "lead.contact": {
    ru: "Ваш телефон / Ваш e-mail",
    kk: "Телефоныңыз / e-mail",
    en: "Your phone / your e-mail",
  },
  "lead.message": { ru: "Ваше сообщение", kk: "Хабарламаңыз", en: "Your message" },
  "lead.message.ph": {
    ru: "",
    kk: "",
    en: "",
  },
  "lead.file": {
    ru: "Прикрепить файл",
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
  "lead.send": { ru: "Отправить", kk: "Жіберу", en: "Send" },
  "lead.sending": { ru: "Отправляем…", kk: "Жіберілуде…", en: "Sending…" },
  /*
   * Согласие по пункту 4 статьи 8 Закона РК «О персональных данных и их
   * защите»: оператор и БИН ({op}, {bin}), перечень данных, цель,
   * трансграничная передача, срок. Подробности — в политике по ссылке.
   */
  "lead.consent": {
    ru: "Даю согласие {op} (БИН {bin}) на сбор и обработку данных из этой формы — имени или организации, должности, телефона или e-mail, текста сообщения и файла — для ответа на заявку, в том числе на их трансграничную передачу в США через сервисы Vercel и Resend. Согласие действует до достижения этой цели или до его отзыва. Подробно — в",
    kk: "{op}-ке (БСН {bin}) осы формадағы деректерді — атын немесе ұйымын, лауазымын, телефонын немесе e-mail-ін, хабарлама мәтінін және файлды — өтінімге жауап беру үшін жинауға және өңдеуге, соның ішінде оларды Vercel және Resend сервистері арқылы АҚШ-қа трансшекаралық беруге келісім беремін. Келісім осы мақсатқа жеткенге дейін немесе қайтарып алынғанға дейін әрекет етеді. Толығырақ —",
    en: "I consent to {op} (BIN {bin}) collecting and processing the data in this form — name or organisation, position, phone or e-mail, message text and file — to answer my request, including their cross-border transfer to the USA via the Vercel and Resend services. The consent is valid until this purpose is achieved or until I withdraw it. Details are in the",
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
    ru: "Укажите телефон или e-mail",
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
    ru: "Сообщение отправлено",
    kk: "Өтінім жіберілді",
    en: "Request sent",
  },
  "lead.done.text": {
    ru: "",
    kk: "",
    en: "",
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
    // дословно со страницы «О нас» оригинала
    ru: "Завод производитель опор освещения, мачт и металлоконструкций различного назначения",
    kk: "Жарық тіректерін, мачталарды және әртүрлі мақсаттағы металл конструкцияларды өндіруші зауыт",
    en: "Manufacturer of lighting poles, masts and steel structures for various purposes",
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
    ru: "Остались вопросы?",
    kk: "Сұрақтарыңыз қалды ма?",
    en: "Any questions left?",
  },
  "home.final.lead": {
    ru: "",
    kk: "",
    en: "",
  },

  "spec.mark": { ru: "Обозначение опоры", kk: "Тірек белгісі", en: "Pole designation" },
  "spec.height": { ru: "Н, мм", kk: "Н, мм", en: "H, mm" },
  "spec.mass": { ru: "Масса, кг", kk: "Салмағы, кг", en: "Mass, kg" },

  "pick.dia": { ru: "Dн/ Dв, мм", kk: "Dс/ Dі, мм", en: "Dout/ Din, mm" },
  "pick.flange": { ru: "А × В, d", kk: "А × В, d", en: "A × B, d" },
  "pick.anchor": { ru: "Тип фундамента: анкерный", kk: "Іргетас түрі: анкерлі", en: "Foundation: anchor" },
  "pick.pipe": { ru: "Тип фундамента: трубный", kk: "Іргетас түрі: құбырлы", en: "Foundation: pipe" },

  "a11y.langs": { ru: "Выбор языка", kk: "Тілді таңдау", en: "Language" },
  "a11y.mainnav": {
    ru: "Основная навигация",
    kk: "Негізгі навигация",
    en: "Main navigation",
  },
  /* ── бренд, адрес, документы ─────────────────────────────── */
  "brand.name": { ru: "Энергосистемы ЭЛТО", kk: "Энергосистемы ЭЛТО", en: "ELTO Energy Systems" },
  "brand.legal": { ru: "ТОО «Энергосистемы ЭЛТО»", kk: "«Энергосистемы ЭЛТО» ЖШС", en: "ELTO Energy Systems LLP" },
  "brand.legalFull": {
    ru: "Товарищество с ограниченной ответственностью «Энергосистемы ЭЛТО»",
    kk: "«Энергосистемы ЭЛТО» жауапкершілігі шектеулі серіктестігі",
    en: "ELTO Energy Systems Limited Liability Partnership",
  },
  "brand.claim": {
    ru: "ТОО «Энергосистемы ЭЛТО» — завод-производитель опор освещения, мачт и металлоконструкций различного назначения.",
    kk: "«Энергосистемы ЭЛТО» ЖШС — әр түрлі мақсаттағы жарықтандыру тіректерін, мачталар мен металл конструкцияларды шығаратын зауыт.",
    en: "ELTO Energy Systems LLP manufactures lighting poles, masts and steel structures for various purposes.",
  },
  "address.1": {
    ru: "г. Караганда, район Алихана Букейханова,",
    kk: "Қарағанды қ., Әлихан Бөкейхан ауданы,",
    en: "Karaganda, Alikhan Bokeikhan district,",
  },
  "address.2": {
    ru: "учетный квартал 018, строение 20",
    kk: "018 есептік квартал, 20 құрылыс",
    en: "registration block 018, building 20",
  },
  "address.full": {
    ru: "Республика Казахстан, Карагандинская область, г. Караганда, район Әлихан Бөкейхан, учётный квартал 018, строение 20",
    kk: "Қазақстан Республикасы, Қарағанды облысы, Қарағанды қ., Әлихан Бөкейхан ауданы, 018 есептік квартал, 20 құрылыс",
    en: "Republic of Kazakhstan, Karaganda Region, Karaganda, Alikhan Bokeikhan district, registration block 018, building 20",
  },
  "doc.poles": { ru: "Каталог опор освещения", kk: "Жарықтандыру тіректерінің каталогы", en: "Lighting poles catalogue" },
  "doc.lep": { ru: "Каталог опор ЛЭП", kk: "ЭБЖ тіректерінің каталогы", en: "Power line towers catalogue" },
  "about.founded": { ru: "Год основания", kk: "Құрылған жылы", en: "Founded" },
  "contacts.phones": { ru: "Наши контактные телефоны", kk: "Біздің байланыс телефондарымыз", en: "Our phone numbers" },
  "map.2gis": { ru: "2ГИС", kk: "2ГИС", en: "2GIS" },
  "a11y.crumbs": { ru: "Хлебные крошки", kk: "Навигация тізбегі", en: "Breadcrumbs" },
  "file.mb": { ru: "МБ", kk: "МБ", en: "MB" },
  "spec.hShort": { ru: "Н", kk: "Н", en: "H" },

  /* ── главная: блоки с формулировками оригинала ───────────── */
  "home.advantage": { ru: "Преимущество", kk: "Артықшылығымыз", en: "Advantages" },
  "home.services": { ru: "Услуги", kk: "Қызметтер", en: "Services" },
  "stage.cut": { ru: "Плазменная резка металла", kk: "Металды плазмалық кесу", en: "Plasma metal cutting" },
  "stage.bend": { ru: "Гибка металла", kk: "Металды иілу", en: "Metal bending" },
  "stage.assembly": { ru: "Сборка секций", kk: "Секцияларды құрастыру", en: "Section assembly" },
  "stage.assembly.text": {
    ru: "Сборка секций осуществляется посадкой одной секции в другую методом «конус в конус» на расстоянии порядка 1м. Стяжка секций производится со значительным возрастающим усилием, порядка 1,5 -2 тонн, что обеспечивает надёжное и неразборное соединение за счёт заклинивания граней смежных секций между собой, без необходимости сварных работ.",
    kk: "Секциялар бір секцияны екіншісіне шамамен 1 м қашықтықта «конусқа конус» әдісімен кигізу арқылы құрастырылады. Секцияларды тарту шамамен 1,5-2 тонна айтарлықтай өсетін күшпен жүргізіледі, бұл дәнекерлеу жұмыстарынсыз іргелес секциялардың қырларының бір-біріне сыналануы есебінен сенімді әрі ажыратылмайтын қосылысты қамтамасыз етеді.",
    en: "The sections are joined by sliding one into another, cone into cone, over about 1 m. They are pulled together with a large and increasing force of about 1.5-2 tonnes, which gives a reliable permanent joint, as the faces of adjacent sections wedge against each other, with no welding needed.",
  },
  "stage.zinc": { ru: "Услуги горячего цинкования", kk: "Ыстық мырыштау қызметтері", en: "Hot-dip galvanizing services" },
  "stage.weld": { ru: "Сборка и сварка", kk: "Құрастыру және дәнекерлеу", en: "Assembly and welding" },
  "stage.galv": { ru: "Горячее цинкование", kk: "Ыстық мырыштау", en: "Hot-dip galvanizing" },
  "why.1": {
    ru: "Работа с нами - работа с *производителем,* без *посредников.*",
    kk: "Бізбен жұмыс — делдалсыз, тікелей *өндірушімен* *жұмыс.*",
    en: "Working with us means working with the *manufacturer,* with no *middlemen.*",
  },
  "why.2": { ru: "Мы работаем от завода изготовителя.", kk: "Біз өндіруші зауыттан жұмыс істейміз.", en: "We work directly from the manufacturing plant." },
  "why.3": { ru: "У нас современное оборудование.", kk: "Бізде заманауи жабдық бар.", en: "We have modern equipment." },
  "why.4": {
    ru: "Мониторинг качества продукции на всех этапах производства.",
    kk: "Өндірістің барлық кезеңінде өнім сапасы бақыланады.",
    en: "Product quality is monitored at every stage of production.",
  },
  "why.5": { ru: "Гарантия и контроль качества.", kk: "Кепілдік және сапа бақылауы.", en: "Warranty and quality control." },
  "why.6": { ru: "Доступные цены.", kk: "Қолжетімді бағалар.", en: "Affordable prices." },
  "why.7": {
    ru: "Ваши заказы оформляются и доставляются *вовремя!*",
    kk: "Тапсырыстарыңыз *уақытында* рәсімделіп, жеткізіледі!",
    en: "Your orders are processed and delivered *on time!*",
  },
  "why.8": {
    ru: "Индивидуальный подход и внимательное отношение к каждому заказчику.",
    kk: "Әр тапсырыс берушіге жеке көзқарас пен ықыласты қарым-қатынас.",
    en: "An individual approach and close attention to every customer.",
  },
  "why.9": {
    ru: "Доставка в любой регион РК, России и СНГ быстро и в *срок.*",
    kk: "ҚР, Ресей және ТМД-ның кез келген өңіріне жылдам әрі *мерзімінде* жеткізу.",
    en: "Fast delivery to any region of Kazakhstan, Russia and the CIS, *on schedule.*",
  },
  "geo.title": {
    ru: "Установлены во всех областных центрах *и крупных городах*",
    kk: "Барлық облыс орталықтарында *және ірі қалаларда* орнатылған",
    en: "Installed in every regional centre *and major city*",
  },
  "geo.lead": {
    ru: "Оборудованием укомплектованы тысячи энергетических объектов не только в Казахстане, но и странах СНГ.",
    kk: "Біздің жабдықпен Қазақстанда ғана емес, ТМД елдерінде де мыңдаған энергетикалық нысандар жарақтандырылған.",
    en: "Thousands of energy facilities, not only in Kazakhstan but across the CIS, are fitted with our equipment.",
  },
  "geo.since": { ru: "Завод работает с 2014 года.", kk: "Зауыт 2014 жылдан бері жұмыс істейді.", en: "The plant has been operating since 2014." },
  "phone.prod.title": { ru: "От листа до цинка", kk: "Табақтан мырышқа дейін", en: "From sheet to zinc" },
  "phone.prod.sub": { ru: "Собственное производство в Караганде.", kk: "Қарағандыдағы өз өндірісіміз.", en: "Our own production in Karaganda." },
  "phone.why": { ru: "Работа с производителем, без посредников", kk: "Делдалсыз, тікелей өндірушімен жұмыс", en: "Work with the manufacturer, no middlemen" },
  "alt.stadium": { ru: "Освещение стадиона на опорах ELTO", kk: "ELTO тіректеріндегі стадион жарығы", en: "Stadium lighting on ELTO poles" },
  "alt.zincShop": { ru: "Цех горячего цинкования ELTO", kk: "ELTO ыстық мырыштау цехы", en: "ELTO hot-dip galvanizing shop" },
  "caption.zincShop": { ru: "Цех горячего цинкования, Караганда", kk: "Ыстық мырыштау цехы, Қарағанды", en: "Hot-dip galvanizing shop, Karaganda" },
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
