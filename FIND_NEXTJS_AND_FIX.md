# 🔍 Найти Next.js проект и исправить переменные

## 1. Удалите .env.local из backend (он там не нужен)

```bash
cd /var/www/backend/backend
rm .env.local
```

## 2. Найдите Next.js проект

```bash
# Ищите next.config
find /var/www -name "next.config.*" 2>/dev/null
find /var/www -name "next.config.ts" 2>/dev/null
find /var/www -name "next.config.js" 2>/dev/null

# Ищите package.json с "next" в зависимостях
find /var/www -name "package.json" -exec grep -l '"next"' {} \; 2>/dev/null

# Проверьте PM2 процессы - покажет путь к скрипту
pm2 list
pm2 info <process-name> | grep "script path"

# Проверьте /var/www/html
ls -la /var/www/html
```

## 3. После нахождения Next.js проекта

```bash
# Перейдите в директорию Next.js
cd /путь/к/nextjs/проекту

# Создайте .env.local
nano .env.local
```

Добавьте:
```bash
NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api
NEXT_PUBLIC_BOT_API_KEY=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3
```

## 4. Пересоберите Next.js

```bash
npm run build
pm2 restart all --update-env
```
