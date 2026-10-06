/**
 * Главная — один непрерывный проход по компании ELTO.
 *
 * Через все сцены идёт одна аргоновая дуга (ArcLayer): в герое она
 * прорезает кадр, в манифесте становится опорой, на производстве — линией
 * реза, перед слоганом сходится в знак. Ритм задаёт смена грунта под ней —
 * ночь → жемчуг → аргон → жемчуг → ночь — одним непрерывным переходом.
 *
 * На телефоне — своя главная (src/phone): закреплённые сцены и кадры по
 * прокрутке там тормозят и не помещаются, поэтому это другой экран, а не
 * ужатый этот.
 */

import Hero from "@/scenes/Hero";
import Manifest from "@/scenes/Manifest";
import Production from "@/scenes/Production";
import Assembly from "@/scenes/Assembly";
import Seal from "@/scenes/Seal";
import CatalogScene from "@/scenes/CatalogScene";
import ArcLayer from "@/components/motion/ArcLayer";
import Geography from "@/scenes/Geography";
import News from "@/scenes/News";
import ContactCta from "@/scenes/ContactCta";
import PhoneHome from "@/phone/PhoneHome";
import Seo from "@/components/Seo";
import { HOME_DESCRIPTION } from "@/scenes/hero-copy";
import { t, type Lang } from "@/lib/i18n";
import { PHONE, useMedia } from "@/motion/use-media";

export default function Home({ lang }: { lang: Lang }) {
  const phone = useMedia(PHONE);

  return (
    <>
      <Seo
        lang={lang}
        path="/"
        title={t("hero.h1", lang)}
        description={HOME_DESCRIPTION[lang]}
      />
      {phone ? (
        <PhoneHome lang={lang} />
      ) : (
        <div className="home">
          <ArcLayer />
          <Hero lang={lang} />
          <Manifest lang={lang} />
          <Production lang={lang} />
          <Assembly lang={lang} />
          <Seal lang={lang} />
          <CatalogScene lang={lang} />
          <Geography lang={lang} />
          <News lang={lang} />
          <ContactCta lang={lang} />
        </div>
      )}
    </>
  );
}
