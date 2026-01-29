import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Оптимизированная конфигурация connection pool
// Увеличиваем лимит соединений и настраиваем таймауты для лучшей производительности
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL || '';
  // Проверяем, есть ли уже query параметры в URL
  const separator = baseUrl.includes('?') ? '&' : '?';
  return baseUrl + 
    `${separator}connection_limit=20` +           // Увеличиваем лимит соединений с 10 до 20
    `&pool_timeout=20` +                         // Таймаут ожидания соединения (секунды)
    `&connect_timeout=10` +                      // Таймаут подключения (секунды)
    `&statement_cache_size=0`;                   // Отключаем кэш для production (лучше для больших запросов)
};

const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
};

// Используем singleton pattern для предотвращения создания множественных экземпляров
// В development режиме сохраняем в global для hot reload
export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown - правильно закрываем соединения при завершении процесса
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
