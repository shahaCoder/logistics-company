# Troubleshooting Guide

## Проблема: 404 на админ-портале

Если вы видите 404 на `http://localhost:3000/internal-driver-portal-7v92nx`, выполните следующие шаги:

### 1. Перезапустите Next.js dev сервер

```bash
# Остановите текущий процесс (Ctrl+C в терминале)
# Затем запустите заново:
npm run dev
```

### 2. Очистите кеш Next.js

```bash
# Удалите папку .next
rm -rf .next

# Перезапустите сервер
npm run dev
```

### 3. Проверьте правильность URL

Правильный URL (без подчеркиваний в начале):
- ✅ Правильно: `http://localhost:3000/internal-driver-portal-7v92nx`
- ❌ Неправильно: `http://localhost:3000/__internal_driver_portal_7v92nx` (папки с `_` в начале - private в Next.js)

### 4. Проверьте структуру файлов

Убедитесь, что файлы существуют:
```bash
ls -la src/app/internal-driver-portal-7v92nx/
```

Должны быть:
- `page.tsx`
- `layout.tsx`
- `login/page.tsx`
- `applications/page.tsx`
- `applications/[id]/page.tsx`

### 5. Проверьте консоль браузера

Откройте DevTools (F12) и проверьте:
- Нет ли ошибок в Console
- Нет ли ошибок в Network tab

### 6. Проверьте консоль сервера

В терминале, где запущен `npm run dev`, проверьте:
- Нет ли ошибок компиляции
- Нет ли предупреждений о роутах

### 7. Альтернативный способ доступа

Если проблема сохраняется, попробуйте напрямую:
- `http://localhost:3000/internal-driver-portal-7v92nx/login`
- `http://localhost:3000/internal-driver-portal-7v92nx/applications`

## Мобильная адаптация подписи

Canvas для подписи теперь адаптивный:
- На мобильных устройствах автоматически подстраивается под ширину экрана
- Сохраняет пропорции
- Оптимизирован для touch-ввода
- Кнопки расположены вертикально на мобильных

## Если ничего не помогает

1. Убедитесь, что используете правильную версию Node.js (рекомендуется 18+)
2. Проверьте, что все зависимости установлены: `npm install`
3. Попробуйте удалить `node_modules` и установить заново:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

