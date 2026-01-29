import Redis from 'ioredis';

// Создаем Redis клиент с обработкой ошибок
// Если Redis недоступен, приложение продолжит работать без кэша
let redis: Redis | null = null;
let redisEnabled = false;

// Инициализация Redis (с обработкой ошибок)
try {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redis = new Redis(redisUrl, {
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
    },
    lazyConnect: true, // Не подключаться сразу, только при первом использовании
  });

  redis.on('error', (err) => {
    console.warn('Redis Client Error:', err.message);
    redisEnabled = false;
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
    redisEnabled = true;
  });

  redis.on('ready', () => {
    console.log('✅ Redis ready');
    redisEnabled = true;
  });

  redis.on('close', () => {
    console.warn('⚠️ Redis connection closed');
    redisEnabled = false;
  });

  // Попытка подключения (не блокирующая)
  redis.connect().catch((err) => {
    console.warn('⚠️ Redis connection failed, continuing without cache:', err.message);
    redisEnabled = false;
  });
} catch (error) {
  console.warn('⚠️ Redis initialization failed, continuing without cache:', error);
  redisEnabled = false;
}

/**
 * Получить данные из кэша или выполнить fetcher и закэшировать
 * Если Redis недоступен, просто выполняет fetcher
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  // Если Redis недоступен, просто выполняем fetcher
  if (!redis || !redisEnabled) {
    return fetcher();
  }

  try {
    const cached = await redis.get(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch (parseError) {
        console.warn(`Redis: Failed to parse cached data for key ${key}`);
        // Если не удалось распарсить, удаляем битый ключ и продолжаем
        await redis.del(key).catch(() => {});
      }
    }
  } catch (error) {
    console.warn(`Redis: Get error for key ${key}:`, error instanceof Error ? error.message : error);
    // Продолжаем выполнение без кэша
  }

  // Выполняем fetcher
  const data = await fetcher();

  // Пытаемся закэшировать результат (не блокируем если не получилось)
  if (redis && redisEnabled) {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.warn(`Redis: Set error for key ${key}:`, error instanceof Error ? error.message : error);
      // Не критично, продолжаем работу
    }
  }

  return data;
}

/**
 * Инвалидировать кэш по паттерну
 */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis || !redisEnabled) {
    return;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn(`Redis: Invalidate error for pattern ${pattern}:`, error instanceof Error ? error.message : error);
  }
}

/**
 * Удалить конкретный ключ из кэша
 */
export async function deleteCache(key: string): Promise<void> {
  if (!redis || !redisEnabled) {
    return;
  }

  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`Redis: Delete error for key ${key}:`, error instanceof Error ? error.message : error);
  }
}

/**
 * Проверить, доступен ли Redis
 */
export function isRedisEnabled(): boolean {
  return redisEnabled && redis !== null;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  if (redis) {
    try {
      await redis.quit();
    } catch (error) {
      // Игнорируем ошибки при закрытии
    }
  }
});

export default redis;
