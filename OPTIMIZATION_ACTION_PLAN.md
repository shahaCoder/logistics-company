# 🚀 ПЛАН ДЕЙСТВИЙ ПО ОПТИМИЗАЦИИ ДО 9/10

**Цель:** Повысить оценку проекта с 7/10 до 9/10  
**Приоритет:** Критичные → Важные → Желательные

---

## 📋 ПРИОРИТЕТ 1: КРИТИЧНЫЕ ОПТИМИЗАЦИИ (Сделать первыми)

### 1.1. Настройка Connection Pooling для Prisma

**Проблема:** Используется дефолтный pool (10 соединений), что ограничивает производительность.

**Решение:**

#### Шаг 1: Создать утилиту для Prisma Client
```typescript
// backend/src/utils/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Оптимизированная конфигурация connection pool
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + 
        "?connection_limit=20" +           // Увеличиваем лимит соединений
        "&pool_timeout=20" +               // Таймаут ожидания соединения
        "&connect_timeout=10" +             // Таймаут подключения
        "&statement_cache_size=0"          // Отключаем кэш для production
    }
  }
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
```

#### Шаг 2: Заменить все импорты PrismaClient
```typescript
// Вместо:
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Использовать:
import prisma from '../utils/prisma.js';
// или
import { prisma } from '../utils/prisma.js';
```

**Файлы для изменения:**
- `backend/src/modules/admin-applications/admin-applications.service.ts`
- `backend/src/modules/driverApplication/driverApplication.service.ts`
- `backend/src/modules/requests/requests.service.ts`
- `backend/src/services/samsara-sync.service.ts`
- Все остальные файлы, использующие PrismaClient

**Ожидаемый результат:** Увеличение throughput на 30-50%

---

### 1.2. Добавление Redis для кэширования

**Проблема:** Каждый запрос идет в БД, нет кэширования.

**Решение:**

#### Шаг 1: Установить зависимости
```bash
cd backend
npm install ioredis
npm install --save-dev @types/ioredis
```

#### Шаг 2: Создать сервис кэширования
```typescript
// backend/src/services/cache.service.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconnect on READONLY error
    }
    return false;
  }
});

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

/**
 * Получить данные из кэша или выполнить fetcher и закэшировать
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    console.warn('Redis get error:', error);
  }

  const data = await fetcher();
  
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.warn('Redis set error:', error);
  }

  return data;
}

/**
 * Инвалидировать кэш по паттерну
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn('Redis invalidate error:', error);
  }
}

/**
 * Удалить конкретный ключ
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.warn('Redis delete error:', error);
  }
}

export default redis;
```

#### Шаг 3: Использовать кэширование в сервисах
```typescript
// backend/src/modules/admin-applications/admin-applications.service.ts
import { getCached, invalidateCache } from '../../services/cache.service.js';

export async function getApplications(filters: {
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  
  // Создаем ключ кэша
  const cacheKey = `applications:${filters.status || 'all'}:${filters.search || ''}:${page}:${limit}`;
  
  return getCached(
    cacheKey,
    async () => {
      // Оригинальная логика запроса
      const where: any = {};
      if (filters.status) where.status = filters.status;
      if (filters.search) {
        where.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [applications, total] = await Promise.all([
        prisma.driverApplication.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
            ssnLast4: true,
          },
        }),
        prisma.driverApplication.count({ where }),
      ]);

      return {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    30 // TTL 30 секунд
  );
}

// Инвалидировать кэш при обновлении
export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  internalNotes: string | undefined,
  reviewedById: string
) {
  const result = await prisma.driverApplication.update({
    where: { id },
    data: {
      status,
      internalNotes,
      reviewedById,
      reviewedAt: new Date(),
    },
  });

  // Инвалидировать кэш списков
  await invalidateCache('applications:*');
  
  return result;
}
```

**Ожидаемый результат:** Уменьшение нагрузки на БД на 50-70%

---

### 1.3. Оптимизация запросов к БД (Batch операции)

**Проблема:** Обновление trucks по одному в цикле.

**Решение:**

