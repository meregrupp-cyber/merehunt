import { facts, faq, org, routeSummaries, UPDATED } from './site.mjs';

const mailto = (subject, body = '') => {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${org.email}?${params.toString()}`;
};

const directContact = (subject, heading = 'Свяжитесь с нами напрямую', text = 'Расскажите, что вы хотите сделать, когда планируете приехать и какой у вас опыт. Мы уточним только необходимые детали.') => `
<section class="band contact-band" aria-labelledby="contact-heading">
  <div class="inner contact-grid">
    <div>
      <p class="eyebrow">Прямой контакт</p>
      <h2 id="contact-heading">${heading}</h2>
      <p class="lede measured">${text}</p>
    </div>
    <div class="contact-actions" aria-label="Способы связи">
      <a class="btn btn-primary" href="${mailto(subject, 'Здравствуйте!\n\nМеня интересует:\nЖелаемый период:\nМой опыт:\nУдобный язык: русский / английский\n')}">Написать на e-mail</a>
      <a class="btn" href="tel:${org.phoneHref}">Позвонить ${org.phone}</a>
      <a class="text-link" href="${org.facebook}" target="_blank" rel="noopener noreferrer">Facebook <span aria-hidden="true">↗</span></a>
    </div>
  </div>
</section>`;

const routeCards = (exclude = '') => `
<div class="route-grid">
  ${routeSummaries.filter((route) => route.id !== exclude).map((route) => `
  <article class="route-card" id="${route.id}">
    <p class="marker">${route.marker}</p>
    <h3>${route.title}</h3>
    <p class="fit">${route.fit}</p>
    <p>${route.text}</p>
    <a class="card-link" href="${route.href}">${route.cta} <span aria-hidden="true">→</span></a>
  </article>`).join('')}
</div>`;

const faqBlock = () => `
<div class="faq-list" itemscope itemtype="https://schema.org/FAQPage">
  ${faq.map(({ question, answer }) => `
  <details itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
    <summary><span itemprop="name">${question}</span></summary>
    <div class="faq-answer" itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
      <p itemprop="text">${answer}</p>
    </div>
  </details>`).join('')}
</div>`;

const homeBody = `
<section class="band legacy-intro" aria-labelledby="legacy-title">
  <div class="inner legacy-note">
    <div class="legacy-mark" aria-hidden="true">M</div>
    <div>
      <p class="eyebrow">Знакомая вода · больше понимания</p>
      <h2 id="legacy-title">Подводная охота во многом опирается на фридайвинг</h2>
      <p>Задержка дыхания, расслабление, компенсация давления, экономичное движение и восстановительное дыхание — общая основа обеих практик. При нырянии на задержке дыхания существует риск потери сознания (блэкаута). Системное обучение помогает понять факторы риска, выстроить безопасную практику и отработать действия страхующего напарника.</p>
      <a class="text-link" href="/merehunt/">Чем фридайвинг полезен подводному охотнику <span aria-hidden="true">→</span></a>
    </div>
  </div>
</section>

<section id="routes" class="band band-alt" aria-labelledby="routes-title">
  <div class="inner">
    <p class="eyebrow">Три пути · одна команда</p>
    <h2 id="routes-title">Выберите вариант по своему опыту и планам</h2>
    <p class="lede measured">Начните с основ, приезжайте в Румму с уже пройденным обучением или заранее спланируйте поездку в Эстонию. У каждого варианта свои условия — без универсальных обещаний.</p>
    ${routeCards()}
  </div>
</section>

<section id="safety" class="band safety-band" aria-labelledby="safety-title">
  <div class="inner">
    <p class="eyebrow">Безопасность и команда</p>
    <h2 id="safety-title">Один принцип на каждом занятии: сначала контроль</h2>
    <div class="panel-grid">
      <article class="panel">
        <p class="panel-number">01</p>
        <h3>Напарник и страховка</h3>
        <p>Каждое погружение проходит с напарником, наблюдением на поверхности, понятными сигналами и заранее согласованными ограничениями.</p>
      </article>
      <article class="panel">
        <p class="panel-number">02</p>
        <h3>Инструктор в воде</h3>
        <p>Техника разбирается постепенно. Инструктор видит выполнение упражнения и останавливает его раньше, чем результат становится важнее контроля.</p>
      </article>
      <article class="panel panel-warning">
        <p class="panel-number">03</p>
        <h3>Условия важнее плана</h3>
        <p>Открытая вода не даёт гарантий. Погода, температура, видимость и доступ могут изменить или отменить погружение.</p>
      </article>
    </div>

    <div class="team-grid" aria-labelledby="team-title">
      <div class="team-copy">
        <p class="eyebrow">Люди, а не платформа</p>
        <h3 id="team-title">С вами работает местная команда</h3>
        <p>Таниэль — руководитель и главный тренер. Илона — инструктор. Занятия проходят на русском или английском языке.</p>
        <p class="small muted">На сайте намеренно нет автоматической записи: дату, формат и пригодность выбранного варианта подтверждает человек из команды.</p>
      </div>
      <figure class="person-card">
        <img src="/assets/images/taniel.webp" width="760" height="507" loading="lazy" decoding="async" alt="Таниэль, главный тренер Meregrupp" />
        <figcaption><strong>Таниэль</strong><span>Руководитель · главный тренер</span></figcaption>
      </figure>
      <figure class="person-card">
        <img src="/assets/images/ilona.webp" width="760" height="462" loading="lazy" decoding="async" alt="Илона, инструктор Meregrupp" />
        <figcaption><strong>Илона</strong><span>Инструктор</span></figcaption>
      </figure>
    </div>
  </div>
</section>

<section id="training" class="band band-teal" aria-labelledby="training-title">
  <div class="inner">
    <p class="eyebrow">Продолжайте практику</p>
    <h2 id="training-title">Фридайвинг развивается регулярностью</h2>
    <div class="two-column">
      <article class="panel">
        <h3>Регулярные тренировки</h3>
        <p>Для живущих в Эстонии и постоянных гостей: тренировки в бассейне и практика на открытой воде по сезону. Актуальное время уточняйте напрямую.</p>
        <a class="text-link" href="${mailto('Регулярные тренировки по фридайвингу', 'Здравствуйте!\n\nХочу узнать об актуальных тренировках.\nМой опыт:\nУдобный язык: русский / английский\n')}">Спросить о тренировках <span aria-hidden="true">→</span></a>
      </article>
      <article class="panel">
        <h3>Индивидуальные занятия</h3>
        <p>Если график группы не подходит, обсудите индивидуальный или небольшой групповой формат. Условия согласуются под опыт, цель и доступное время.</p>
        <a class="text-link" href="${mailto('Индивидуальное занятие по фридайвингу', 'Здравствуйте!\n\nХочу обсудить индивидуальное занятие.\nЖелаемый период:\nКоличество участников:\nОпыт:\n')}">Обсудить занятие <span aria-hidden="true">→</span></a>
      </article>
    </div>
  </div>
</section>

<section id="faq" class="band band-alt" aria-labelledby="faq-title">
  <div class="inner faq-layout">
    <div>
      <p class="eyebrow">Коротко и по делу</p>
      <h2 id="faq-title">Частые вопросы</h2>
      <p class="lede">Если вашего вопроса здесь нет, напишите или позвоните. Форму заполнять не нужно.</p>
    </div>
    ${faqBlock()}
  </div>
</section>

${directContact('Фридайвинг в Эстонии — вопрос', 'Выберите первый шаг', 'Напишите, если не уверены, какой вариант подходит. Достаточно указать свой опыт, желаемое время и удобный язык — русский или английский.')}`;

const courseBody = `
<section class="band summary-band" aria-labelledby="course-summary-title">
  <div class="inner summary-grid">
    <div>
      <p class="eyebrow">Level 1 · начало с основ</p>
      <h2 id="course-summary-title">Курс для начинающих</h2>
      <p class="lede">Предыдущий опыт во фридайвинге не нужен. Важно уверенно чувствовать себя в воде и уметь плавать.</p>
    </div>
    <dl class="fact-list">
      <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        <dt>Стоимость</dt>
        <dd><span itemprop="price" content="${facts.level1PriceEur}">${facts.level1PriceEur} €</span><meta itemprop="priceCurrency" content="EUR" /></dd>
      </div>
      <div><dt>Язык</dt><dd>Русский или английский</dd></div>
      <div><dt>Место</dt><dd>Бассейн в Таллинне</dd></div>
      <div><dt>Расписание</dt><dd>Согласуется напрямую</dd></div>
    </dl>
  </div>
</section>

<section class="band band-alt" aria-labelledby="course-process-title">
  <div class="inner">
    <p class="eyebrow">Спокойно · постепенно · под наблюдением</p>
    <h2 id="course-process-title">Что вы осваиваете</h2>
    <div class="step-grid">
      <article class="step"><span>01</span><h3>Дыхание и расслабление</h3><p>Подготовка начинается не с усилия, а со спокойного ритма, положения тела и умения вовремя остановиться.</p></article>
      <article class="step"><span>02</span><h3>Компенсация давления</h3><p>Вы учитесь компенсировать давление заранее и мягко, не терпеть дискомфорт и не продолжать упражнение через боль.</p></article>
      <article class="step"><span>03</span><h3>Техника и восстановление</h3><p>Положение тела, движение, работа с напарником и контролируемое восстановление на поверхности складываются в одну понятную последовательность.</p></article>
    </div>
  </div>
</section>

<section class="band safety-band" aria-labelledby="course-fit-title">
  <div class="inner">
    <p class="eyebrow">Перед началом</p>
    <h2 id="course-fit-title">Подходит ли вам этот курс?</h2>
    <div class="two-column">
      <article class="panel">
        <h3>Курс подходит, если</h3>
        <ul class="check-list">
          <li>вы начинаете с нуля или раньше только плавали с маской и трубкой;</li>
          <li>вы умеете плавать и спокойно чувствуете себя в воде;</li>
          <li>вы хотите понимать технику и правила безопасности, а не гнаться за цифрами.</li>
        </ul>
      </article>
      <article class="panel panel-warning">
        <h3>Сначала свяжитесь с нами, если</h3>
        <ul class="check-list">
          <li>участник несовершеннолетний;</li>
          <li>состояние здоровья может влиять на задержку дыхания или занятия в воде;</li>
          <li>вам нужен разовый вводный формат, а не полный курс.</li>
        </ul>
      </article>
    </div>
    <p class="safety-note">Цель первого курса — не максимальная глубина и не рекорд задержки дыхания. Цель — спокойная, контролируемая техника, которую можно развивать дальше.</p>
  </div>
</section>

${directContact('Базовый курс фридайвинга Level 1', 'Уточните ближайшую возможность начать', 'Укажите желаемый период, количество участников и удобный язык. Продолжительность, точное расписание и остальные условия подтверждаются до начала занятий.')}

<section class="band band-alt" aria-labelledby="course-next-title"><div class="inner"><p class="eyebrow">Другие варианты</p><h2 id="course-next-title">После обучения или для будущей поездки</h2>${routeCards('course')}</div></section>`;

const rummuBody = `
<section class="band summary-band" aria-labelledby="rummu-story-title">
  <div class="inner narrow">
    <p class="eyebrow">Место с историей</p>
    <h2 id="rummu-story-title">Затопленный известняковый карьер</h2>
    <p class="lede">В Румму десятилетиями действовали известняковый карьер и тюрьма. После прекращения добычи территория быстро заполнилась водой, частично скрыв стены и здания.</p>
    <p>Это необычное место, но не аттракцион с гарантированным сценарием. Температура воды, погода, видимость и доступ меняются, поэтому план всегда остаётся условным до проверки на месте.</p>
  </div>
</section>

<section class="band band-alt" aria-labelledby="rummu-fit-title">
  <div class="inner">
    <p class="eyebrow">Не курс для начинающих</p>
    <h2 id="rummu-fit-title">Кому подходит погружение</h2>
    <div class="two-column">
      <article class="panel">
        <h3>От участника требуется</h3>
        <ul class="check-list">
          <li>сертификат по фридайвингу или другое подтверждение обучения;</li>
          <li>недавняя практика и честное описание комфортного уровня;</li>
          <li>уверенность на открытой воде и знакомство со своим снаряжением;</li>
          <li>готовность соблюдать брифинг и решения инструктора.</li>
        </ul>
      </article>
      <article class="panel panel-warning">
        <h3>Что зависит от условий</h3>
        <ul class="check-list">
          <li>возможность провести погружение в выбранный день;</li>
          <li>доступная зона и рабочий план;</li>
          <li>видимость, температура и продолжительность практики;</li>
          <li>окончательное решение о проведении.</li>
        </ul>
      </article>
    </div>
  </div>
</section>

<section class="band safety-band" aria-labelledby="rummu-process-title">
  <div class="inner">
    <p class="eyebrow">Как принимается решение</p>
    <h2 id="rummu-process-title">Опыт → условия → брифинг → погружение</h2>
    <div class="step-grid">
      <article class="step"><span>01</span><h3>Проверяем подготовку</h3><p>Вы сообщаете, какое обучение прошли, когда в последний раз погружались и на каком уровне чувствуете себя уверенно. Это не соревнование на максимальную цифру.</p></article>
      <article class="step"><span>02</span><h3>Сверяем условия</h3><p>Команда оценивает погоду, воду, видимость и доступ. План может измениться, а погружение — не состояться.</p></article>
      <article class="step"><span>03</span><h3>Работаем по брифингу</h3><p>Каждое погружение проходит с напарником и страховкой на поверхности. Окончательное решение остаётся за инструктором.</p></article>
    </div>
    <p class="safety-note">Погружение в Румму — это сопровождение подготовленного фридайвера, а не обучение с нуля и не обещание конкретной глубины.</p>
  </div>
</section>

${directContact('Погружение в Румму — проверка опыта и периода', 'Обсудите Румму с командой', 'В письме укажите обучение, дату последнего погружения, свой комфортный уровень, желаемый период и удобный язык общения.')}

<section class="band band-alt" aria-labelledby="rummu-other-title"><div class="inner"><p class="eyebrow">Если Румму пока не подходит</p><h2 id="rummu-other-title">Начните с курса или спланируйте поездку</h2>${routeCards('rummu')}</div></section>`;

const tripBody = `
<section class="band summary-band" aria-labelledby="trip-summary-title">
  <div class="inner summary-grid">
    <div>
      <p class="eyebrow">Ориентир · ${facts.planningHorizon}</p>
      <h2 id="trip-summary-title">Сначала сезон и опыт, затем маршрут</h2>
      <p class="lede">Эстонская открытая вода меняется вместе с сезоном. Реалистичный план строится вокруг подготовки группы, холода, доступа и безопасных альтернатив.</p>
    </div>
    <div class="signal-card">
      <span>План не является готовым турпакетом</span>
      <p>Дата, программа, логистика и стоимость появляются только после прямого обсуждения.</p>
    </div>
  </div>
</section>

<section class="band band-alt" aria-labelledby="trip-seasons-title">
  <div class="inner">
    <p class="eyebrow">Эстония в разные сезоны</p>
    <h2 id="trip-seasons-title">Что учитывать заранее</h2>
    <div class="panel-grid">
      <article class="panel"><h3>Открытая вода</h3><p>В более тёплый сезон проще планировать практику на открытой воде, но ветер, температура и видимость всё равно определяют конкретный день.</p></article>
      <article class="panel"><h3>Холодная вода</h3><p>Защита от холода, подходящее снаряжение и привычка к условиям важны большую часть года. Детали зависят от опыта каждого участника.</p></article>
      <article class="panel panel-warning"><h3>Зимний лёд</h3><p>Практика подо льдом возможна только для подготовленных участников, со специальной организацией и при подходящих условиях. Она не гарантируется как часть поездки.</p></article>
    </div>
  </div>
</section>

<section class="band safety-band" aria-labelledby="trip-process-title">
  <div class="inner">
    <p class="eyebrow">Планирование с местной командой</p>
    <h2 id="trip-process-title">От идеи к рабочему варианту</h2>
    <div class="step-grid">
      <article class="step"><span>01</span><h3>Опыт и цель</h3><p>Кто приезжает, какое обучение уже пройдено и чего группа ожидает от поездки.</p></article>
      <article class="step"><span>02</span><h3>Период и логистика</h3><p>Сопоставляем желаемый сезон, доступное время, размер группы и практические ограничения.</p></article>
      <article class="step"><span>03</span><h3>Основной и запасной план</h3><p>Фиксируем реалистичные варианты, сохраняя право изменить программу по погоде и воде.</p></article>
    </div>
  </div>
</section>

${directContact('Поездка для фридайвинга в Эстонию', 'Начните с короткого описания поездки', 'Укажите предполагаемый период, количество участников, обучение и опыт каждого, желаемые активности и удобный язык общения.')}

<section class="band band-alt" aria-labelledby="trip-other-title"><div class="inner"><p class="eyebrow">Ближе к практике</p><h2 id="trip-other-title">Курс для начинающих или Румму для подготовленных</h2>${routeCards('trip')}</div></section>`;

const legacyBody = `
<section class="band summary-band" aria-labelledby="legacy-history-title">
  <div class="inner narrow">
    <p class="eyebrow">Общая основа</p>
    <h2 id="legacy-history-title">Знакомый опыт можно сделать более осознанным</h2>
    <p class="lede">Для многих русскоязычных любителей моря, снаряжения и подводной охоты имя Merehunt уже знакомо. Фридайвинг продолжает эту водную тему с акцентом на технику, физиологию и безопасность ныряния на задержке дыхания.</p>
    <p>Даже опытный подводный охотник может по-новому посмотреть на расслабление, компенсацию давления, плавучесть, экономичность движения, поверхностные интервалы и восстановительное дыхание.</p>
  </div>
</section>

<section class="band band-alt" aria-labelledby="legacy-difference-title">
  <div class="inner">
    <p class="eyebrow">Техника · физиология · безопасность</p>
    <h2 id="legacy-difference-title">Что обучение фридайвингу добавляет к опыту подводной охоты</h2>
    <div class="panel-grid">
      <article class="panel"><h3>Меньше лишнего усилия</h3><p>Расслабление, положение тела, работа ластами и своевременная компенсация давления помогают сделать погружение спокойнее и экономичнее.</p></article>
      <article class="panel panel-warning"><h3>Блэкаут — реальный риск</h3><p>Потеря сознания возможна при нырянии на задержке дыхания, в том числе во время подводной охоты. Теория помогает понять факторы риска, а практическое обучение — закрепить безопасные привычки и действия при нештатной ситуации.</p></article>
      <article class="panel"><h3>Напарник, который умеет страховать</h3><p>Просто находиться рядом недостаточно. Страхующий напарник должен знать план погружения, внимательно наблюдать за возвращением на поверхность и уметь оказать помощь.</p></article>
    </div>
  </div>
</section>

<section class="band safety-band" aria-labelledby="legacy-next-title">
  <div class="inner">
    <p class="eyebrow">Следующий шаг</p>
    <h2 id="legacy-next-title">Используйте знакомый опыт как преимущество</h2>
    ${routeCards()}
  </div>
</section>

${directContact('Фридайвинг для подводного охотника', 'Хотите сделать свои погружения более осознанными?', 'Расскажите, как часто и в каких условиях вы ныряете, какое обучение уже проходили и что хотите улучшить. Мы подскажем подходящий следующий шаг.')}`;

export const pages = Object.freeze([
  {
    path: '/',
    output: 'index.html',
    kind: 'home',
    schemaType: 'WebPage',
    updated: UPDATED,
    title: 'Фридайвинг в Эстонии на русском и английском | Merehunt',
    description: 'Курсы фридайвинга в Таллинне, погружения в Румму для подготовленных участников и планирование поездок в Эстонию. Обучение на русском и английском.',
    ogDescription: 'Начните с базового курса, обсудите погружение в Румму или спланируйте поездку для фридайвинга в Эстонию.',
    eyebrow: 'Фридайвинг · Эстония',
    h1: 'Фридайвинг в Эстонии <em>на русском и английском</em>',
    lede: 'Начните с базового курса, присоединитесь к подходящему погружению в Румму или спланируйте поездку в Эстонию вместе с местной командой.',
    heroImage: '/assets/images/freediver-depth-blue.webp',
    heroAlt: '',
    primaryCta: { href: '/kurs-fridajvinga/', label: 'Начать с курса' },
    secondaryCta: { href: '#routes', label: 'Посмотреть варианты' },
    body: homeBody,
  },
  {
    path: '/kurs-fridajvinga/',
    output: 'kurs-fridajvinga/index.html',
    kind: 'course',
    schemaType: 'Course',
    updated: UPDATED,
    title: 'Базовый курс фридайвинга в Таллинне — Level 1 | Merehunt',
    description: `Курс фридайвинга Level 1 для начинающих в Таллинне: дыхание, расслабление, компенсация давления и безопасная практика. Русский или английский, ${facts.level1PriceEur} €.`,
    ogDescription: `Спокойное начало фридайвинга в Таллинне. Level 1 для начинающих — ${facts.level1PriceEur} €, обучение на русском или английском.`,
    eyebrow: 'Базовый курс · Таллинн',
    h1: 'Первое погружение начинается <em>со спокойствия</em>',
    lede: 'Один навык за другим: дыхание, расслабление, компенсация давления, техника, работа с напарником и контролируемое восстановление на поверхности.',
    heroImage: '/assets/images/freediver-depth-blue.webp',
    heroAlt: '',
    primaryCta: { href: '#contact-heading', label: 'Уточнить начало курса' },
    secondaryCta: { href: '#course-fit-title', label: 'Проверить, подходит ли курс' },
    body: courseBody,
  },
  {
    path: '/rummu/',
    output: 'rummu/index.html',
    kind: 'rummu',
    schemaType: 'Service',
    updated: UPDATED,
    title: 'Фридайвинг в Румму с местной командой | Merehunt',
    description: 'Погружение в затопленном карьере Румму для фридайверов с обучением и недавней практикой. Брифинг, напарник, страховка на поверхности и решение по условиям.',
    ogDescription: 'Румму для подготовленного фридайвера: местная команда, брифинг, страховка на поверхности и решение по фактическим условиям.',
    eyebrow: 'Румму · открытая вода',
    h1: 'Фридайвинг в Румму <em>с местной командой</em>',
    lede: 'Погружение для фридайвера с пройденным обучением и недавней практикой. Это не первый урок и не гарантированная программа независимо от условий.',
    heroImage: '/assets/images/open-water-team.webp',
    heroAlt: 'Группа фридайверов на тренировке в открытой воде',
    primaryCta: { href: '#contact-heading', label: 'Обсудить погружение' },
    secondaryCta: { href: '#rummu-fit-title', label: 'Условия участия' },
    body: rummuBody,
  },
  {
    path: '/poezdka-v-estoniyu/',
    output: 'poezdka-v-estoniyu/index.html',
    kind: 'trip',
    schemaType: 'Service',
    updated: UPDATED,
    title: 'Поездка для фридайвинга в Эстонию — планирование | Merehunt',
    description: 'Спланируйте поездку для фридайвинга в Эстонию с местной командой: сезон, холодная вода, Румму, логистика и запасной план. Русский или английский.',
    ogDescription: 'Реалистичный план поездки для фридайвинга в Эстонию: опыт группы, сезон, открытая вода, холод и логистика.',
    eyebrow: 'Планирование · Эстония',
    h1: 'Спланируйте поездку для фридайвинга <em>в Эстонию</em>',
    lede: `Начните за ${facts.planningHorizon}: сопоставьте сезон, опыт группы, холодную воду, логистику и безопасные альтернативы вместе с местной командой.`,
    heroImage: '/assets/images/open-water-team.webp',
    heroAlt: 'Фридайверы во время практики в холодной открытой воде',
    primaryCta: { href: '#contact-heading', label: 'Начать планирование' },
    secondaryCta: { href: '#trip-seasons-title', label: 'Учесть сезон' },
    body: tripBody,
  },
  {
    path: '/merehunt/',
    output: 'merehunt/index.html',
    kind: 'legacy',
    schemaType: 'WebPage',
    updated: UPDATED,
    title: 'Фридайвинг для подводного охотника в Эстонии | Merehunt',
    description: 'Как навыки фридайвинга дополняют опыт подводной охоты: техника ныряния, компенсация давления, восстановительное дыхание, напарник и профилактика блэкаута.',
    ogDescription: 'Знакомые навыки подводной охоты — системный взгляд фридайвинга на технику, физиологию и безопасность.',
    eyebrow: 'Merehunt · знакомая вода',
    h1: 'Фридайвинг для <em>подводного охотника</em>',
    lede: 'Подводная охота во многом строится на нырянии с задержкой дыхания. Обучение фридайвингу помогает системно разобрать технику, физиологию и безопасность того, что уже знакомо на практике.',
    heroImage: '/assets/images/freediver-depth-blue.webp',
    heroAlt: '',
    primaryCta: { href: '/kurs-fridajvinga/', label: 'Начать с курса' },
    secondaryCta: { href: '#legacy-difference-title', label: 'Что даёт обучение' },
    body: legacyBody,
  },
]);
