# 🔍 Диагностическая информация

## Что нужно проверить:

### 1. Содержимое .env.local

```bash
cd /var/www/backend
cat .env.local
```

### 2. Проверка переменных во время сборки

```bash
cd /var/www/backend
npm run build 2>&1 | grep -i "env\|NEXT_PUBLIC"
```

### 3. Проверка, как запущен Next.js

```bash
pm2 list
pm2 describe <nextjs-process-name>
```

### 4. Проверка API ключа на сервере бота

```bash
cat /opt/pti-bot/.env | grep ADMIN_API_KEY
```

### 5. Проверка, что переменные доступны в runtime

Создайте тестовый файл:
```bash
cd /var/www/backend
cat > test-env.js << 'EOF'
console.log('NEXT_PUBLIC_BOT_API_BASE:', process.env.NEXT_PUBLIC_BOT_API_BASE)
console.log('NEXT_PUBLIC_BOT_API_KEY:', process.env.NEXT_PUBLIC_BOT_API_KEY ? 'SET' : 'NOT SET')
EOF
node test-env.js
```

### 6. Проверка Network tab в браузере

Откройте DevTools → Network → найдите запрос к `/api/oil-change/list` → проверьте Request Headers - есть ли заголовок `X-API-Key` и какой там ключ.