```typescript
// backend/src/services/samsara-sync.service.ts
export async function syncSamsaraOdometer(): Promise<void> {
  // ... существующий код до обновления trucks ...

  // ВМЕСТО цикла с отдельными updateMany:
  // for (const truck of trucks) { ... await prisma.truck.updateMany(...) }

  // ИСПОЛЬЗОВАТЬ batch обновление:
  const updates = trucks
    .filter(truck => {
      if (!truck.samsaraVehicleId) return false;
      const odometerMiles = odometerMap.get(truck.samsaraVehicleId);
      return odometerMiles !== undefined;
    })
    .map(truck => ({
      samsaraVehicleId: truck.samsaraVehicleId!,
      odometerMiles: odometerMap.get(truck.samsaraVehicleId!)!,
    }));

  if (updates.length > 0) {
    // Использовать Promise.all для параллельных обновлений
    await Promise.all(
      updates.map(({ samsaraVehicleId, odometerMiles }) =>
        prisma.truck.updateMany({
          where: { samsaraVehicleId },
          data: {
            currentMiles: odometerMiles,
            currentMilesUpdatedAt: new Date(),
          },
        })
      )
    );

    console.log(`[Samsara Sync] Updated ${updates.length} trucks in batch`);
  }
}
```

**Ожидаемый результат:** Ускорение синхронизации в 5-10 раз

---

### 1.4. Lazy Loading компонентов на Frontend

**Проблема:** Все компоненты загружаются сразу, большой initial bundle.

**Решение:**

#### Шаг 1: Оптимизировать главную страницу
```typescript
// src/app/page.tsx
import dynamic from 'next/dynamic';
import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import Header from "@/components/Header";
import Hero from "@/components/Hero"; // Оставляем, т.к. above-the-fold

// Lazy load компоненты ниже fold
const SecondSec = dynamic(() => import('@/components/SecondSec'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
});

const Services = dynamic(() => import('@/components/Services'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
});

const Reviews = dynamic(() => import('@/components/Reviews'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
});

const Form = dynamic(() => import('@/components/Form'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
});

// ... остальной код ...
```

#### Шаг 2: Оптимизировать форму заявки
```typescript
// src/app/driver-application/page.tsx
import dynamic from 'next/dynamic';

const DriverApplicationForm = dynamic(
  () => import('@/components/DriverApplicationForm'),
  {
    loading: () => (
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
    ssr: false // Если форма использует browser-only API
  }
);

export default function DriverApplicationPage() {
  return (
    <div className="container mx-auto py-8">
      <DriverApplicationForm />
    </div>
  );
}
```

#### Шаг 3: Code splitting для шагов формы
```typescript
// src/components/DriverApplicationForm.tsx
import { lazy, Suspense } from "react";

// Lazy load каждый шаг
const Step1ApplicantInfo = lazy(() => import('./DriverApplicationSteps/Step1ApplicantInfo'));
const Step2LicenseInfo = lazy(() => import('./DriverApplicationSteps/Step2LicenseInfo'));
const Step3MedicalCard = lazy(() => import('./DriverApplicationSteps/Step3MedicalCard'));
const Step4EmploymentHistory = lazy(() => import('./DriverApplicationSteps/Step4EmploymentHistory'));
const Step5Authorization = lazy(() => import('./DriverApplicationSteps/Step5Authorization'));
const Step6AlcoholDrug = lazy(() => import('./DriverApplicationSteps/Step5AlcoholDrug'));
const Step7PSP = lazy(() => import('./DriverApplicationSteps/Step6PSP'));
const Step8Clearinghouse = lazy(() => import('./DriverApplicationSteps/Step7Clearinghouse'));
const Step9MVR = lazy(() => import('./DriverApplicationSteps/Step8MVR'));

// Skeleton для загрузки
const StepSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-10 bg-gray-200 rounded w-3/4"></div>
    <div className="h-10 bg-gray-200 rounded"></div>
    <div className="h-10 bg-gray-200 rounded"></div>
  </div>
);

// В рендере:
{currentStep === 1 && (
  <Suspense fallback={<StepSkeleton />}>
    <Step1ApplicantInfo
      register={register}
      errors={errors}
      watch={watch}
      setValue={setValue}
    />
  </Suspense>
)}
{currentStep === 2 && (
  <Suspense fallback={<StepSkeleton />}>
    <Step2LicenseInfo
      register={register}
      errors={errors}
      watch={watch}
      setValue={setValue}
    />
  </Suspense>
)}
// ... и так далее для всех шагов
```

**Ожидаемый результат:** Уменьшение initial bundle на 40-60%

---

## 📋 ПРИОРИТЕТ 2: ВАЖНЫЕ ОПТИМИЗАЦИИ

### 2.1. Мемоизация тяжелых вычислений

**Проблема:** Валидация и вычисления выполняются на каждом рендере.

**Решение:**

