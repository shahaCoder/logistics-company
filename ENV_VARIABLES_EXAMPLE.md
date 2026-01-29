# Переменные окружения для Oil Change API

## Добавьте в ваш .env.local или .env файл:

```bash
# Bot API Configuration (для Oil Change Management)
# Base URL для API бота (после настройки Nginx reverse proxy)
NEXT_PUBLIC_BOT_API_BASE=https://glco.us/api/bot

# API ключ для аутентификации с ботом
# Должен совпадать с ADMIN_API_KEY на сервере pti-bot
NEXT_PUBLIC_BOT_API_KEY=your-secret-api-key-here
```

## Важно:

- Для production используйте переменные окружения на сервере
- НЕ коммитьте .env файлы с реальными ключами в git!
- Убедитесь, что `NEXT_PUBLIC_BOT_API_KEY` совпадает с `ADMIN_API_KEY` на сервере pti-bot
