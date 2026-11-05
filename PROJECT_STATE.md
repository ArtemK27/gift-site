# 📱 ЧУЖОЙ СМАРТФОН В НОВОГОДНЮЮ НОЧЬ — ДОКУМЕНТАЦИЯ ПРОЕКТА И СОСТОЯНИЕ (HANDOVER GUIDE)

> **Для кого этот файл:** Этот документ создан для разработчика или любой языковой модели (ИИ), которая продолжит доработку или аудит проекта в новой сессии. Здесь собрана вся архитектура, назначение каждого файла, спецификации жестов и состояний, логика квеста, готовые модули и список задач для будущих доработок.

## Точка входа для следующей сессии — 2026-11-05

- **Сайт:** https://artemk27.github.io/gift-site/ ; **репозиторий:** https://github.com/ArtemK27/gift-site . Сборка опубликована в существующую ветку `gh-pages`; исходники и документы ведутся в `main`.
- **Принято пользователем:** свайпы предварительно одобрены на ПК; отдельное положение музыкального пузырька принято — он больше не пропадает. Не возвращать прежнюю компоновку без запроса. Проверка настоящим телефоном остаётся открытой.
- **Изменения кода:** HomeScreen использует единый пиксельный MotionValue для жеста и spring-доводки, ResizeObserver и reduced motion; DynamicIsland защищён от flex-сжатия; PhoneShell ограничивает контент min-h-0; MessengerApp прокручивает только чат вместо scrollIntoView предков. Исходное исчезновение пузырька до правок не воспроизвелось, первопричина не доказана.
- **Текущая проверка:** TypeScript/Vite build проходит с предупреждением JS chunk 534.34 kB. Свежий прогон трёх целевых E2E-наборов — 26/26 PASS. На опубликованном сайте обычным Playwright Chromium при 430×932 пройден квест от открытки до подарка и проверен плеер после выхода из мессенджера; console.error/pageerror/HTTP ≥400 не обнаружены.
- **Не считать закрытым:** ранее были нестабильные падения теста промежуточных кадров свайпа и шага стикера/«20»; полный комплект E2E сегодня не запускался. MCP Playwright не запускается из-за отсутствующего настроенного Chrome. PNG сохранены, но инструмент просмотра вернул forbidden path: визуальная приёмка и подозрение обрезки остаются открытыми. Chromium с iPhone user agent — не Safari.
- **Дальше:** получить приёмку на настоящем телефоне по ссылке; отдельно разбирать замечания только в согласованном объёме. [REVIEW_NOTES.md](./REVIEW_NOTES.md) — попутные замечания, не полный аудит; [TEST_READY.md](./TEST_READY.md) — команды и честные границы проверок. Старые цифры 44/44 и 104/104 не являются текущим QA-результатом.
- **Публикация:** `npm run deploy` собирает dist и публикует через gh-pages CLI без force push, с `.nojekyll`; права записи в origin обязательны. Не использовать прежний PowerShell-скрипт. Локальные `.sharrowkin/`, `before-home.png`, test-results и dist игнорируются Git. Не сохранять токены/секреты в документах.
- **Подарочные коды:** демонстрационные строки в клиенте, действительность не подтверждена. ПИН 2027 — механика игры, не механизм защиты секретов.

---

## 🎄 1. О проекте (Контекст и Концепция)

**Назначение:** Интерактивное веб-приложение — новогодний подарок для близкой подруги, оформленное как симулятор смартфона на базе **iOS 18** («Чужой смартфон в новогоднюю ночь»).

**Сеттинг и фандомы (ключевые персонажи):**
1. **О Сану (Sangwoo)** — манхва *Killing Stalking* («Убить сталкера»): дерзкий триллер-вайб, бита с гирляндой, новогодний колпак Санты, пентхаус с шампанским.
2. **Чу Ваньнин и Мо Жань (Тасянь-цзюнь)** — новелла *Erha* («Хаски и его белый кот-Учитель»): темное сянься, белый снег, хунтуни со «стеклом», красные китайские фонарики, божественное оружие Тяньвэнь.
3. **Kai Angel & 9mice** — дуэт *VIPERR*: готика, дарк-гламур, Rick Owens/Opium эстетика, шубы в пол, серебряная мишура, трек «Heavy Metal New Year».
4. **Милый ворон/котик** — уютный новогодний персонаж на экране-обманке у камина.