```typescript
// src/components/DriverApplicationForm.tsx
import { useMemo, useCallback } from "react";

// Мемоизировать список полей для валидации
const fieldsToValidate = useMemo(() => {
  const stepFields: Record<number, (keyof DriverApplicationFormData)[]> = {
    1: ["applicantType", "firstName", "lastName", "dateOfBirth", "phone", "email", 
        "currentAddressLine1", "currentCity", "currentState", "currentZip", 
        "livedAtCurrentMoreThan3Years", "truckYear", "truckMake"],
    2: ["licenseNumber", "licenseState", "licenseClass", "licenseExpiresAt", 
        "licenseFrontFile", "licenseBackFile"],
    // ... остальные шаги
  };
  return stepFields[currentStep] || [];
}, [currentStep]);

// Мемоизировать функцию валидации
const validateCurrentStep = useCallback(async () => {
  const isValid = await trigger(fieldsToValidate);
  return isValid;
}, [fieldsToValidate, trigger, watchedValues]);

// Мемоизировать handleNext
const handleNext = useCallback(async () => {
  await saveAllSignatures();
  const isValid = await validateCurrentStep();
  
  if (isValid && currentStep < TOTAL_STEPS) {
    if (currentStep === 1) {
      const firstName = (watchedValues.firstName || "").trim().toUpperCase();
      const lastName = (watchedValues.lastName || "").trim().toUpperCase();
      const fullName = `${firstName} ${lastName}`.trim();
      
      if (fullName && fullName !== " ") {
        if (!watchedValues.pspFullName || watchedValues.pspFullName.trim() === "") {
          setValue("pspFullName", fullName, { shouldValidate: false });
        }
        if (!watchedValues.alcoholDrugName || watchedValues.alcoholDrugName.trim() === "") {
          setValue("alcoholDrugName", fullName, { shouldValidate: false });
        }
      }
    }
    
    setCurrentStep(currentStep + 1);
    setSubmitError(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}, [currentStep, validateCurrentStep, watchedValues, setValue]);
```

**Ожидаемый результат:** Улучшение производительности UI на 20-30%

---

### 2.2. Оптимизация загрузки файлов (вынести из транзакции)

**Проблема:** Загрузка файлов в Cloudinary происходит внутри транзакции, блокируя БД.

**Решение:**

```typescript
// backend/src/modules/driverApplication/driverApplication.service.ts
export async function createDriverApplication(
  dto: DriverApplicationDTO,
  files: DriverApplicationFiles,
  meta: ApplicationMetadata
) {
  // ... валидация и подготовка данных ...

  // ШАГ 1: Создать основную запись БЕЗ файлов
  const application = await prisma.driverApplication.create({
    data: {
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth,
      phone: dto.phone,
      email: dto.email,
      currentAddressLine1: dto.currentAddressLine1,
      currentCity: dto.currentCity,
      currentState: dto.currentState,
      currentZip: dto.currentZip,
      livedAtCurrentMoreThan3Years: dto.livedAtCurrentMoreThan3Years,
      ssnEncrypted,
      ssnLast4,
      applicantType: dto.applicantType || null,
      truckYear: dto.truckYear || null,
      truckMake: dto.truckMake || null,
      alcoholDrugReturnToDuty: dto.alcoholDrugReturnToDuty ?? null,
      applicantIp: meta.applicantIp,
      userAgent: meta.userAgent,
    },
  });

  // ШАГ 2: Загрузить ВСЕ файлы параллельно ВНЕ транзакции
  const uploadPromises: Promise<any>[] = [];

  // License files
  if (files.licenseFront) {
    const isPDF = files.licenseFront.mimetype === 'application/pdf' || 
                  files.licenseFront.originalname?.toLowerCase().endsWith('.pdf');
    uploadPromises.push(
      uploadToApplicationFolder(
        files.licenseFront.buffer,
        application.id,
        'license-front',
        isPDF ? 'raw' : 'image'
      ).then(result => ({ type: 'licenseFront', ...result }))
    );
  }

  if (files.licenseBack) {
    const isPDF = files.licenseBack.mimetype === 'application/pdf' || 
                  files.licenseBack.originalname?.toLowerCase().endsWith('.pdf');
    uploadPromises.push(
      uploadToApplicationFolder(
        files.licenseBack.buffer,
        application.id,
        'license-back',
        isPDF ? 'raw' : 'image'
      ).then(result => ({ type: 'licenseBack', ...result }))
    );
  }

  // Medical card
  if (files.medicalCard) {
    const isPDF = files.medicalCard.mimetype === 'application/pdf' || 
                  files.medicalCard.originalname?.toLowerCase().endsWith('.pdf');
    uploadPromises.push(
      uploadToApplicationFolder(
        files.medicalCard.buffer,
        application.id,
        'medical-card',
        isPDF ? 'raw' : 'image'
      ).then(result => ({ type: 'medicalCard', ...result }))
    );
  }

  // Signature files
  if (files.consentSignatures) {
    Object.entries(files.consentSignatures).forEach(([type, file]) => {
      uploadPromises.push(
        uploadToApplicationFolder(
          file.buffer,
          application.id,
          `consent-${type.toLowerCase()}`,
          'image'
        ).then(result => ({ type: `consent-${type}`, ...result }))
      );
    });
  }

  // Дождаться всех загрузок
  const uploadResults = await Promise.all(uploadPromises);
  
  // Преобразовать результаты в удобный формат
  const uploads: Record<string, { url: string; publicId: string }> = {};
  uploadResults.forEach(result => {
    uploads[result.type] = { url: result.url, publicId: result.publicId };
  });

  // ШАГ 3: Обновить записи с URL файлов в одной транзакции
  await prisma.$transaction(async (tx) => {
    // Driver License
    await tx.driverLicense.create({
      data: {
        applicationId: application.id,
        licenseNumber: dto.license.licenseNumber,
        state: dto.license.state,
        class: dto.license.class,
        expiresAt: licenseExpiresAt,
        endorsements: dto.license.endorsements,
        hasOtherLicensesLast3Years: dto.license.hasOtherLicensesLast3Years,
        otherLicensesJson: dto.license.otherLicensesJson,
        frontImageUrl: uploads.licenseFront?.url,
        frontImagePublicId: uploads.licenseFront?.publicId,
        backImageUrl: uploads.licenseBack?.url,
        backImagePublicId: uploads.licenseBack?.publicId,
      },
    });

    // Medical Card
    if (uploads.medicalCard || medicalCardExpiresAt) {
      await tx.medicalCard.create({
        data: {
          applicationId: application.id,
          expiresAt: medicalCardExpiresAt,
          documentUrl: uploads.medicalCard?.url,
          documentPublicId: uploads.medicalCard?.publicId,
        },
      });
    }

    // Previous addresses, employment records, legal consents
    // ... остальной код создания связанных записей ...
  });

  return {
    id: application.id,
    status: application.status,
    createdAt: application.createdAt,
  };
}
```

