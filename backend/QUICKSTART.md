# Быстрый старт

## 1. Установка зависимостей
```bash
cd backend
npm install
```

## 2. Настройка окружения

Создайте файл `.env`:
```bash
cp env.example .env
```

Заполните переменные:
- `DATABASE_URL` - подключение к PostgreSQL
- `SSN_ENCRYPTION_KEY` - сгенерируйте ключ:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- `CLOUDINARY_*` - учетные данные Cloudinary

## 3. Настройка базы данных

```bash
# Генерация Prisma Client
npm run prisma:generate

# Создание миграции
npm run prisma:migrate
# Введите имя миграции: add_driver_application_models
```

## 4. Запуск

```bash
# Development режим
npm run dev

# Сервер будет доступен на http://localhost:4000
# Health check: http://localhost:4000/health
```

## Тестирование API

```bash
# Health check
curl http://localhost:4000/health

# Создание заявки (пример с curl)
curl -X POST http://localhost:4000/api/driver-applications \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john@example.com" \
  -F "phone=1234567890" \
  -F "dateOfBirth=1990-01-01" \
  -F "ssn=123-45-6789" \
  ...
```

## Структура

- `src/index.ts` - точка входа, Express сервер
- `src/modules/driverApplication/` - модуль заявок водителей
- `src/services/cloudinary.ts` - работа с Cloudinary
- `src/utils/crypto.ts` - шифрование SSN
- `prisma/schema.prisma` - схема базы данных

