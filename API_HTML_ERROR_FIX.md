# 🔧 Исправление ошибки: API возвращает HTML вместо JSON

## Проблема

API возвращает HTML код страницы вместо JSON данных. Это означает, что:
1. Запрос не доходит до бота
2. Caddy перенаправляет на другую страницу (например, Next.js)
3. Неправильная конфигурация маршрута в Caddy

## Диагностика

### 1. Проверьте, что возвращает API напрямую

```bash
# Проверьте через curl (замените your-api-key на реальный ключ)
curl -v -X GET "https://glco.us/api/bot/oil-change/list" \
  -H "X-API-Key: your-api-key" \
  -H "Accept: application/json"

# Проверьте напрямую через webhook.glco.us
curl -v -X GET "https://webhook.glco.us/api/oil-change/list" \
  -H "X-API-Key: your-api-key" \
  -H "Accept: application/json"
```

### 2. Проверьте конфигурацию Caddy

```bash
# Посмотрите текущий Caddyfile
sudo cat /etc/caddy/Caddyfile

# Проверьте логи Caddy
sudo journalctl -u caddy -n 100 | grep -i "api/bot"
```

### 3. Проверьте, что бот запущен и отвечает

```bash
# Проверьте статус бота
pm2 list

# Проверьте логи бота
pm2 logs pti-bot --lines 50

# Проверьте напрямую на localhost
curl -X GET "http://localhost:4010/api/oil-change/list" \
  -H "X-API-Key: your-api-key"
```

## Возможные решения

### Решение 1: Исправить конфигурацию Caddy

Проблема может быть в том, что маршрут `/api/bot/*` не правильно настроен. Проверьте Caddyfile:

```caddy
glco.us, www.glco.us {
    # Важно: handle должен быть ПЕРЕД основным reverse_proxy
    handle /api/bot/* {
        uri strip_prefix /api/bot
        reverse_proxy 127.0.0.1:4010/api {
            header_up Host {host}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
        }
        header Access-Control-Allow-Origin "https://glco.us"
        header Access-Control-Allow-Methods "GET, POST, OPTIONS"
        header Access-Control-Allow-Headers "X-API-Key, Content-Type"
    }
    
    # Основной reverse_proxy для Next.js (должен быть ПОСЛЕ handle)
    reverse_proxy 127.0.0.1:3000
}
```

### Решение 2: Использовать существующий webhook.glco.us

Временно используйте существующий домен:

Измените в `.env.local` или переменных окружения:
```bash
NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api
```

И обновите код в `src/utils/oilChangeApi.ts`:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_BOT_API_BASE || 'https://webhook.glco.us/api';
```

### Решение 3: Проверить порядок директив в Caddy

В Caddy порядок директив важен! `handle` должен быть ПЕРЕД основным `reverse_proxy`.

## Проверка в браузере

Откройте DevTools (F12) и проверьте:

1. **Network tab** - посмотрите на запрос к `/api/bot/oil-change/list`:
   - Какой статус код?
   - Что в Response Headers?
   - Что в Response Body?

2. **Console tab** - есть ли ошибки JavaScript?

## Быстрое исправление

Попробуйте использовать `webhook.glco.us` напрямую:

1. Измените переменную окружения:
```bash
NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api
```

2. Перезапустите Next.js:
```bash
pm2 restart nextjs-app --update-env
```

3. Проверьте в браузере
