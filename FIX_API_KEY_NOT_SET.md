# 🔧 Исправление: API_KEY: NOT SET

## Проблема

`API_KEY: NOT SET` означает, что переменная `NEXT_PUBLIC_BOT_API_KEY` не встроилась в bundle.

## Решение

### 1. Проверьте .env.local файл

```bash
cd /var/www/backend
cat .env.local
```

Должно быть точно так (без пробелов, без кавычек):
```
NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api
NEXT_PUBLIC_BOT_API_KEY=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3
```

### 2. Если файл неправильный, пересоздайте его

```bash
cd /var/www/backend

# Удалите старый файл
rm .env.local

# Создайте новый
cat > .env.local << 'EOF'
NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api
NEXT_PUBLIC_BOT_API_KEY=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3
EOF

# Проверьте содержимое
cat .env.local
```

### 3. Удалите старый build и пересоберите

```bash
cd /var/www/backend

# Удалите старый build
rm -rf .next

# Пересоберите проект
npm run build
```

### 4. Перезапустите Next.js

```bash
pm2 restart all --update-env
```

### 5. Проверьте в браузере

После пересборки откройте Console - должно быть:
- `[OilChangeAPI] API_BASE: https://webhook.glco.us/api`
- `[OilChangeAPI] API_KEY: aB3cD4eF5...` (первые символы ключа)

Если всё ещё `NOT SET` - проверьте формат файла еще раз.
