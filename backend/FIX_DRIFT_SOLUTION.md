# 🔧 Решение проблемы Migration Drift

## Проблема
Миграции применены в БД, но файлов миграций нет локально. Prisma не может их найти.

## ✅ Решение (Выберите один вариант)

### Вариант 1: Использовать `prisma db push` (Быстро, для production)

```bash
cd /var/www/backend/backend

# 1. Синхронизировать схему с БД (создаст недостающие индексы)
npx prisma db push

# 2. Создать baseline миграцию вручную
mkdir -p prisma/migrations/20260113163833_add_truck_model
echo "-- Baseline migration - Truck model already exists in DB" > prisma/migrations/20260113163833_add_truck_model/migration.sql

mkdir -p prisma/migrations/20260113194651_node_modules_bin_prisma_generate
echo "-- Baseline migration - already applied" > prisma/migrations/20260113194651_node_modules_bin_prisma_generate/migration.sql

mkdir -p prisma/migrations/20260113200404_add_samsara_fields
echo "-- Baseline migration - Samsara fields already exist in DB" > prisma/migrations/20260113200404_add_samsara_fields/migration.sql

# 3. Пометить их как примененные
npx prisma migrate resolve --applied 20260113163833_add_truck_model
npx prisma migrate resolve --applied 20260113194651_node_modules_bin_prisma_generate
npx prisma migrate resolve --applied 20260113200404_add_samsara_fields

# 4. Теперь создать миграцию для индексов
npx prisma migrate dev --name add_performance_indexes --create-only

# 5. Применить миграцию
npx prisma migrate deploy

# 6. Пересобрать
npx prisma generate
npm run build
pm2 restart backend --update-env
```

### Вариант 2: Использовать `prisma migrate diff` (Более правильный)

```bash
cd /var/www/backend/backend

# 1. Создать SQL для синхронизации
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script > sync.sql

# 2. Проверить SQL (должны быть только CREATE INDEX)
cat sync.sql

# 3. Создать миграцию вручную
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_add_performance_indexes
mv sync.sql prisma/migrations/*_add_performance_indexes/migration.sql

# 4. Применить миграцию
npx prisma migrate deploy

# 5. Создать baseline для существующих миграций
mkdir -p prisma/migrations/20260113163833_add_truck_model
echo "-- Baseline: Truck model already exists" > prisma/migrations/20260113163833_add_truck_model/migration.sql

mkdir -p prisma/migrations/20260113194651_node_modules_bin_prisma_generate
echo "-- Baseline: already applied" > prisma/migrations/20260113194651_node_modules_bin_prisma_generate/migration.sql

mkdir -p prisma/migrations/20260113200404_add_samsara_fields
echo "-- Baseline: Samsara fields already exist" > prisma/migrations/20260113200404_add_samsara_fields/migration.sql

# 6. Пометить как примененные
npx prisma migrate resolve --applied 20260113163833_add_truck_model
npx prisma migrate resolve --applied 20260113194651_node_modules_bin_prisma_generate
npx prisma migrate resolve --applied 20260113200404_add_samsara_fields

# 7. Пересобрать
npx prisma generate
npm run build
pm2 restart backend --update-env
```

### Вариант 3: Просто использовать `db push` (Самый простой)

```bash
cd /var/www/backend/backend

# Просто синхронизировать схему - создаст недостающие индексы
npx prisma db push --accept-data-loss

# Пересобрать
npx prisma generate
npm run build
pm2 restart backend --update-env
```

**⚠️ ВАЖНО:** `db push` не создает файлы миграций, но синхронизирует схему с БД.

---

## 🎯 РЕКОМЕНДУЮ: Вариант 1 (db push + baseline)

Это самый безопасный и правильный способ для production.
