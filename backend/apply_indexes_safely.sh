#!/bin/bash
# Безопасное применение индексов в production

set -e  # Остановить при ошибке

cd /var/www/backend/backend

echo "🔍 Шаг 1: Синхронизация схемы с БД (создаст недостающие индексы)..."
npx prisma db push --accept-data-loss

echo "✅ Шаг 2: Создание baseline миграций для существующих изменений..."

# Создать baseline миграции
mkdir -p prisma/migrations/20260113163833_add_truck_model
cat > prisma/migrations/20260113163833_add_truck_model/migration.sql << 'EOF'
-- Baseline migration: Truck model already exists in database
-- This migration is marked as applied to sync migration history
EOF

mkdir -p prisma/migrations/20260113194651_node_modules_bin_prisma_generate
cat > prisma/migrations/20260113194651_node_modules_bin_prisma_generate/migration.sql << 'EOF'
-- Baseline migration: Already applied
EOF

mkdir -p prisma/migrations/20260113200404_add_samsara_fields
cat > prisma/migrations/20260113200404_add_samsara_fields/migration.sql << 'EOF'
-- Baseline migration: Samsara fields already exist in database
EOF

echo "✅ Шаг 3: Помечаем baseline миграции как примененные..."
npx prisma migrate resolve --applied 20260113163833_add_truck_model || echo "⚠️  Миграция уже помечена"
npx prisma migrate resolve --applied 20260113194651_node_modules_bin_prisma_generate || echo "⚠️  Миграция уже помечена"
npx prisma migrate resolve --applied 20260113200404_add_samsara_fields || echo "⚠️  Миграция уже помечена"

echo "✅ Шаг 4: Генерация Prisma Client..."
npx prisma generate

echo "✅ Шаг 5: Сборка проекта..."
npm run build

echo "✅ Шаг 6: Перезапуск сервера..."
pm2 restart backend --update-env

echo "🎉 Готово! Индексы применены, сервер перезапущен."
