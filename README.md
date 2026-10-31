# LUMEN v1 для Lampa

Первая рабочая версия плагина **LUMEN** для медиаплатформы [Lampa](https://github.com/yumata/lampa-source).  
Это **плагин**, а не замена Lampa: поиск и карточки фильмов/сериалов остаются штатными (TMDB), LUMEN добавляет кнопку на полной карточке, экран источников и воспроизведение через `Lampa.Player`.

> Ветка `lumen-v1` — **кандидат на review**, не финальный релиз.

## Что умеет v1

- Кнопка **LUMEN** на полной карточке (`Lampa.Listener` → `full:complite`, данные из `e.data.movie`)
- Экран источников с постером и описанием (кинематографичный тёмный UI)
- Выбор источника → качество (если есть) → `Lampa.Player.play` / playlist
- Сезоны/серии через отдельный Activity-экран с сохранением фокуса
- Настройки: Demo-источник, Custom HTTP URL, экранный debug-лог
- Универсальный **Provider Registry** (новые адаптеры без ломки ядра)

## Источники (важно)

В runtime v1 подключены только:

1. **Demo** — тестовые ролики (Blender open movies / sample MP4), включается в настройках (по умолчанию вкл.)
2. **Custom HTTP** — ваш URL с JSON по [контракту](docs/PROVIDER_CONTRACT.md)

**Не** подключены: Jellyfin/Emby/Plex (черновик адаптера лежит в `src/providers/examples/`), scraper `lumen-parser.onrender.com` (снимок в `legacy/`, в сборку не входит).

## Установка на Vontar R3 (только пульт + iPhone)

### 1. Скопируйте URL плагина на iPhone

Рекомендуемые URL (после merge/push ветки):

- **jsDelivr (ветка v1):**  
  `https://cdn.jsdelivr.net/gh/barcola204-cell/Lumen-plugin@lumen-v1/engine.js`
- **GitHub Pages (если Pages смотрит на эту ветку/файл):**  
  `https://barcola204-cell.github.io/Lumen-plugin/engine.js`
- Чтобы обойти кэш CDN, используйте URL с SHA коммита:  
  `https://cdn.jsdelivr.net/gh/barcola204-cell/Lumen-plugin@<SHA>/engine.js`

Сохраните ссылку в «Заметки» на iPhone.

### 2. Добавьте плагин в Lampa

1. Откройте **Lampa** на приставке.  
2. **Настройки → Расширения** (в исходниках Lampa: `settings_main_plugins` = «Расширения»).  
3. **Добавить плагин** (`settings_plugins_add`).  
4. Вставьте URL `engine.js` (экранная клавиатура / набор с заметки).  
5. Полностью закройте Lampa из recent apps Android и откройте снова  
   (сообщение Lampa: для применения плагина нужна перезагрузка).

### 3. Проверьте, что плагин жив

- Откройте любой фильм → на карточке должна быть кнопка **LUMEN**.  
- Краткое Noty «LUMEN … готов» при старте (если Noty не отключены).  
- **Настройки → LUMEN** — пункт должен появиться.

## Настройка Custom HTTP

1. **Настройки → LUMEN → Custom provider URL** — ваш HTTPS endpoint.  
2. Контракт запроса/ответа: [`docs/PROVIDER_CONTRACT.md`](docs/PROVIDER_CONTRACT.md).  
3. Пример ответа с легальными sample-роликами: [`examples/sample-provider.json`](examples/sample-provider.json).

Минимальный ответ:

```json
{
  "items": [
    {
      "title": "Big Buck Bunny",
      "voice": "Original",
      "quality": "720p",
      "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    }
  ]
}
```

Пока своего endpoint нет — оставьте **Demo-источник** включённым и проверяйте UI/плеер на sample MP4.

## Debug без компьютера

1. **Настройки → LUMEN → Экранный debug-лог** — ON.  
2. На экране снизу появится панель последних событий/ошибок (`window.onerror`, `unhandledrejection`, логи LUMEN).  
3. Сфотографируйте панель с iPhone и пришлите в чат.  
4. Дополнительно: штатная **Консоль** Lampa (если есть в вашей сборке) — строки с префиксом `LUMEN`.

## Чек-лист тестов на R3

### Базовое

- [ ] Плагин в списке расширений; после рестарта кнопка LUMEN на карточке одна (не дублируется)
- [ ] Noty/debug: `init complete`
- [ ] Demo ON → LUMEN → список источников с постером и названием фильма
- [ ] Выбор Demo → играет sample (Big Buck Bunny / Sintel)
- [ ] Для TV-карточки Demo → сезон → список серий → play + playlist

### Известные баги (должны быть исправлены)

- [ ] **Баг 1 (инфо пропадает):** 10× открыть LUMEN → Back → снова LUMEN: title/overview/TMDB id на месте  
- [ ] **Баг 2 (состояние UI):** в списке источников уйти вниз на 3–5 пункт → Enter (или в серии) → Back: фокус на том же пункте  
- [ ] **Баг 3 (create / appendChild):** 20× LUMEN → Back подряд: нет ошибок `create is not a function` / `appendChild` в debug/консоли

### Custom HTTP

- [ ] Указать свой URL → источники с вашего JSON
- [ ] Пустой/битый JSON → понятное empty-состояние, без падения Activity

### Производительность R3

- [ ] Быстрый скролл списка без «мыла» (нет blur)
- [ ] Несколько карточек подряд без зависания (особенно на 2 ГБ RAM)

## Разработка

```bash
node scripts/build.js          # собирает engine.js из src/
node tests/syntax-and-contract.test.js
node --check engine.js
```

`legacy/` и `src/providers/examples/` **не** входят в сборку.

## Структура

```
engine.js                 # точка входа для Lampa (сборка)
src/                      # исходники модулей
src/providers/            # registry, demo, custom
src/providers/examples/   # будущий Jellyfin/Emby (не в build)
legacy/                   # старый scraper-прототип (изолирован)
examples/                 # sample JSON
docs/PROVIDER_CONTRACT.md
```

## Ограничения v1 (честно)

- Нет прогона на реальном Vontar R3 из CI — только `node --check` + контрактные тесты
- Нет bundled Jellyfin/Plex; нет пиратских балансеров
- Custom endpoint должен отдавать CORS-доступные ответы для WebView Lampa (или работать в той же сети/прокси)
- Vontar R3 без AV1 — отдавайте H.264/H.265
