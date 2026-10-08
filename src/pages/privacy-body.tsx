/**
 * Текст Политики на казахском и английском — перевод русской редакции,
 * пункт в пункт. Русская редакция живёт в Privacy.tsx; при её изменении
 * меняются и эти два текста.
 */

import { EMAIL, PHONE, PHONE_HREF } from "@/lib/contacts";
import { OPERATOR } from "@/lib/privacy";
import { t } from "@/lib/i18n";

export function PolicyKk() {
  const name = t("brand.legal", "kk");
  return (
    <article className="shell privacy__body prose" lang="kk">
      <h2>1. Жалпы ережелер</h2>
      <p>
        1.1. Осы Саясат {name} сайты қандай дербес деректерді жинайтынын, не үшін жинайтынын,
        оларды қалай өңдейтінін және қорғайтынын, сондай-ақ дербес деректер субъектісінің қандай
        құқықтары бар екенін анықтайды. Саясат «Дербес деректер және оларды қорғау туралы»
        2013 жылғы 21 мамырдағы № 94-V Қазақстан Республикасы Заңының (бұдан әрі — Заң) 25-бабы
        2-тармағының 1-1) тармақшасына сәйкес бекітілген.
      </p>
      <p>
        1.2. «Дербес деректер», «субъект», «оператор», «жинау», «өңдеу», «трансшекаралық беру»,
        «жою», «өшіру», «бұғаттау» ұғымдары Заңның 1-бабында және 16-бабында белгіленген
        мағыналарда қолданылады.
      </p>
      <p>
        1.3. Дербес деректерді жинау және өңдеу Заңға және Қазақстан Республикасы Цифрлық даму,
        инновациялар және аэроғарыш өнеркәсібі министрінің 2020 жылғы 21 қазандағы № 395/НҚ
        бұйрығымен бекітілген Дербес деректерді жинау, өңдеу қағидаларына (бұдан әрі — Қағидалар)
        сәйкес жүзеге асырылады.
      </p>

      <h2>2. Оператор</h2>
      <p>Сайтта жиналатын дербес деректердің меншік иесі және операторы:</p>
      <ul>
        <li>{t("brand.legalFull", "kk")}</li>
        <li>БСН {OPERATOR.bin}</li>
        <li>Мекенжайы: {t("address.full", "kk")}</li>
        <li>
          Электрондық пошта: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </li>
        <li>
          Телефон: <a href={PHONE_HREF}>{PHONE}</a>
        </li>
      </ul>

      <h2>3. Қандай дербес деректер жиналады</h2>
      <p>
        3.1. Дербес деректер тек сайттағы өтінім нысаны арқылы («Бізге жазыңыз», «Қоңырауға
        тапсырыс беру») жиналады. Пайдаланушы оны өзі толтырады:
      </p>
      <ul>
        <li>аты немесе ұйымның атауы — міндетті;</li>
        <li>телефон нөмірі немесе электрондық пошта мекенжайы — міндетті;</li>
        <li>лауазымы — қалауы бойынша;</li>
        <li>хабарлама мәтіні — қалауы бойынша;</li>
        <li>файл (PDF, DOC, XLS, DWG, DXF, JPG, PNG, ZIP, 4 МБ-қа дейін) — қалауы бойынша.</li>
      </ul>
      <p>
        3.2. Пайдаланушы өтінім мәтініне немесе қоса берілген файлға өзі енгізген дербес деректер
        сол тәртіппен және сол мақсаттар үшін өңделеді. Жеке басты куәландыратын құжаттардың
        көшірмелерін қоса бермеуіңізді сұраймыз: өтінімге жауап беру үшін олар қажет емес (Заңның
        7-бабының 9-тармағы артық деректерді өңдеуге жол бермейді).
      </p>
      <p>
        3.3. Өтініммен бірге оның тақырыбы — нысан ашылған бұйымның немесе каталог бөлімінің атауы
        автоматты түрде беріледі. Бұл дербес деректер емес.
      </p>
      <p>
        3.4. Сайт сервері жіберушінің IP-мекенжайын тек өтінімдерді жіберу жиілігін шектеу және
        нысанды автоматты таратылымдардан қорғау үшін пайдаланады. IP-мекенжай өтінімге енгізілмейді
        және операторға берілмейді.
      </p>
      <p>
        3.5. Сайт cookie файлдарын және веб-талдау сервистерін пайдаланбайды, пайдаланушылардың есептік
        жазбаларын жасамайды және осы бөлімде сипатталғаннан басқа тәсілдермен дербес деректерді
        жинамайды.
      </p>

      <h2>4. Өңдеу мақсаттары</h2>
      <p>
        4.1. Дербес деректер тек пайдаланушының хабарламасын қарау және осы хабарлама бойынша онымен
        байланысу үшін өңделеді.
      </p>
      <p>
        4.2. Дербес деректер тек оларды жинаудың мәлімделген мақсаттары үшін пайдаланылады (Заңның
        14-бабы). Олар таратылымдар, жарнама және өзге мақсаттар үшін пайдаланылмайды.
      </p>

      <h2>5. Өңдеу негізі — келісім</h2>
      <p>
        5.1. Дербес деректерді жинау және өңдеу субъектінің келісімімен жүзеге асырылады (Заңның
        7-бабының 1-тармағы, 8-бабы). Келісім өтінімді жібермес бұрын өтінім нысанындағы белгі арқылы
        беріледі. Белгісіз нысан өтінімді жібермейді. Нысанды толтырмай-ақ оператормен 2-бөлімде
        көрсетілген телефон арқылы байланысуға болады.
      </p>
      <p>
        5.2. Келісім мәтінінде Заңның 8-бабының 4-тармағында көзделген мәліметтер бар: оператордың
        атауы мен БСН-і, жиналатын деректердің тізбесі, трансшекаралық беру, үшінші тұлғаларға беру
        туралы мәліметтер және келісімнің қолданылу мерзімі. Субъектінің тегі, аты — ол «Аты» өрісінде
        көрсеткендері.
      </p>
      <p>
        5.3. Келісім фактісі, оны алу күні мен уақыты және осы Саясаттың редакциясы операторға келіп
        түсетін өтінімге жазылады — бұл Заңның 25-бабы 2-тармағының 5) тармақшасына сәйкес келісімнің
        алынғанын растау болып табылады.
      </p>
      <p>
        5.4. Келісім 4-бөлімде көрсетілген өңдеу мақсаттарына қол жеткізілгенге дейін (Заңның 8-бабының
        6-тармағы) немесе субъект оны кері қайтарып алғанға дейін әрекет етеді.
      </p>

      <h2>6. Деректер қалай өңделеді</h2>
      <p>
        6.1. «Өтінімді жіберу» батырмасын басқаннан кейін деректер қорғалған байланыс (HTTPS) арқылы
        сайт серверіне беріледі. Сервер өрістердің толтырылуын тексеріп, өтінімді электрондық хатпен
        оператордың сату бөлімінің {EMAIL} пошта жәшігіне жібереді. Сайт өтінімдерді дерекқорға
        жазбайды және оларды өзінде сақтамайды.
      </p>
      <p>
        6.2. Егер толтыру сәтінде сайт арқылы жіберу мүмкін болмаса, нысан өтінім мәтінін көрсетіп,
        оны өз бетінше — пайдаланушының поштасынан хатпен немесе сату бөлімінің нөміріне WhatsApp
        хабарламасымен жіберуді ұсынады. Бұл жағдайда деректер пайдаланушы таңдаған сервис арқылы сол
        сервистің шарттарымен беріледі.
      </p>
      <p>
        6.3. Нәтижесінде субъектіде құқықтар туындайтын, өзгеретін немесе тоқтатылатын дербес
        деректерді автоматтандырылған өңдеу (Заңның 19-1-бабы) жүзеге асырылмайды: әр өтінімді
        оператордың қызметкерлері қарайды.
      </p>

      <h2>7. Үшінші тұлғаларға беру және трансшекаралық беру</h2>
      <p>7.1. Нысанның жұмысы үшін келесі сервистер пайдаланылады:</p>
      <ul>
        <li>Vercel Inc. (АҚШ) — сайт хостингі және өтінімді қабылдайтын серверлік функция;</li>
        <li>Resend (АҚШ) — өтінімі бар хат жіберілетін электрондық поштаны жеткізу сервисі.</li>
      </ul>
      <p>
        7.2. Осы сервистер арқылы өтінім деректері АҚШ аумағына беріледі, яғни дербес деректерді
        трансшекаралық беру жүзеге асырылады (Заңның 16-бабы). Ол өтінім нысанында берілетін
        субъектінің келісімі негізінде жүзеге асырылады (Заңның 7-бабының 6-тармағы, 16-бабы
        3-тармағының 1) тармақшасы).
      </p>
      <p>
        7.3. Дербес деректер өзге үшінші тұлғаларға берілмейді және жалпыға қолжетімді көздерде
        таратылмайды, оларды ұсыну Қазақстан Республикасының заңдары бойынша міндетті болатын
        жағдайларды қоспағанда (Заңның 9-бабы).
      </p>

      <h2>8. Сақтау және жою</h2>
      <p>
        8.1. Өтінім оператордың сату бөлімінің пошта жәшігінде сақталады. Сақтау мерзімі, егер
        Қазақстан Республикасының заңнамасында өзгеше көзделмесе, 4-бөлімде көрсетілген өңдеу
        мақсаттарына қол жеткізілген күнмен айқындалады (Заңның 12-бабының 2-тармағы).
      </p>
      <p>
        8.2. Дербес деректер Заңның 18-бабындағы негіздер бойынша жойылады немесе өшіріледі: сақтау
        мерзімі өткенде, субъектімен құқықтық қатынастар тоқтатылғанда, заңды күшіне енген сот шешімі
        бойынша, олардың субъектінің келісімінсіз өңделгені анықталғанда, сондай-ақ Қазақстан
        Республикасының заңнамасында белгіленген өзге жағдайларда.
      </p>

      <h2>9. Дербес деректерді қорғау</h2>
      <p>9.1. Оператор Заңның 22-бабында көзделген дербес деректерді қорғау шараларын қабылдайды. Сайтта мыналар қолданылады:</p>
      <ul>
        <li>деректерді тек HTTPS қорғалған байланысы арқылы беру;</li>
        <li>сайтта өтінімдер дерекқорының болмауы — өтінім бірден хатпен жіберіледі;</li>
        <li>өтінімнің сайт бетінен жіберілгенін тексеру және жіберу жиілігін шектеу;</li>
        <li>қоса берілетін файлдардың өлшемі мен түрлерін шектеу;</li>
        <li>сайтты бөгде беттерге енгізуге және бөгде кодты жүктеуге тыйым салатын қауіпсіздік тақырыптары.</li>
      </ul>
      <p>
        9.2. Дербес деректер қызметтік қажеттілікке немесе еңбек қатынастарына байланысты белгілі болған
        тұлғалар олардың құпиялылығын қамтамасыз етуге міндетті (Заңның 11-бабының 2-тармағы).
      </p>

      <h2>10. Дербес деректер субъектісінің құқықтары</h2>
      <p>10.1. Заңның 24-бабына сәйкес субъектінің мынадай құқықтары бар:</p>
      <ul>
        <li>
          операторда өзінің дербес деректерінің бар екенін білуге, сондай-ақ оларды жинау мен өңдеудің
          фактісін, мақсатын, көздерін, тәсілдерін растайтын ақпаратты, дербес деректердің тізбесін және
          оларды өңдеу, соның ішінде сақтау мерзімдерін алуға;
        </li>
        <li>құжаттармен расталған негіздер болған кезде өзінің дербес деректерін өзгертуді және толықтыруды талап етуге;</li>
        <li>
          оларды жинау мен өңдеу шарттарының бұзылғаны туралы ақпарат болған кезде өзінің дербес деректерін
          бұғаттауды және (немесе) иесіздендіруді талап етуге;
        </li>
        <li>
          заңнаманы бұза отырып жиналған және өңделген, сондай-ақ Заңда белгіленген өзге жағдайларда өзінің
          дербес деректерін жоюды немесе өшіруді талап етуге;
        </li>
        <li>
          Заңның 8-бабының 2-тармағында көзделген жағдайларды қоспағанда, дербес деректерді жинауға, өңдеуге
          және трансшекаралық беруге берілген келісімді кері қайтарып алуға;
        </li>
        <li>өз құқықтары мен заңды мүдделерін қорғауға, соның ішінде моральдық және материалдық зиянды өтеуге;</li>
        <li>Заңда және Қазақстан Республикасының өзге де заңдарында көзделген өзге құқықтарды жүзеге асыруға.</li>
      </ul>
      <p>
        10.2. Өтініш (сұрау салу) операторға 2-бөлімде көрсетілген мекенжай бойынша жазбаша немесе {EMAIL}
        мекенжайына электрондық құжат нысанында беріледі (Заңның 10-бабының 2-тармағы). Дербес деректермен
        танысу тегін беріледі.
      </p>
      <p>10.3. Оператордың жауап беру мерзімдері:</p>
      <ul>
        <li>
          субъектінің дербес деректері туралы ақпарат немесе дәлелді бас тарту — өтініш алынған күннен бастап
          үш жұмыс күні ішінде (Қағидалардың 16-тармағы);
        </li>
        <li>
          Заңның 25-бабы 2-тармағының 8) тармақшасындағы негіздер бойынша дербес деректерді өзгерту, толықтыру,
          бұғаттау, жою немесе өшіру — бір жұмыс күні ішінде;
        </li>
        <li>
          келісім кері қайтарып алынғаннан кейін өңдеуді тоқтату немесе дәлелді бас тарту — он бес жұмыс күні
          ішінде (Заңның 8-бабының 7-тармағы).
        </li>
      </ul>

      <h2>11. Шағымдану</h2>
      <p>
        11.1. Дербес деректерді жинау, өңдеу және қорғау кезіндегі оператордың әрекеттеріне (әрекетсіздігіне)
        Қазақстан Республикасының заңдарында белгіленген тәртіппен шағым жасалуы мүмкін (Заңның 30-бабы).
      </p>
      <p>
        11.2. Субъект оператордың дербес деректерді жинау мен өңдеуге қойылатын талаптарды сақтауын тексеру үшін
        дербес деректерді қорғау саласындағы уәкілетті органға — Қазақстан Республикасының Жасанды интеллект және
        цифрлық даму министрлігіне (Қағидалардың 24-тармағы), сондай-ақ сотқа жүгінуге құқылы.
      </p>

      <h2>12. Сайт беттеріндегі бөгде ресурстар</h2>
      <ul>
        <li>
          «Байланыс» бетіндегі карта Esri серверлерінен (server.arcgisonline.com) суреттерді жүктейді. Оларды жүктеу
          үшін пайдаланушының браузері осы серверлерге өзінің IP-мекенжайын және сұраудың техникалық мәліметтерін
          береді.
        </li>
        <li>«Біз туралы» бетіндегі бейнеролик YouTube-тан тек ойнату батырмасын басқаннан кейін жүктеледі.</li>
        <li>
          WhatsApp, Instagram, 2ГИС және Google Карталарына сілтемелер деректерді өз ережелері бойынша өңдейтін
          бөгде сайттарға апарады.
        </li>
      </ul>

      <h2>13. Саясатты өзгерту</h2>
      <p>
        13.1. Саясаттың жаңа редакциясы осы бетте күні көрсетіле отырып жарияланады. Өзгеріске дейін жіберілген
        өтінімге оны жіберу сәтінде қолданыста болған редакция қолданылады: ол өтінімде көрсетіледі.
      </p>
    </article>
  );
}

