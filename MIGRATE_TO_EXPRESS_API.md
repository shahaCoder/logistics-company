# ✅ Миграция на Express API

## Что было сделано

1. ✅ Создан новый модуль `backend/src/modules/oil-change/` с:
   - `oil-change.service.ts` - сервис для проксирования запросов к bot API
   - `oil-change.controller.ts` - контроллер с endpoints

2. ✅ Добавлен роутер в `backend/src/index.ts`

3. ✅ Обновлен `src/utils/oilChangeApi.ts` для использования Express API вместо Next.js API route

## Что нужно сделать на сервере

### 1. Убедитесь, что переменные окружения есть в Express `.env`

```bash
cd /var/www/backend/backend

# Проверьте .env файл
cat .env | grep BOT_API

# Должны быть:
# BOT_API_BASE=https://webhook.glco.us/api
# BOT_API_KEY=<ваш-ключ>
```

Если их нет, добавьте в `/var/www/backend/backend/.env`:
```env
BOT_API_BASE=https://webhook.glco.us/api
BOT_API_KEY=<ваш-реальный-ключ>
```

### 2. Пересоберите и перезапустите Express бэкенд

```bash
cd /var/www/backend/backend

# Пересоберите TypeScript
npm run build

# Перезапустите через PM2
pm2 restart backend --update-env
```

### 3. Убедитесь, что NEXT_PUBLIC_API_URL установлен в Next.js

```bash
# В корне Next.js проекта (обычно /var/www/backend)
cd /var/www/backend

# Проверьте .env.local
cat .env.local | grep NEXT_PUBLIC_API_URL

# Должно быть:
# NEXT_PUBLIC_API_URL=https://api.glco.us
# или
# NEXT_PUBLIC_API_URL=http://localhost:4000 (для разработки)
```

Если его нет, добавьте в `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.glco.us
```

### 4. Пересоберите Next.js (если нужно)

```bash
cd /var/www/backend

# Удалите старый build
rm -rf .next

# Пересоберите
npm run build

# Перезапустите Next.js
pm2 restart all --update-env
```

## Новые endpoints

Теперь все запросы идут через Express:

- `GET /api/admin/oil-change/list` - список всех траков
- `GET /api/admin/oil-change/:truckName` - статус конкретного трака
- `POST /api/admin/oil-change/reset` - сброс oil change
- `GET /api/admin/oil-change/trucks` - список траков для dropdown

Все endpoints требуют аутентификацию (только для админов).

## Преимущества

✅ API ключ хранится только в Express (безопаснее)
✅ Единая точка входа для всех API запросов
✅ Проще поддерживать (один бэкенд)
✅ Не нужно настраивать переменные окружения в Next.js

## Что можно удалить (опционально)

Next.js API route `src/app/api/oil-change/route.ts` больше не используется, но можно оставить на случай, если понадобится в будущем.
