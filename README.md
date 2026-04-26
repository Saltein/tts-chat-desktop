# TTS Chat Desctop

**TTS Chat Desktop** — это десктопное приложение на базе Electron, которое озвучивает сообщения из стриминговых чатов (Twitch, YouTube, VK Live) с использованием Text-to-Speech.

Приложение предназначено для стримеров и контент-мейкеров, которые хотят автоматически озвучивать сообщения зрителей.

## 🚀 Возможности

- 🔊 Озвучивание сообщений из чата (TTS)
- 💬 Чат с нескольких платформ в одном окне
- 🎞️ Виджет чата для obs
- 📺 Поддержка платформ:
    - Twitch
    - YouTube
    - VK Live
- ⚙️ Гибкая настройка внешнего вида, голосов и параметров речи
- 🖥️ Удобный UI на React + Redux
- 🔄 Подключение/отключение чатов в реальном времени

## 🛠️ Технологии

- Electron — десктопное приложение
- React — интерфейс
- Redux — управление состоянием
- Node.js — серверная логика внутри приложения
- VK Live Message Client / Twitch API / YouTube API — работа с чатами

## 📦 Установка

1. Перейдите в раздел [Releases](https://github.com/your-username/tts-chat-desktop/releases)
2. Скачайте последнюю версию приложения:
    - `TTS Electron App Setup 0.0.0.exe`
3. Запустите установщик
4. После этого появится ярлык на рабочем столе и приложение сразу запустится

### 🧑‍💻 Для разработчиков

1. `git clone https://github.com/Saltein/tts-electron-version.git`
2. `cd tts-chat-desktop`
3. `npm install`
4. ▶️ Запуск
    - В режиме разработки:
        - `npm run dev`
    - Сборка приложения:
        - `npm run build`
    - Запуск собранного приложения:
        - `npm start`
    - Сборка `.exe` файла:
        - `npm run build:electron`

#### 🔑 Переменные окружения

Создай файл .env в корне проекта:

```
VITE_TWITCH_BOT_NAME=имя_бота
VITE_TWITCH_BOT_TOKEN=токен_бота

VITE_BASE_URL_API=http://localhost:5001
VITE_BASE_URL_WEBSOCKET=ws://localhost:6789
VITE_BASE_URL_WIDGET=http://127.0.0.1:3030

VITE_GOOGLE_CLIENT_ID=id_десктоп_приложения_в_твоем_проекте_Google_Console
VITE_GOOGLE_CLIENT_SECRET=secret_десктоп_приложения_в_твоем_проекте_Google_Console

VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/oauth2callback

VITE_GOOGLE_API_KEY=api_ключ_проекта_Google_Console
VITE_GOOGLE_API_KEYS=api_ключ_проекта_Google_Console1 api_ключ_проекта_Google_Console2 api_ключ_проекта_Google_Console3

VITE_GOOGLE_TIMEOUT=5000

VITE_BETA_ACCESS_PASSWORD=aboba1337
```

### ⚠️ Важно: не публикуй .env в репозитории


## 🧩 Планы на будущее
- более гибкая настройка внешнего вида сообщений
- выбор какие сообщения озвучивать (например за баллы канала)
- возможность загрузки своей модели для озвучки
- цензура сообщений и черный список слов

## 🤝 Контрибьюция

### PR и идеи приветствуются!
### Создавай issue или форкай репозиторий.

📄 Лицензия

MIT License

👤 Автор

SalteiN
