# GLCO Backend

Backend сервер для Global Cooperation LLC (glco.us) - Driver Application System.

## Технологии

- **Node.js** + **TypeScript**
- **Express** - веб-фреймворк
- **Prisma** - ORM для работы с базой данных
- **PostgreSQL** - база данных (по умолчанию)
- **Cloudinary** - хранение файлов
- **Zod** - валидация данных
- **Multer** - загрузка файлов
- **bcrypt** - хеширование паролей (для будущей админ-панели)
- **Nodemailer** - отправка email уведомлений

## Установка

1. Установите зависимости:
```bash
cd backend
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Настройте переменные окружения в `.env`:
   - `DATABASE_URL` - URL подключения к PostgreSQL
   - `SSN_ENCRYPTION_KEY` - 32-байтовый ключ в base64 для шифрования SSN
   - `CLOUDINARY_*` - учетные данные Cloudinary
   - `PORT` - порт сервера (по умолчанию 4000)
   - `EMAIL_FROM` - адрес отправителя email (по умолчанию `noreply@glco.us`)
   - `SMTP_HOST` - SMTP сервер для отправки email (обязательно для production)
   - `SMTP_PORT` - порт SMTP сервера (по умолчанию 587)
   - `SMTP_SECURE` - использовать TLS/SSL (true/false, по умолчанию false)
   - `SMTP_USER` - имя пользователя SMTP
   - `SMTP_PASSWORD` - пароль SMTP

4. Сгенерируйте ключ шифрования:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Скопируйте результат в `SSN_ENCRYPTION_KEY`.

5. Настройте базу данных:
```bash
# Сгенерируйте Prisma Client
npm run prisma:generate

# Создайте миграцию
npm run prisma:migrate

# Или примените существующие миграции
npx prisma migrate deploy
```

## Запуск

### Development
```bash
npm run dev
```

Сервер запустится на `http://localhost:4000`

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Возвращает `{ ok: true, timestamp: "..." }`

### Create Driver Application
```
POST /api/driver-applications
Content-Type: multipart/form-data
```

Принимает многошаговую форму с данными водителя:
- Личная информация (имя, дата рождения, SSN, контакты)
- Адреса (текущий и предыдущие)
- Водительские права (CDL)
- Медицинская карта
- История работы за последние 3 года
- Юридические согласия (подписи)

Файлы:
- `licenseFront` - фото лицевой стороны CDL
- `licenseBack` - фото обратной стороны CDL
- `medicalCard` - медицинская карта
- `consentAlcoholDrug`, `consentSafetyPerformance`, `consentPSP`, `consentClearinghouse`, `consentMVR` - подписи согласий

## Структура проекта

```
backend/
├── prisma/
│   └── schema.prisma          # Prisma schema с моделями
├── src/
│   ├── modules/
│   │   └── driverApplication/
│   │       ├── driverApplication.types.ts    # Типы и валидация
│   │       ├── driverApplication.service.ts  # Бизнес-логика
│   │       └── driverApplication.controller.ts # Express routes
│   ├── services/
│   │   ├── cloudinary.ts      # Работа с Cloudinary
│   │   └── email.service.ts   # Отправка email уведомлений
│   ├── utils/
│   │   └── crypto.ts          # Шифрование SSN
│   └── index.ts               # Точка входа
├── package.json
├── tsconfig.json
└── .env
```

## Безопасность

- **SSN шифруется** с использованием AES-256-GCM перед сохранением в БД
- В логах SSN никогда не отображается полностью (только последние 4 цифры)
- Файлы загружаются в Cloudinary с уникальными именами
- Валидация всех входящих данных через Zod

## Миграции базы данных

```bash
# Создать новую миграцию
npm run prisma:migrate

# Применить миграции в production
npx prisma migrate deploy

# Открыть Prisma Studio (GUI для БД)
npm run prisma:studio
```

## Application Confirmation Email

После успешной отправки заявки водителя, система автоматически отправляет подтверждающее email письмо заявителю.

### Функциональность

- **Автоматическая отправка**: Email отправляется сразу после создания заявки в базе данных
- **Асинхронная обработка**: Отправка email не блокирует ответ сервера
- **Устойчивость к ошибкам**: Ошибки отправки email не прерывают создание заявки
- **Аудит логирование**: Все попытки отправки email логируются в системе аудита

### Настройка SMTP

Для работы email сервиса необходимо настроить SMTP сервер. Примеры популярных провайдеров:

**Gmail (через App Password):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@glco.us
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@glco.us
```

**Amazon SES:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-access-key
SMTP_PASSWORD=your-ses-secret-key
EMAIL_FROM=noreply@glco.us
```

### Формат письма

**Тема:** `Your Application Has Been Received – Global Cooperation LLC`

**Содержание:**
```
Hello {FirstName},

Your driver application has been successfully received.

Our HR team is currently reviewing your information.

We will contact you shortly.

Thank you,

Global Cooperation LLC
```

### Мониторинг

Все события отправки email логируются в таблице `AuditLog` с действием `APPLICATION_EMAIL_SENT`. В случае ошибки отправки, детали ошибки также сохраняются в логах для последующего анализа.

## Следующие шаги

- [ ] Часть 2: Многошаговая форма на фронтенде
- [ ] Часть 3: Admin-панель для просмотра заявок