**Ожидаемый результат:** Уменьшение времени транзакции на 60-80%

---

### 2.3. Добавление Database Indexes

**Проблема:** Отсутствуют индексы для частых запросов.

**Решение:**

```prisma
// backend/prisma/schema.prisma

model DriverApplication {
  // ... существующие поля ...
  
  // Добавить составные индексы для оптимизации запросов
  @@index([status, createdAt(sort: Desc)]) // Для фильтрации по статусу с сортировкой
  @@index([email]) // Для поиска по email
  @@index([createdAt(sort: Desc)]) // Уже есть, но убедиться что есть
  @@index([reviewedById]) // Для запросов по reviewer
}

model FreightRequest {
  // ... существующие поля ...
  
  @@index([createdAt(sort: Desc), email]) // Для списков с фильтрацией
  @@index([email, createdAt]) // Для поиска по email
}

model ContactRequest {
  // ... существующие поля ...
  
  @@index([createdAt(sort: Desc)])
  @@index([email])
}

model AuditLog {
  // ... существующие поля ...
  
  @@index([adminId, createdAt(sort: Desc)]) // Для истории действий админа
  @@index([action, createdAt(sort: Desc)]) // Для фильтрации по действиям
  @@index([resourceId, resourceType]) // Для поиска по ресурсу
}

model RefreshToken {
  // ... существующие поля ...
  
  @@index([adminId, expiresAt]) // Для поиска активных токенов
  @@index([expiresAt]) // Для очистки истекших токенов
}
```

После изменения схемы:
```bash
cd backend
npx prisma migrate dev --name add_performance_indexes
```

**Ожидаемый результат:** Ускорение запросов на 20-40%

---

### 2.4. Оптимизация изображений

**Проблема:** Изображения не оптимизированы заранее, большой размер.

**Решение:**

#### Шаг 1: Конвертировать изображения в WebP
```bash
# Установить инструменты (если нет)
brew install webp  # macOS
# или
apt-get install webp  # Linux

# Конвертировать все изображения
cd public/images
for img in *.jpg *.png; do
  cwebp -q 85 "$img" -o "${img%.*}.webp"
done
```

#### Шаг 2: Обновить компоненты для использования WebP
```typescript
// src/components/Hero.tsx
<Image
  src="/images/truck2.webp" // Использовать WebP
  alt="..."
  fill
  priority
  sizes="100vw"
  quality={85}
  placeholder="blur" // Добавить blur placeholder
  blurDataURL="data:image/jpeg;base64,..." // Base64 превью
  className="..."
/>
```

