import Redis from 'ioredis';

// Создаем Redis клиент с обработкой ошибок
// Если Redis недоступен, приложение продолжит работать без кэша
let redis: Redis | null = null;
let redisEnabled = false;
let redisConnectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;
let lastErrorLogTime = 0;
const ERROR_LOG_INTERVAL = 60000; // Логировать ошибки не чаще раза в минуту

// Инициализация Redis (с обработкой ошибок)
try {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1, // Уменьшаем количество попыток
    retryStrategy: (times) => {
      // Останавливаем попытки переподключения после MAX_CONNECTION_ATTEMPTS
      if (times > MAX_CONNECTION_ATTEMPTS) {
        redisEnabled = false;
        return null; // Останавливаем переподключение
      }
      const delay = Math.min(times * 100, 1000);
      return delay;
    },
    reconnectOnError: (err) => {
      // Не переподключаться автоматически - только для READONLY ошибок
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      // Для всех остальных ошибок не переподключаемся
      redisEnabled = false;
      return false;
    },
    lazyConnect: true, // Не подключаться сразу, только при первом использовании
    enableOfflineQueue: false, // Отключаем очередь офлайн команд
    enableReadyCheck: false, // Отключаем проверку готовности для быстрого отказа
  });

  redis.on('error', (err) => {
    const now = Date.now();
    // Логируем ошибки не чаще раза в минуту
    if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
      console.warn('⚠️ Redis unavailable, continuing without cache');
      lastErrorLogTime = now;
    }
    redisEnabled = false;
    redisConnectionAttempts++;
    
    // Если слишком много ошибок, отключаем Redis полностью
    if (redisConnectionAttempts >= MAX_CONNECTION_ATTEMPTS && redis) {
      try {
        redis.disconnect();
      } catch (e) {
        // Игнорируем ошибки при отключении
      }
    }
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
    redisEnabled = true;
    redisConnectionAttempts = 0; // Сбрасываем счетчик при успешном подключении
  });

  redis.on('ready', () => {
    console.log('✅ Redis ready');
    redisEnabled = true;
    redisConnectionAttempts = 0;
  });

  redis.on('close', () => {
    redisEnabled = false;
    // Не логируем close - это нормально при отключении
  });

  // Попытка подключения (не блокирующая)
  redis.connect().catch((err) => {
    redisConnectionAttempts++;
    if (redisConnectionAttempts === 1) {
      // Логируем только при первой попытке
      console.warn('⚠️ Redis connection failed, continuing without cache');
    }
    redisEnabled = false;
    
    // Если не удалось подключиться, отключаем клиент
    if (redisConnectionAttempts >= MAX_CONNECTION_ATTEMPTS && redis) {
      try {
        redis.disconnect();
      } catch (e) {
        // Игнорируем ошибки
      }
    }
  });
} catch (error) {
  console.warn('⚠️ Redis initialization failed, continuing without cache');
  redisEnabled = false;
  redis = null;
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
        // Если не удалось распарсить, удаляем битый ключ и продолжаем
        await redis.del(key).catch(() => {});
      }
    }
  } catch (error) {
    // Тихая обработка ошибок - не логируем каждую ошибку
    // Если ошибка критичная, она будет обработана в обработчике событий
    if (!redisEnabled) {
      return fetcher();
    }
  }

  // Выполняем fetcher
  const data = await fetcher();

  // Пытаемся закэшировать результат (не блокируем если не получилось)
  if (redis && redisEnabled) {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      // Тихая обработка - не логируем каждую ошибку
      // Redis будет отключен через обработчик событий если нужно
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
    // Тихая обработка ошибок
    // Redis будет отключен через обработчик событий если нужно
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
    // Тихая обработка ошибок
    // Redis будет отключен через обработчик событий если нужно
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
