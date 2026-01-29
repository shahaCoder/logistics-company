# ✅ Шаги после успешного git pull

## 1. Пересоберите Next.js проект

```bash
cd /var/www/backend

# Убедитесь, что .env.local существует
cat .env.local

# Должно быть:
# NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api
# NEXT_PUBLIC_BOT_API_KEY=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3

# Удалите старый build
rm -rf .next

# Пересоберите проект
npm run build
```

## 2. Перезапустите Next.js

```bash
# Проверьте, как запущен Next.js
ps aux | grep -E "next|node.*3000"

# Если через PM2, перезапустите
pm2 restart all --update-env

# Или если запущен другим способом, перезапустите соответствующим образом
```

## 3. Проверьте работу

Откройте в браузере:
- `https://glco.us/internal-driver-portal-7v92nx/oil-change`

Должна загрузиться страница с данными о траках.

## 4. Проверьте логи (если есть ошибки)

```bash
# Логи Next.js (если запущен через PM2)
pm2 logs <nextjs-process-name> --lines 50

# Или логи backend (для API route)
pm2 logs backend --lines 50
```

## Важно

Теперь API ключ передается через Next.js API route (`/api/oil-change`), который работает на сервере. Это означает, что:
- API ключ не попадает в клиентский код
- Переменные окружения доступны на сервере Next.js
- Более безопасно
