# 🔍 Проверка: это monorepo или отдельные проекты?

## Проблема

Переменные `NEXT_PUBLIC_*` в `.env` файле backend проекта **не используются** Next.js, потому что:
1. Backend и Next.js - это разные приложения
2. Next.js читает переменные из своего собственного `.env.local` файла
3. Переменные `NEXT_PUBLIC_*` встраиваются в клиентский код во время сборки Next.js

## Проверка: есть ли Next.js в этой директории?

```bash
cd /var/www/backend/backend

# Проверьте, есть ли Next.js файлы
ls -la | grep -E "next.config|src/app|pages"

# Проверьте package.json - есть ли там "next"?
cat package.json | grep -A 5 -B 5 "next"
```

## Если Next.js там НЕТ (отдельные проекты):

Нужно найти Next.js проект:

```bash
# Ищите next.config
find /var/www -name "next.config.*" 2>/dev/null

# Проверьте PM2 процессы
pm2 list
pm2 describe <process-name> | grep "script path"
```

## Если Next.js там ЕСТЬ (monorepo):

Тогда нужно:
1. Убедиться, что переменные в `.env.local` (не `.env`)
2. Пересобрать Next.js проект

```bash
cd /var/www/backend/backend

# Создайте .env.local (если его нет)
nano .env.local

# Добавьте туда:
NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api
NEXT_PUBLIC_BOT_API_KEY=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3

# Пересоберите Next.js
npm run build

# Перезапустите
pm2 restart all --update-env
```
