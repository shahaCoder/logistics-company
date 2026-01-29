# ✅ Создание .env.local для Next.js

## Найдено!

Next.js проект находится в: `/var/www/backend/`

## Создайте .env.local

```bash
# Перейдите в директорию Next.js
cd /var/www/backend

# Создайте .env.local
nano .env.local
```

Добавьте:
```bash
NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api
NEXT_PUBLIC_BOT_API_KEY=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3
```

## Пересоберите Next.js

```bash
cd /var/www/backend
npm run build
```

## Перезапустите Next.js (если запущен через PM2)

```bash
# Проверьте, есть ли процесс Next.js в PM2
pm2 list

# Если есть, перезапустите
pm2 restart <nextjs-process-name> --update-env

# Если нет, запустите
cd /var/www/backend
pm2 start npm --name "nextjs" -- start
pm2 save
```

## Проверка

После пересборки откройте в браузере:
- `https://glco.us/internal-driver-portal-7v92nx/oil-change`
- Ошибка должна исчезнуть