**Технический формат и адаптивное шасси (Chassis Architecture):**
- **Mobile Viewport (< 640px):** Полноэкранный режим edge-to-edge на всю высоту экрана (`w-full h-[100dvh] rounded-none border-0`), отсутствие рамок, полное погружение на смартфонах без лишних отступов.
- **Desktop Viewport (≥ 640px / `sm:`):** Центрированный премиальный мокап iPhone 16 Pro (`sm:w-[430px] sm:h-[min(932px,calc(100dvh-48px))] sm:rounded-[56px] sm:border-[10px] sm:border-[#232328] sm:ring-1 sm:ring-white/10 sm:shadow-[0_25px_80px_rgba(0,0,0,0.9)]`) с реалистичной прорезью динамика сверху (`w-14 h-1 bg-zinc-800 rounded-full`) и мягким окружающим неоновым свечением рабочего стола (`w-[540px] h-[860px] blur-3xl`).
- **Поддержка тактильного отклика:** Безопасная вибрация `navigator.vibrate` с глобальным переключателем в Настройках.
- **Полная автономность аудио:** Web Audio API синтезирует все звуковые эффекты на лету с нулевой задержкой без внешних аудиофайлов. Автоматическое праймирование контекста на первом клике пользователя предотвращает блокировку воспроизведения политиками браузера (Autoplay Policy).
- **Локальные ассеты:** Все иллюстрации и стикеры хранятся локально в `public/assets/`.

---

## 🗺️ 2. Карта файлов и архитектура («Что где и для чего лежит»)

```
Gift-site/
├── public/
│   └── assets/                     # 11 локальных сгенерированных ассетов (аватары, арты, стикеры)
├── src/
│   ├── components/
│   │   ├── apps/                   # Модульные приложения смартфона
│   │   │   ├── ClockApp.tsx        # Приложение «Часы» (Мировые часы, Будильник, Секундомер, Таймер 2027)
│   │   │   ├── GalleryApp.tsx      # Приложение «Фото» (iOS Photos с EXIF и пасхалкой)
│   │   │   ├── MessengerApp.tsx    # Приложение «ПодвалГрам» (чат Комитета + отправка стикеров)
│   │   │   ├── NotesApp.tsx        # Приложение «Заметки» (Apple Notes с чек-листами)
│   │   │   ├── SafeApp.tsx         # Приложение «VIP Сейф» (ПИН-код + Canvas со скретч-слоем льда)
│   │   │   ├── SettingsApp.tsx     # Приложение «Настройки» (Apple ID Сану, звуки, тактильность, обои, сброс)
│   │   │   └── WeatherApp.tsx      # Приложение «Погода» (Canvas-снегопад 60fps, прогноз -5°C, карточки инсайтов)
│   │   ├── home/                   # Компоненты рабочего стола SpringBoard
│   │   │   ├── AppIcon.tsx         # Сквиркл-иконка iOS со spring-нажатием и бейджами
│   │   │   ├── HomeDock.tsx        # Нижний плавающий стеклянный док (Dock)
│   │   │   ├── HomeWidgets.tsx     # Виджеты страниц 0 и 1 (Календарь, Квест, Мировые часы, Атмосфера)
│   │   │   └── homeAppsData.ts     # Централизованная конфигурация приложений и дока
│   │   ├── screens/                # Базовые системные экраны iOS 18
│   │   │   ├── BaitScreen.tsx      # Экран 0: Милая новогодняя открытка (обманка перед взломом)
│   │   │   ├── HomeScreen.tsx      # Экран 2: SpringBoard с горизонтальным свайпом страниц и точками
│   │   │   └── LockScreen.tsx      # Экран 1: Экран блокировки iOS 18 (часы, погода, стек уведомлений)
│   │   ├── DynamicIsland.tsx       # Интерактивный вырез Dynamic Island (плеер VIPERR с эквалайзером)
│   │   ├── LiveWallpaper.tsx       # Интерактивный Canvas: 3-слойный снег, боке, лепестки сливы
│   │   └── PhoneShell.tsx          # Рамка смартфона: статус-бар iOS, Island, изолированный Home Indicator
│   ├── context/
│   │   └── SettingsContext.tsx     # React Context для звука, вибро, обоев и localStorage
│   ├── types/
│   │   └── index.ts                # TypeScript-интерфейсы моделей данных (чаты, заметки, фото, настройки)
│   ├── utils/
│   │   └── haptics.ts              # Движок синтеза звуков (Web Audio API), праймирование и тактильная отдача
│   ├── App.tsx                     # Корневой контроллер состояний экранов и жестов выхода AppWindow
│   ├── index.css                   # Tailwind директивы и глобальные стили
│   └── main.tsx                    # Точка входа React 19
├── tests/
│   └── e2e/                        # Playwright E2E тесты (мобильный + десктопный профили)
├── PROJECT_STATE.md                # Данный файл полной документации проекта
└── README.md                       # Быстрый старт и обзор
```

