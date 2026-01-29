# 🔍 Поиск Next.js проекта на сервере

## Структура директорий

На сервере есть:
- `/var/www/backend` - backend проект
- `/var/www/html` - возможно Next.js проект

## Поиск Next.js проекта

Выполните следующие команды для поиска:

```bash
# Проверьте /var/www/html
cd /var/www/html
ls -la

# Ищите файлы Next.js
find /var/www -name "next.config.ts" -o -name "next.config.js" 2>/dev/null
find /var/www -name "package.json" -type f 2>/dev/null | xargs grep -l "next"

# Проверьте процессы PM2
pm2 list

# Проверьте, где запущен Next.js
ps aux | grep next
```

## Где обычно находится Next.js проект

1. `/var/www/html/` - стандартная директория для веб-сайтов
2. `/var/www/logistics/` - если проект называется logistics
3. `/home/user/logistics/` - если проект в домашней директории
4. `/opt/logistics/` - альтернативное расположение

## После нахождения проекта

1. Перейдите в директорию проекта
2. Создайте `.env.local` файл:
```bash
nano .env.local
```

3. Добавьте переменные:
```bash
NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api
NEXT_PUBLIC_BOT_API_KEY=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3
```

4. Пересоберите проект:
```bash
npm run build
```

5. Перезапустите через PM2:
```bash
pm2 restart all --update-env
```
