# 🔍 Проверка расположения Next.js проекта

## Проверьте, есть ли Next.js в /var/www/backend/backend

Выполните:

```bash
cd /var/www/backend/backend
ls -la

# Проверьте наличие Next.js файлов
ls -la | grep -E "next.config|package.json|src/app"

# Проверьте package.json
cat package.json | grep -E "next|react"
```

## Если Next.js там есть:

Тогда `.env.local` должен быть в `/var/www/backend/backend/`:

```bash
cd /var/www/backend/backend
nano .env.local
```

Добавьте:
```bash
NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api
NEXT_PUBLIC_BOT_API_KEY=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3
```

Затем пересоберите:
```bash
npm run build
pm2 restart all --update-env
```

## Если Next.js в другом месте:

Найдите его:
```bash
# Ищите next.config
find /var/www -name "next.config.*" 2>/dev/null

# Ищите package.json с next
find /var/www -name "package.json" -exec grep -l "next" {} \; 2>/dev/null

# Проверьте PM2 процессы
pm2 list
pm2 info <process-name> | grep "script path"
```
