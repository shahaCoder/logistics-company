# Driver Application Setup

## Frontend (Next.js)

Многошаговая форма Driver Application создана и готова к использованию.

### Настройка

1. **Переменная окружения**

   Добавьте в `.env.local` (или `.env`):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

   В production это будет URL вашего backend API.

2. **Страница формы**

   Форма доступна по адресу: `/driver-application`

3. **Навигация**

   Ссылка на форму обновлена на странице `/contact` (кнопка "Apply to Drive")

### Структура

- `src/app/driver-application/` - страница формы
- `src/components/DriverApplicationForm.tsx` - основной компонент формы
- `src/components/DriverApplicationSteps/` - компоненты для каждого шага (8 шагов)

### Шаги формы

1. **Applicant Information** - личная информация, SSN, адрес
2. **Driver's License Information** - CDL данные, endorsements, загрузка документов
3. **Medical Card** - медицинская карта
4. **Employment History** - история работы за 3 года
5. **Alcohol & Drug Test Statement** - согласие на тестирование
6. **PSP Driver Disclosure** - согласие PSP
7. **FMCSA Clearinghouse Consent** - согласие Clearinghouse
8. **MVR Release Consent** - согласие MVR

### Безопасность

- SSN автоматически форматируется и маскируется в UI
- SSN не логируется в консоль или ошибки
- Данные хранятся только в памяти React до отправки
- Валидация через Zod на клиенте и сервере

### Интеграция с Backend

Форма отправляет данные через `FormData` на:
```
POST ${NEXT_PUBLIC_API_URL}/api/driver-applications
```

Формат:
- JSON поля отправляются как отдельные поля FormData
- Массивы (previousAddresses, employmentRecords, legalConsents) отправляются как JSON строки
- Файлы отправляются напрямую (licenseFront, licenseBack, medicalCard)

## Backend

Backend должен быть запущен и доступен по адресу, указанному в `NEXT_PUBLIC_API_URL`.

См. `backend/README.md` для инструкций по настройке backend.

## Тестирование

1. Запустите backend: `cd backend && npm run dev`
2. Запустите frontend: `npm run dev`
3. Откройте `http://localhost:3000/driver-application`
4. Заполните форму и отправьте

## Production

В production убедитесь, что:
- `NEXT_PUBLIC_API_URL` указывает на production API
- Backend настроен с правильными credentials (Cloudinary, Database, Encryption Key)
- CORS настроен для production домена