### Подробное описание ключевых компонентов:

| Файл | Назначение и функционал |
| :--- | :--- |
| [`src/App.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/App.tsx) | **Главный оркестратор приложения.** Управляет переходами между системными экранами (`'bait'` → `'lock'` → `'home'`) и активным приложением (`activeApp`). Оборачивает активное приложение в `AppWindow` с реалистичной spring-физикой выхода. Выполняет праймирование Web Audio API на первом жесте (`pointerdown`). |
| [`src/context/SettingsContext.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/context/SettingsContext.tsx) | **Глобальное реактивное состояние настроек.** Управляет флагами `soundEnabled`, `hapticsEnabled`, выбранной темой обоев `wallpaper` и сбросом квеста `resetQuestProgress()`. Автоматически синхронизирует состояние с `localStorage` (`ios18_gift_settings`) и модулем `haptics.ts`. |
| [`src/utils/haptics.ts`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/utils/haptics.ts) | **Аудио- и тактильный движок.** Автономный синтезатор Web Audio API: щелчки клавиш (`playKeypadTone`), тапы (`playTapSound`), входящие сообщения (`playMessageSound`), треск льда (`playScratchSound`), победные фанфары (`playVictoryFanfare`), системный глитч (`playGlitchSound`). Модульные флаги `soundEnabled` и `hapticsEnabled` читаются мгновенно без ререндеров React. Функция `primeAudioContext()` для бесшовной разблокировки звука. |
| [`src/components/PhoneShell.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/PhoneShell.tsx) | **Каркас смартфона iOS.** Отрисовывает статус-бар (`23:59`, связь, Wi-Fi, 99% батареи с заливкой), Dynamic Island и изолированный контейнер Home Indicator (`#ios-home-indicator`) с обработкой свайпа вверх (`deltaY > 25`). Обеспечивает адаптивное шасси (edge-to-edge mobile / centered desktop mockup). |
| [`src/components/screens/HomeScreen.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/screens/HomeScreen.tsx) | **Рабочий стол (SpringBoard).** Модульный контейнер с поддержкой горизонтального перелистывания страниц (Page 0 и Page 1) через `framer-motion` pan gestures и единый пиксельный MotionValue, синхронизированными точками пагинации, виджетами и доком. |
| [`src/components/home/HomeWidgets.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/home/HomeWidgets.tsx) | **Виджеты рабочего стола.** `Page0Widgets`: Календарь-таймер до 2027 года и интерактивный статус квеста сейфа. `Page1Widgets`: Живые часы пентхауса Сану (GMT+9) и погодный инсайт атмосферы новогодней ночи. |
| [`src/components/home/AppIcon.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/home/AppIcon.tsx) | **Сквиркл-иконка приложения.** Аутентичная геометрия iOS с градиентами, легким spring-масштабированием при нажатии (`whileTap={{ scale: 0.90 }}`), бейджами непрочитанных сообщений/статусов и поддержкой режима дока (`size="dock"`). |
| [`src/components/home/HomeDock.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/home/HomeDock.tsx) | **Плавающий стеклянный док iOS.** Закрепленная панель `backdrop-blur-3xl` в нижней части рабочего стола с быстрыми ссылками на ключевые приложения (ПодвалГрам, Сейф, Заметки). |
| [`src/components/home/homeAppsData.ts`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/home/homeAppsData.ts) | **Конфигурация приложений.** Данные иконок, названий, цветов и бейджей для Page 0, Page 1 и Дока. Включает пасхалку — иконку «Консоль» с рут-привилегиями. |
| [`src/components/apps/SettingsApp.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/apps/SettingsApp.tsx) | **Приложение «Настройки».** Карточка профиля Apple ID Сану с корректным аватаром `w-14 h-14` (56px) и бейджем «Владелец устройства», тумблеры звука и виброотклика, выбор обоев, системная информация об iPhone 16 Pro (iOS 18.2) и модальное окно сброса прогресса квеста с подтверждением. |
| [`src/components/apps/ClockApp.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/apps/ClockApp.tsx) | **Приложение «Часы».** 4 функциональные вкладки: 1) Мировые часы с живым таймером до Нового Года 2027 и часовыми поясами (Сеул, Пик Сишэн, VIPERR); 2) Будильники с интерактивными тумблерами; 3) Секундомер с фиксацией кругов (Lap); 4) Новогодний таймер со стильным радиальным прогресс-баром и салютом конфетти. |
| [`src/components/apps/WeatherApp.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/apps/WeatherApp.tsx) | **Приложение «Погода».** 60fps Canvas-анимация снегопада (45 снежинок с параллаксом), текущая температура -5°C, статус «Снегопад», почасовой прогноз салюта в 00:00, 10-дневный прогноз и 4 карточки инсайтов (Влажность 88%, Вероятность чуда 100%, Видимость 6 км, Ветер 4 м/с). |
| [`src/components/apps/MessengerApp.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/apps/MessengerApp.tsx) | **Мессенджер «ПодвалГрам».** Групповой чат «Новогодний Комитет 🎄» с симуляцией набора текста, фото под спойлером Telegram и шторкой выбора праздничных стикеров. |
| [`src/components/apps/NotesApp.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/apps/NotesApp.tsx) | **Apple Notes.** Группировка заметок, строка поиска iCloud, детальный просмотр с интерактивными чек-листами (рецепт хунтуней и райдер артистов) и нижней панелью инструментов. |
| [`src/components/apps/GalleryApp.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/apps/GalleryApp.tsx) | **Apple Photos.** Сетка медиатеки с сегментами («Все фото», «Дни», «Месяцы»), полноэкранный просмотр, плашка EXIF-информации о съемке и секретный альбом «КТО ТАМ?». |
| [`src/components/apps/SafeApp.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/apps/SafeApp.tsx) | **VIP Сейф.** Цифровой нумпад, проверка кода `2027`. Внутри — карта `VIP PASS 2027` с Canvas-слоем морозного льда для стирания пальцем (>45%), переводы от персонажей и модалка выбора сертификата. |
| [`src/components/DynamicIsland.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/DynamicIsland.tsx) | **Динамический остров.** Показывает бегущую строку и эквалайзер; при тапе разворачивается в музыкальный плеер с треком «VIPERR — Heavy Metal New Year». |
| [`src/components/LiveWallpaper.tsx`](file:///d:/My%20creation/programming/Antigravity/TEST/Gift-site/src/components/LiveWallpaper.tsx) | **Живые обои на HTML5 Canvas.** 3 слоя глубины резкости снегопада, боке, лепестки сливы, интерактивная реакция на касания и мышь. |

---

## ⚡ 3. Спецификации жестов и физика переходов (Gesture Specifications)

### 3.1. Изолированный контейнер Home Indicator (`#ios-home-indicator`)
- **Размещение:** Закреплен на корневом уровне в `PhoneShell.tsx:123-140`.
- **CSS-параметры:** `absolute bottom-0 left-0 right-0 h-8 z-50 pointer-events-auto touch-none flex items-center justify-center`.
- **Строгая изоляция:** Никаких глобальных обработчиков `drag` на `window` или корневом элементе приложения. Свайп выхода перехватывается **только** внутри этой 32px зоны.
- **Детекция свайпа вверх:**
  - На тач-устройствах (`onTouchStart` / `onTouchEnd`): вычисляется смещение `deltaY = touchStartY - clientY`. Выход срабатывает при `deltaY > 25` (или при `deltaY > 15 && velocity > 0.25 px/ms`).
  - На десктопе (`onPointerDown` / `onPointerUp`): вычисляется `deltaY > 25` для событий мыши.
  - Тап по полоске: клик по Home Bar также закрывает приложение с защитой от двойного срабатывания (`debounce < 400ms`).

### 3.2. Физика закрытия приложений (Spring Exit Physics в `AppWindow`)
При закрытии приложения анимируется не резкое исчезновение, а естественный iOS 18 отскок с уменьшением масштаба и скруглением углов:
- **Initial:** `{ scale: 0.88, opacity: 0, y: 24, borderRadius: 36 }`
- **Animate:** `{ scale: 1, opacity: 1, y: 0, borderRadius: 0 }`
- **Exit:** `{ scale: 0.84, opacity: 0, y: -24, borderRadius: 44 }`
- **Spring Transition:**
  ```ts
  transition={{
    type: 'spring',
    stiffness: 320,
    damping: 28,
    mass: 0.75,
  }}
  ```
- Каждое приложение также снабжено альтернативной верхней кнопкой «Закрыть» (`<X />`) в навигационном баре.

### 3.3. Изоляция внутреннего скролла приложений (`touch-pan-y`)
Все внутренние контейнеры приложений (`MessengerApp`, `NotesApp`, `GalleryApp`, `SafeApp`, `SettingsApp`, `ClockApp`, `WeatherApp`) имеют:
- Класс `touch-pan-y` для предотвращения захвата жеста внешними оболочками;
- `overflow-y-auto` и `overscroll-contain`;
- Благодаря этому быстрый скролл чатов или длинных заметок никогда случайно не инициирует закрытие приложения или деформацию окна.

### 3.4. Пагинация рабочего стола SpringBoard
- Контейнер страниц в `HomeScreen.tsx` поддерживает горизонтальный свайп через `framer-motion`:
  - `onPanStart/onPan/onPanEnd` управляют одним пиксельным `MotionValue x`; страницы следуют за пальцем, затем `animate(x, target)` доводит их пружиной. Сопротивление `0.2` действует только на внешних краях. Ширина синхронизируется через ResizeObserver, доводка учитывает prefers-reduced-motion.
  - Порог переключения страницы: `info.offset.x < -45 || info.velocity.x < -250` (на страницу 1) и `info.offset.x > 45 || info.velocity.x > 250` (на страницу 0).
  - Синхронизированные кликабельные точки внизу (Dots) плавно анимируют активный индикатор (`w-2 h-2 bg-white` vs `w-1.5 h-1.5 bg-white/35`).

---

## 🔊 4. Архитектура состояния и аудио (State & Audio Architecture)

### 4.1. Глобальный реактивный контекст `SettingsContext`
- Расположен в `src/context/SettingsContext.tsx` и оборачивает всё приложение в `App.tsx`.
- Предоставляет:
  - `soundEnabled: boolean` — глобальный статус звуковых эффектов;
  - `hapticsEnabled: boolean` — глобальный статус вибрации;
  - `wallpaper: 'newyear' | 'sangwoo' | 'sisheng'` — выбранный стиль живых обоев;
  - `setSoundEnabled(enabled: boolean)` — переключение звука;
  - `setHapticsEnabled(enabled: boolean)` — переключение вибрации;
  - `setWallpaper(wallpaper: WallpaperId)` — смена обоев;
  - `resetQuestProgress()` — текущая реализация удаляет ключи localStorage origin, кроме настроек; это слишком широкий сброс и не сбрасывает локальные useState приложений. Требуется отдельная доработка (см. REVIEW_NOTES.md).
- **Персистентность:** Все изменения мгновенно сериализуются в `localStorage` по ключу `ios18_gift_settings`.

### 4.2. Модульные флаги синхронизации в `haptics.ts`
- Чтобы синтезатор звуков Web Audio API и виброотклик могли вызываться из любых утилитарных функций и обработчиков событий без оверхеда хуков React, в `src/utils/haptics.ts` поддерживаются модульные переменные `soundEnabled` и `hapticsEnabled`.
- При монтировании и обновлении `SettingsProvider` вызывает `setGlobalSound(...)` и `setGlobalHaptics(...)`.
- Все звуковые функции (`playTapSound`, `playKeypadTone`, `playMessageSound`, `playScratchSound`, `playVictoryFanfare`, `playGlitchSound`, `vibrate`) проверяют эти флаги в первой же строке.

### 4.3. Безопасное праймирование Web Audio API (Autoplay Priming)
- Мобильные браузеры (iOS Safari, Android Chrome) переводят `AudioContext` в состояние `suspended` до первого жеста пользователя.
- В `src/App.tsx:48-55` на корневое окно вешается однократный слушатель `pointerdown` с флагом `{ once: true }`, вызывающий `primeAudioContext()`.
- `primeAudioContext()` в `haptics.ts` пробуждает `ctx.resume()` и воспроизводит микро-буфер тишины (1 сэмпл), гарантируя, что все последующие клики и системные звуки будут звучать чисто и без блокировок.

---

## 🧩 5. Полный игровой флоу и логика квеста

```
[BaitScreen] (Уютная открытка с котом)
     │ Клик «Открыть поздравление 🎄» (праймирование AudioContext + переход)
     ▼
[GlitchScreen] (2 сек эффект взлома: помехи, звук матрицы, вибрация)
     │
     ▼
[LockScreen] (iOS 18: часы 23:59, уведомления от Сану, Чу Ваньнина, Системы)
     │ Свайп вверх или тап по подсказке
     ▼
[HomeScreen] (Рабочий стол: Page 0 — Квест, Page 1 — Часы/Погода)
     ├── 1. Зайти в «ПодвалГрам» ──► Отправить стикер ──► Сану пишет «20» (Часть 1/2)
     ├── 2. Зайти в «Заметки»    ──► Изучить рецепт хунтуней (2г) и райдер (7 пачек) ──► Найти «27» (Часть 2/2)
     ├── 3. Зайти в «Фото»       ──► Постучать 3 раза в альбом «КТО ТАМ?» (Пасхалка)
     ├── 4. Зайти в «Настройки»  ──► Управление звуком, вибро, обоями и сбросом
     └── 5. Зайти в «VIP Сейф»   ──► Ввести ПИН «2027»
                                       │
                                       ▼
                                 [Сейф открыт]
                                       │
                                 Стереть ледяной покров пальцем (>45%)
                                       │
                                 Конфетти + Выбор сертификата:
                                 🍏 «Золотое Яблоко» или 📦 «Ozon»
                                       │
                                 Модальное окно с промокодом:
                                 GOLDEN-APPLE-NY2027 / OZON-MAGIC-NY2027 (демонстрационные строки)
```

### 🗝️ ПИН-код от Сейфа: `2027`
- **Первые две цифры (`20`)**: добываются в приложении **«ПодвалГрам»**. Внизу открывается шторка стикеров. При отправке любого стикера Сану сообщает: *«Ха-ха, заценил. Первые две цифры от Сейфа — «20»!»*
- **Вторые две цифры (`27`)**: спрятаны в приложении **«Заметки»**.
  - В заметке *«Рецепт хунтуней от Чу Ваньнина»* выделена цифра **`2`** (*«ровно 2 грамма священного перца»*).
  - В заметке *«Новогодний райдер Kai Angel & 9mice»* выделена цифра **`7`** (*«7 пачек серебряной мишуры»*).
- **Интерактивный скретч-слой в Сейфе**:
  - Карточка `VIP PASS 2027` залита ледяным узором.
  - При движении пальца или мыши `destination-out` стирает мороз с реалистичным треском льда (`playScratchSound`).
  - При достижении ≥ 45% прозрачности лед тает, взрывается салют `canvas-confetti` и открываются кнопки выбора подарка.

---

## 🎨 6. Реестр локальных изображений (`public/assets/`)

Все изображения сгенерированы специально для проекта и лежат локально:

| Имя файла | Описание | Где используется |
| :--- | :--- | :--- |
| `bait_cover.jpg` | Уютный пушистый кот в шарфе у камина с ёлкой | `BaitScreen.tsx` |
| `avatar_sangwoo.jpg` | О Сану в колпаке Санты с бокалом шампанского | `LockScreen`, `MessengerApp`, `SettingsApp` (профиль Apple ID) |
| `avatar_chu_wanning.jpg` | Чу Ваньнин в белом ханьфу с меховым воротником | `LockScreen`, `MessengerApp` |
| `avatar_mo_ran.jpg` | Мо Жань в темных одеждах сянься с улыбкой | `MessengerApp` |
| `avatar_kai_angel.jpg` | Kai Angel в темных очках и серебряных цепях | `MessengerApp` |
| `art_spoiler_erha.jpg` | Чу Ваньнин и Мо Жань на заснеженном пике Сишэн | Спойлер в чате, `GalleryApp` |
| `art_spoiler_sangwoo.jpg` | О Сану на балконе ночного пентхауса | Спойлер в чате, `GalleryApp` |
| `art_spoiler_viperr.jpg` | VIPERR backstage рейв в шубах с мишурой | Спойлер в чате, `GalleryApp` |
| `sticker_sangwoo.png` | Чиби-стикер Сану с имбирным пряником | Стикерпак в `MessengerApp` |
| `sticker_chu_wanning.png` | Чиби-стикер котика Чу Ваньнина с тарелкой хунтуней | Стикерпак в `MessengerApp` |
| `sticker_viperr.png` | Стикер летучей мыши VIPERR в новогоднем колпаке | Стикерпак в `MessengerApp` |

---

## 💻 7. Технический стек и команды разработки

- **Стек:** React 19, TypeScript, Vite 6, Tailwind CSS 3, `framer-motion` 12, `lucide-react`, `canvas-confetti`; публикация через `gh-pages` 6. Точные установленные версии — package-lock.json; последняя сборка выполнена Vite 6.4.5.
- **E2E Тестирование:** Playwright (профили `mobile-iphone-16-pro` 430x932 и `desktop-mockup` 1280x800).
- **Конфигурация сборки:** `vite.config.ts` содержит `base: './'` для относительных путей сборки на GitHub Pages. Локально использовать dev/preview HTTP-сервер, а не открывать index.html через file://.

### Команды терминала:
> ⚠️ **Для Windows PowerShell:** Если `npm` блокируется политикой скриптов, используйте `npm.cmd` или `npx.cmd`.

```powershell
# Установка зависимостей
npm.cmd install

# Запуск dev-сервера с HMR
npm.cmd run dev

# Проверка типов и сборка production-бандла в папку dist/
npm.cmd run build

# Предпросмотр собранного бандла
npm.cmd run preview

# Запуск полного комплекта Playwright E2E тестов
npx.cmd playwright test

# Запуск эмпирического стресс-теста Challenger 2
npx.cmd playwright test tests/e2e/challenger2-empirical.spec.ts

# Деплой на GitHub Pages (ветка gh-pages)
npm.cmd run deploy
```

---

## 🏆 8. Статус реализации и верификация (QA & Health Status)

- **Avatar Layout Fix (`SettingsApp.tsx:153`):** Исправлен невалидный класс `w-15 h-15` на стандартизированный `w-14 h-14` (56px). Контейнер аватара надежно ограничен по ширине и высоте, предотвращая искажение сетки и скрытие информации о владельце устройства («О Сану»).
- **TypeScript & Build (2026-11-05):** PASS, Exit code 0; остаётся предупреждение о JS chunk >500 kB (534.34 kB до gzip).
- **E2E (2026-11-05):** 26/26 PASS: home-motion-regressions, milestone3-homescreen-apps, tier4-scenarios на двух профилях. Полный каталог не запускался; прежние падения свайпа/стикера не считать окончательно устранёнными одним прогоном. Подробности и ограничения — TEST_READY.md.
- **Опубликованная сборка:** index-VNvkjWpg.js, проверены HTTP 200 и полный квест при 430×932, ошибок консоли/страницы/HTTP ≥400 не обнаружено. Визуальная приёмка и реальное устройство не проверены.
- **Целостность эмоционального контента:** Все пасхалки, подсказки квеста, рецепты Чу Ваньнина, райдер VIPERR, сейф `2027` и призы сохранены в неизменном виде.
