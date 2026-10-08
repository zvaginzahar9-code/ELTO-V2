/**
 * Главная — один непрерывный кинематографичный проход по компании ELTO.
 *
 * Через все сцены идёт один поток света (FlowStage): в каждой сцене у него
 * своя роль — крюк в герое, свечение в манифесте, спираль вокруг опоры,
 * линии конвейера, точка знака, поток данных каталога, волна под
 * способами заказа, горизонт города, луч к заявке. Знак ELTO летит
 * курьером от героя через плиту слогана к финальной заявке. Страница
 * целиком на ночи ELTO: свет приносит поток, а не смена фона.
 *
 * На телефоне — своя главная (src/phone): там другой экран, а не ужатый
 * этот.
 */

import Hero from "@/scenes/Hero";
import Manifest from "@/scenes/Manifest";
import Anatomy from "@/scenes/Anatomy";
import Production from "@/scenes/Production";
import Seal from "@/scenes/Seal";
import CatalogScene from "@/scenes/CatalogScene";
import Picker from "@/scenes/Picker";
import Geography from "@/scenes/Geography";
import News from "@/scenes/News";
import ContactCta from "@/scenes/ContactCta";
import FlowStage from "@/components/motion/FlowStage";
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
          <FlowStage />
          <Hero lang={lang} />
          <Manifest lang={lang} />
          <Anatomy lang={lang} />
          <Production lang={lang} />
          <Seal lang={lang} />
          <CatalogScene lang={lang} />
          <Picker lang={lang} />
          <Geography lang={lang} />
          <News lang={lang} />
          <ContactCta lang={lang} />
        </div>
      )}
    </>
  );
}
