# ✅ Тестирование Oil Change API

## Caddy запущен успешно!

Caddy работает (`active (running)`). Ошибки в логах связаны с получением SSL сертификатов - это нормально, Caddy получит их автоматически.

## Проверка работы API

### 1. Проверьте доступность API через Caddy

```bash
# Проверьте список всех траков
curl -X GET "https://glco.us/api/bot/oil-change/list" \
  -H "X-API-Key: your-api-key-here"

# Или через webhook.glco.us (если основной маршрут не работает)
curl -X GET "https://webhook.glco.us/api/oil-change/list" \
  -H "X-API-Key: your-api-key-here"
```

### 2. Проверьте статус конкретного трака

```bash
curl -X GET "https://glco.us/api/bot/oil-change/Truck%20717" \
  -H "X-API-Key: your-api-key-here"
```

### 3. Проверьте список траков

```bash
curl -X GET "https://glco.us/api/bot/trucks" \
  -H "X-API-Key: your-api-key-here"
```

## Настройка переменных окружения в Next.js

### На сервере (production)

Добавьте в `.env.local` или переменные окружения Next.js приложения:

```bash
# Base URL для API бота
NEXT_PUBLIC_BOT_API_BASE=https://glco.us/api/bot

# API ключ (должен совпадать с ADMIN_API_KEY на сервере бота)
NEXT_PUBLIC_BOT_API_KEY=your-secret-api-key-here
```

### Перезапустите Next.js приложение

```bash
# Если используете PM2
pm2 restart nextjs-app --update-env

# Или если используете другой процесс менеджер
# Перезапустите Next.js приложение
```

## Проверка в браузере

1. Войдите в админ панель: `https://glco.us/internal-driver-portal-7v92nx/`
2. Перейдите в раздел "Oil Change" в меню
3. Должна загрузиться страница с таблицей траков

## Troubleshooting

### Если API не отвечает через glco.us/api/bot/*

Проверьте конфигурацию Caddy:

```bash
# Посмотрите текущий Caddyfile
sudo cat /etc/caddy/Caddyfile

# Проверьте логи Caddy
sudo journalctl -u caddy -n 100 | grep "api/bot"
```

### Если получаете 404

Убедитесь, что блок `glco.us` правильно настроен в Caddyfile:

```caddy
glco.us, www.glco.us {
    reverse_proxy 127.0.0.1:3000
    
    handle /api/bot/* {
        uri strip_prefix /api/bot
        reverse_proxy 127.0.0.1:4010/api {
            header_up Host {host}
        }
        header Access-Control-Allow-Origin "https://glco.us"
        header Access-Control-Allow-Methods "GET, POST, OPTIONS"
        header Access-Control-Allow-Headers "X-API-Key, Content-Type"
    }
}
```

### Если получаете CORS ошибки

Убедитесь, что заголовки CORS добавлены в конфигурацию Caddy.

### Если получаете 401 (Unauthorized)

Проверьте, что:
1. `NEXT_PUBLIC_BOT_API_KEY` установлен в Next.js
2. Ключ совпадает с `ADMIN_API_KEY` на сервере бота
3. Заголовок `X-API-Key` отправляется в запросах

## Проверка работы бота

Убедитесь, что бот запущен:

```bash
# Проверьте статус бота
pm2 list

# Проверьте логи бота
pm2 logs pti-bot --lines 50

# Проверьте, что бот слушает на порту 4010
sudo ss -tulpn | grep 4010
```

## Следующие шаги

1. ✅ Caddy запущен
2. ⏳ Проверьте доступность API через curl
3. ⏳ Установите переменные окружения в Next.js
4. ⏳ Перезапустите Next.js приложение
5. ⏳ Проверьте работу в браузере
