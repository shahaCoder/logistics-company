# Настройка админ-пользователя

## Как работает авторизация

Логин и пароль админ-пользователя задаются через переменные окружения в файле `backend/.env` и создаются через seed скрипт.

## Шаг 1: Настройте переменные окружения

Создайте или отредактируйте файл `backend/.env`:

```env
# Админ-пользователь
ADMIN_EMAIL=youremail@yourdomain.com
ADMIN_PASSWORD=yourVeryStrongPassword#23987

# JWT секрет (для токенов)
ADMIN_JWT_SECRET=your-secret-jwt-key-min-32-chars

# Остальные переменные...
DATABASE_URL=postgresql://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SSN_ENCRYPTION_KEY=...
```

## Шаг 2: Создайте или обновите админ-пользователя

Запустите seed скрипт:

```bash
cd backend
npm run seed
```

Этот скрипт:
- Создаст нового админ-пользователя с указанным email и паролем
- Или обновит существующего (если email уже есть в базе)
- Установит роль `SUPER_ADMIN`

## Шаг 3: Войдите в админ-панель

1. Откройте: `http://localhost:3000/internal-driver-portal-7v92nx/login`
2. Введите:
   - **Email**: значение из `ADMIN_EMAIL` в `.env`
   - **Password**: значение из `ADMIN_PASSWORD` в `.env`

## Как изменить логин/пароль

### Вариант 1: Изменить в .env и перезапустить seed

1. Отредактируйте `backend/.env`:
   ```env
   ADMIN_EMAIL=newemail@example.com
   ADMIN_PASSWORD=newStrongPassword123
   ```

2. Запустите seed:
   ```bash
   cd backend
   npm run seed
   ```

3. Войдите с новыми данными

### Вариант 2: Посмотреть текущие настройки

Текущий email можно посмотреть в базе данных через Prisma Studio:

```bash
cd backend
npm run prisma:studio
```

Откройте модель `AdminUser` и посмотрите поле `email`. **Пароль нельзя посмотреть** - он хранится в зашифрованном виде (bcrypt hash).

## Безопасность

⚠️ **ВАЖНО:**
- Пароль хранится в зашифрованном виде (bcrypt) - его нельзя "увидеть" в исходном виде
- Если забыли пароль - просто измените `ADMIN_PASSWORD` в `.env` и запустите `npm run seed`
- Никогда не коммитьте файл `.env` в git
- Используйте сильные пароли (минимум 12 символов, буквы, цифры, символы)

## Примеры

### Создать нового админа
```bash
# В backend/.env
ADMIN_EMAIL=admin@glco.us
ADMIN_PASSWORD=SecurePass123!@#

# Запустить seed
npm run seed
```

### Изменить пароль существующего админа
```bash
# В backend/.env изменить ADMIN_PASSWORD
ADMIN_PASSWORD=NewSecurePass456!@#

# Запустить seed (обновит существующего пользователя)
npm run seed
```

### Создать второго админа
```bash
# В backend/.env изменить ADMIN_EMAIL
ADMIN_EMAIL=manager@glco.us
ADMIN_PASSWORD=ManagerPass789!@#

# Запустить seed (создаст нового пользователя)
npm run seed
```

## Проверка

После запуска seed вы должны увидеть:
```
✅ Admin user created/updated: youremail@yourdomain.com
```

Если видите ошибку - проверьте:
- Существует ли файл `backend/.env`
- Заполнены ли `ADMIN_EMAIL` и `ADMIN_PASSWORD`
- Подключена ли база данных (проверьте `DATABASE_URL`)