#### Шаг 3: Добавить loading="lazy" для изображений ниже fold
```typescript
// src/components/Services.tsx, Reviews.tsx и т.д.
<Image
  src="/images/service.webp"
  alt="..."
  width={400}
  height={300}
  loading="lazy" // Lazy load
  quality={80}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**Ожидаемый результат:** Уменьшение размера изображений на 60-80%

---

## 📋 ПРИОРИТЕТ 3: ЖЕЛАТЕЛЬНЫЕ ОПТИМИЗАЦИИ

### 3.1. Redis для Rate Limiting

**Проблема:** Rate limiting в памяти сбрасывается при перезапуске.

**Решение:**

```typescript
// backend/src/middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../services/cache.service.js';

export const driverAppRateLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:driver-app:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 applications per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many applications from this IP, please try again later.',
});

export const loginRateLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:login:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});
```

Установить:
```bash
cd backend
npm install rate-limit-redis
```

---

### 3.2. Включение CSP Headers

**Проблема:** CSP отключен в Helmet.

**Решение:**

```typescript
// backend/src/index.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Для Next.js inline scripts
        "https://api.emailjs.com", // EmailJS
        "https://www.googletagmanager.com", // Google Analytics (если используется)
      ],
      styleSrc: ["'self'", "'unsafe-inline'"], // Для Tailwind
      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com", // Cloudinary
        "https://*.cloudinary.com",
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        process.env.FRONTEND_URL || "http://localhost:3000",
        "https://api.emailjs.com",
        "https://api.telegram.org",
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

---

### 3.3. Валидация Environment Variables

**Проблема:** Нет проверки env переменных при старте.

**Решение:**

```typescript
// backend/src/utils/env.validation.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('4000'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  FRONTEND_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  SAMSARA_API_TOKEN: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Использовать в index.ts:
import { validateEnv } from './utils/env.validation.js';

const env = validateEnv();
console.log('✅ Environment variables validated');
```

---

### 3.4. Bundle Analysis

**Проблема:** Неизвестно, что занимает место в bundle.

**Решение:**

```bash
# Установить
npm install --save-dev @next/bundle-analyzer
```

```typescript
// next.config.ts
import type { NextConfig } from "next";
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // ... существующая конфигурация ...
};

export default withBundleAnalyzer(nextConfig);
```

```bash
# Запустить анализ
ANALYZE=true npm run build
```

Откроется интерактивная карта bundle в браузере.

---

## 📊 ЧЕКЛИСТ ВНЕДРЕНИЯ

### Фаза 1: Критичные (1-2 дня)
- [ ] Настроить Connection Pooling
- [ ] Добавить Redis и кэширование
- [ ] Оптимизировать batch операции
- [ ] Внедрить Lazy Loading компонентов

### Фаза 2: Важные (2-3 дня)
- [ ] Добавить мемоизацию
- [ ] Вынести загрузку файлов из транзакции
- [ ] Добавить Database Indexes
- [ ] Оптимизировать изображения

### Фаза 3: Желательные (1-2 дня)
- [ ] Redis для Rate Limiting
- [ ] Включить CSP
- [ ] Валидация env переменных
- [ ] Bundle Analysis

---

## 🎯 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ ПОСЛЕ ВНЕДРЕНИЯ

### Backend:
- ⚡ Время ответа API: **50-150ms** (было 200-500ms)
- 📈 Throughput: **+200-300%**
- 💾 Database нагрузка: **-50-70%**
- 🧠 Memory usage: **-20-30%**

### Frontend:
- 🎨 FCP: **< 1.2s** (улучшение на 300-500ms)
- 🖼️ LCP: **< 2.5s** (улучшение на 400-700ms)
- ⚙️ TTI: **< 3.5s** (улучшение на 500-1000ms)
- 📦 Bundle size: **-40-60%**
- 🏆 Lighthouse Score: **90-95** (было 70-80)

### Общая оценка:
- **Скорость запросов:** 6/10 → **9/10**
- **Оптимизация:** 7/10 → **9/10**
- **Безопасность:** 8/10 → **9/10**
- **ИТОГО:** 7/10 → **9/10** ✅

---

## 🚨 ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Тестирование:** После каждого изменения запускать тесты
2. **Мониторинг:** Настроить мониторинг производительности
3. **Постепенное внедрение:** Не внедрять все сразу, делать пошагово
4. **Backup:** Делать backup БД перед миграциями
5. **Redis:** Убедиться, что Redis доступен в production

---

**Готово к внедрению!** 🚀
