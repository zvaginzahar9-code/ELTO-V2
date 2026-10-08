import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import Nav from "./components/layout/Nav";
import Footer from "./components/layout/Footer";
import Dock from "./components/layout/Dock";
import LeadProvider from "./components/lead/LeadProvider";
import { DEFAULT_LANG, isLang, type Lang } from "./lib/i18n";
import { measureScenes } from "./motion/scene";
import { scrollToTop } from "./motion/clock";
import { recordPath } from "./lib/nav-history";
import { toRoute } from "./lib/routes";

/*
 * Главная не ленивая намеренно. Её чанк нужен сразу при любом заходе на
 * корень, а лишний шаг «бандл → чанк → рендер» на телефоне стоит целого
 * круга по сети: до него страница успевает отрисоваться одним подвалом,
 * и когда сцены наконец приходят, подвал уезжает вниз на пол-экрана.
 */
import Home from "./pages/Home";

const Catalog = lazy(() => import("./pages/Catalog"));
const Category = lazy(() => import("./pages/Category"));
const Product = lazy(() => import("./pages/Product"));
const Info = lazy(() => import("./pages/Info"));
const InfoList = lazy(() => import("./pages/InfoList"));
const About = lazy(() => import("./pages/About"));
const Contacts = lazy(() => import("./pages/Contacts"));
const NotFound = lazy(() => import("./pages/NotFound"));

/**
 * Старые адреса elto.kz (/ru/content/…, /ru/katalog/…, /ru/usefullinf) ведут
 * на те же материалы нового сайта: ссылки из поиска и закладок не теряются.
 * Если адрес не узнан, остаётся страница 404.
 */
function Legacy({ lang }: { lang: Lang }) {
  const { pathname } = useLocation();
  const target = toRoute(pathname, lang);
  if (target !== pathname.replace(/\/+$/, "")) return <Navigate to={target} replace />;
  return <NotFound lang={lang} />;
}
const Privacy = lazy(() => import("./pages/Privacy"));

/** Язык берётся из адреса; неизвестный — это 404, а не молчаливая подмена. */
function LangLayout() {
  const { lang } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (isLang(lang)) document.documentElement.lang = lang;
  }, [lang]);

  // новая страница начинается сверху, и сцены перемеряются под её высоту
  useEffect(() => {
    recordPath(location.pathname);
    scrollToTop(true);
    const id = requestAnimationFrame(() => measureScenes());
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);

  if (!isLang(lang)) return <Navigate to={`/${DEFAULT_LANG}`} replace />;

  const l = lang as Lang;
  return (
    <LeadProvider lang={l}>
      <Nav lang={l} />
      <main id="main">
        <Suspense fallback={<div className="route-wait" aria-hidden="true" />}>
          <Routes>
            <Route index element={<Home lang={l} />} />
            <Route path="catalog" element={<Catalog lang={l} />} />
            <Route path="catalog/:slug" element={<Category lang={l} />} />
            <Route path="product/:slug" element={<Product lang={l} />} />
            <Route path="about" element={<About lang={l} />} />
            <Route path="contacts" element={<Contacts lang={l} />} />
            <Route path="privacy" element={<Privacy lang={l} />} />
            <Route path="info" element={<InfoList lang={l} kind="info" />} />
            <Route path="news" element={<InfoList lang={l} kind="news" />} />
            <Route path="partners" element={<InfoList lang={l} kind="partners" />} />
            <Route path="vacancy" element={<InfoList lang={l} kind="vacancy" />} />
            <Route path="gallery" element={<InfoList lang={l} kind="gallery" />} />
            <Route path="info/:slug" element={<Info lang={l} />} />
            <Route path="*" element={<Legacy lang={l} />} />
          </Routes>
        </Suspense>
      </main>
      <Footer lang={l} />
      <Dock lang={l} />
    </LeadProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />
      <Route path="/:lang/*" element={<LangLayout />} />
    </Routes>
  );
}