export function PolicyEn() {
  const name = t("brand.legal", "en");
  return (
    <article className="shell privacy__body prose" lang="en">
      <h2>1. General provisions</h2>
      <p>
        1.1. This Policy sets out which personal data the {name} website collects, for what purpose, how the data
        are processed and protected, and what rights the personal data subject has. The Policy is adopted under
        subparagraph 1-1) of paragraph 2 of Article 25 of Law of the Republic of Kazakhstan No. 94-V of 21 May
        2013 "On Personal Data and Their Protection" (the Law).
      </p>
      <p>
        1.2. The terms "personal data", "subject", "operator", "collection", "processing", "cross-border transfer",
        "destruction", "deletion" and "blocking" are used as defined in Article 1 and Article 16 of the Law.
      </p>
      <p>
        1.3. Personal data are collected and processed in accordance with the Law and the Rules for the Collection
        and Processing of Personal Data approved by Order No. 395/NK of the Minister of Digital Development,
        Innovation and Aerospace Industry of the Republic of Kazakhstan of 21 October 2020 (the Rules).
      </p>

      <h2>2. Operator</h2>
      <p>The owner and operator of the personal data collected on the website is:</p>
      <ul>
        <li>{t("brand.legalFull", "en")}</li>
        <li>BIN {OPERATOR.bin}</li>
        <li>Address: {t("address.full", "en")}</li>
        <li>
          E-mail: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </li>
        <li>
          Phone: <a href={PHONE_HREF}>{PHONE}</a>
        </li>
      </ul>

      <h2>3. What personal data are collected</h2>
      <p>
        3.1. Personal data are collected only through the request form on the website ("Write to us", "Request a
        call"). The user fills it in themselves:
      </p>
      <ul>
        <li>name or organisation name — required;</li>
        <li>phone number or e-mail address — required;</li>
        <li>position — optional;</li>
        <li>message text — optional;</li>
        <li>file (PDF, DOC, XLS, DWG, DXF, JPG, PNG, ZIP, up to 4 MB) — optional.</li>
      </ul>
      <p>
        3.2. Personal data that the user includes in the request text or the attached file are processed in the same
        way and for the same purposes. Please do not attach copies of identity documents: they are not needed to
        answer a request (paragraph 9 of Article 7 of the Law prohibits processing excessive data).
      </p>
      <p>
        3.3. The request automatically includes its subject: the name of the product or catalogue section from which
        the form was opened. This is not personal data.
      </p>
      <p>
        3.4. The website server uses the sender's IP address only to limit how often requests can be sent and to
        protect the form from automated spam. The IP address is not included in the request and is not passed to the
        operator.
      </p>
      <p>
        3.5. The website does not use cookies or web analytics services, does not create user accounts and does not
        collect personal data in any way other than described in this section.
      </p>

      <h2>4. Purposes of processing</h2>
      <p>4.1. Personal data are processed solely to review the user's message and contact them about it.</p>
      <p>
        4.2. Personal data are used only for the stated purposes of their collection (Article 14 of the Law). They
        are not used for mailings, advertising or any other purpose.
      </p>

      <h2>5. Legal basis for processing — consent</h2>
      <p>
        5.1. Personal data are collected and processed with the subject's consent (paragraph 1 of Article 7, Article 8
        of the Law). Consent is given by ticking the box in the request form before sending it. Without the tick, the
        form does not send the request. You can contact the operator without filling in the form by the phone number
        given in section 2.
      </p>
      <p>
        5.2. The consent text contains the information required by paragraph 4 of Article 8 of the Law: the operator's
        name and BIN, the list of data collected, information on cross-border transfer and transfer to third parties,
        and the period of validity of the consent. The subject's surname and name are those entered in the "Name" field.
      </p>
      <p>
        5.3. The fact of consent, the date and time it was given and the version of this Policy are recorded in the
        request received by the operator; this confirms that consent was obtained in accordance with subparagraph 5)
        of paragraph 2 of Article 25 of the Law.
      </p>
      <p>
        5.4. Consent remains valid until the purposes of processing set out in section 4 are achieved (paragraph 6 of
        Article 8 of the Law) or until the subject withdraws it.
      </p>

      <h2>6. How the data are processed</h2>
      <p>
        6.1. After "Send request" is clicked, the data are sent over a secure connection (HTTPS) to the website
        server. The server checks that the fields are filled in and sends the request by e-mail to the operator's sales
        department mailbox, {EMAIL}. The website does not store requests in a database or keep them.
      </p>
      <p>
        6.2. If sending through the website is unavailable at the time, the form shows the request text and offers to
        send it yourself, by e-mail from the user's mailbox or as a WhatsApp message to the sales department number.
        In that case the data are transferred through the service chosen by the user on that service's terms.
      </p>
      <p>
        6.3. There is no automated processing of personal data that creates, changes or terminates the subject's rights
        (Article 19-1 of the Law): every request is reviewed by the operator's employees.
      </p>

      <h2>7. Transfer to third parties and cross-border transfer</h2>
      <p>7.1. The form uses the following services:</p>
      <ul>
        <li>Vercel Inc. (USA) — website hosting and the server function that receives the request;</li>
        <li>Resend (USA) — the e-mail delivery service used to send the request e-mail.</li>
      </ul>
      <p>
        7.2. Through these services the request data are transferred to the United States, which constitutes a
        cross-border transfer of personal data (Article 16 of the Law). It is carried out on the basis of the subject's
        consent given in the request form (paragraph 6 of Article 7, subparagraph 1) of paragraph 3 of Article 16 of
        the Law).
      </p>
      <p>
        7.3. Personal data are not transferred to any other third parties and are not published in publicly available
        sources, except where disclosure is required by the laws of the Republic of Kazakhstan (Article 9 of the Law).
      </p>

      <h2>8. Storage and destruction</h2>
      <p>
        8.1. The request is stored in the operator's sales department mailbox. The storage period is determined by the
        date on which the purposes of processing set out in section 4 are achieved, unless otherwise provided by the
        legislation of the Republic of Kazakhstan (paragraph 2 of Article 12 of the Law).
      </p>
      <p>
        8.2. Personal data are destroyed or deleted on the grounds set out in Article 18 of the Law: when the storage
        period expires, when the legal relationship with the subject ends, under a court decision that has entered into
        force, when processing without the subject's consent is discovered, and in other cases established by the
        legislation of the Republic of Kazakhstan.
      </p>

      <h2>9. Protection of personal data</h2>
      <p>9.1. The operator takes the personal data protection measures provided for by Article 22 of the Law. The website uses:</p>
      <ul>
        <li>data transfer only over a secure HTTPS connection;</li>
        <li>no request database on the website — the request is sent by e-mail immediately;</li>
        <li>checks that the request was sent from a website page, and limits on how often requests can be sent;</li>
        <li>limits on the size and types of attached files;</li>
        <li>security headers that prevent the website from being embedded in other pages and block third-party code.</li>
      </ul>
      <p>
        9.2. Persons who learn personal data in the course of their duties or employment must keep them confidential
        (paragraph 2 of Article 11 of the Law).
      </p>

      <h2>10. Rights of the personal data subject</h2>
      <p>10.1. Under Article 24 of the Law, the subject has the right to:</p>
      <ul>
        <li>
          know whether the operator holds their personal data and receive information confirming the fact, purpose,
          sources and methods of collection and processing, the list of personal data and the periods of processing,
          including storage;
        </li>
        <li>demand changes and additions to their personal data where there are grounds confirmed by documents;</li>
        <li>demand blocking and/or anonymization of their personal data where there is information that the conditions of collection and processing have been violated;</li>
        <li>
          demand destruction or deletion of their personal data collected and processed in breach of the law, and in
          other cases established by the Law;
        </li>
        <li>withdraw consent to the collection, processing and cross-border transfer of personal data, except in the cases provided for by paragraph 2 of Article 8 of the Law;</li>
        <li>protect their rights and legitimate interests, including compensation for moral and material damage;</li>
        <li>exercise other rights provided for by the Law and other laws of the Republic of Kazakhstan.</li>
      </ul>
      <p>
        10.2. An application (request) is submitted to the operator in writing to the address given in section 2, or as
        an electronic document to {EMAIL} (paragraph 2 of Article 10 of the Law). Access to personal data is provided
        free of charge.
      </p>
      <p>10.3. The operator's response times:</p>
      <ul>
        <li>
          information about the subject's personal data or a reasoned refusal — within three working days of receiving
          the application (paragraph 16 of the Rules);
        </li>
        <li>
          changing, supplementing, blocking, destroying or deleting personal data on the grounds of subparagraph 8) of
          paragraph 2 of Article 25 of the Law — within one working day;
        </li>
        <li>
          stopping processing after consent is withdrawn, or a reasoned refusal — within fifteen working days
          (paragraph 7 of Article 8 of the Law).
        </li>
      </ul>

      <h2>11. Appeals</h2>
      <p>
        11.1. The operator's actions (or failure to act) in collecting, processing and protecting personal data may be
        appealed in the manner established by the laws of the Republic of Kazakhstan (Article 30 of the Law).
      </p>
      <p>
        11.2. The subject may apply to the authorized body for personal data protection, the Ministry of Artificial
        Intelligence and Digital Development of the Republic of Kazakhstan, to check the operator's compliance with the
        requirements for collecting and processing personal data (paragraph 24 of the Rules), and may also go to court.
      </p>

      <h2>12. Third-party resources on the website</h2>
      <ul>
        <li>
          The map on the Contacts page loads images from Esri servers (server.arcgisonline.com). To load them, the
          user's browser sends these servers its IP address and technical request details.
        </li>
        <li>The video on the About us page is loaded from YouTube only after the play button is pressed.</li>
        <li>Links to WhatsApp, Instagram, 2GIS and Google Maps lead to third-party websites that process data under their own rules.</li>
      </ul>

      <h2>13. Changes to the Policy</h2>
      <p>
        13.1. A new version of the Policy is published on this page with its date. A request sent before a change is
        governed by the version in force when it was sent, which is stated in the request.
      </p>
    </article>
  );
}
