/**
 * Главная — один непрерывный проход по компании ELTO.
 *
 * Семь сцен, и каждая передаёт кадр следующей. Ритм задаёт смена грунта:
 * кино → работа → кино. Именно на этой смене держится ощущение, что
 * промышленный сайт может быть и зрелищным, и удобным одновременно.
 */

import Hero from "@/scenes/Hero";
import Company from "@/scenes/Company";
import Production from "@/scenes/Production";
import CatalogScene from "@/scenes/CatalogScene";
import Advantages from "@/scenes/Advantages";
import Geography from "@/scenes/Geography";
import News from "@/scenes/News";
import ContactCta from "@/scenes/ContactCta";
import Seo from "@/components/Seo";
import { HOME_DESCRIPTION } from "@/scenes/hero-copy";
import { t, type Lang } from "@/lib/i18n";

export default function Home({ lang }: { lang: Lang }) {
  return (
    <>
      <Seo
        lang={lang}
        path="/"
        title={t("hero.h1", lang)}
        description={HOME_DESCRIPTION[lang]}
      />
      <Hero lang={lang} />
      <Company lang={lang} />
      <Production lang={lang} />
      <CatalogScene lang={lang} />
      <Advantages lang={lang} />
      <Geography lang={lang} />
      <News lang={lang} />
      <ContactCta lang={lang} />
    </>
  );
}
