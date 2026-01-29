import { z } from 'zod';

/**
 * Environment variables validation schema
 * Validates all required and optional environment variables at startup
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  
  // Redis (optional)
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional().or(z.literal('')),
  
  // Frontend
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').optional(),
  
  // Server
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').transform(Number).default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Telegram (optional)
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  
  // Samsara (optional)
  SAMSARA_API_KEY: z.string().optional(),
  SAMSARA_API_SECRET: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validates and returns environment variables
 * Throws an error if required variables are missing or invalid
 */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variables validation failed:');
      error.errors.forEach((err) => {
        console.error(`   - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n⚠️  Please fix the environment variables and restart the server.\n');
      throw new Error('Invalid environment variables');
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Use this instead of process.env directly
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    return validateEnv();
  }
  return validatedEnv;
}

// Export individual getters for convenience
export const env = {
  get databaseUrl() {
    return getEnv().DATABASE_URL;
  },
  get jwtSecret() {
    return getEnv().JWT_SECRET;
  },
  get cloudinary() {
    return {
      cloudName: getEnv().CLOUDINARY_CLOUD_NAME,
      apiKey: getEnv().CLOUDINARY_API_KEY,
      apiSecret: getEnv().CLOUDINARY_API_SECRET,
    };
  },
  get redisUrl() {
    return getEnv().REDIS_URL || 'redis://localhost:6379';
  },
  get frontendUrl() {
    return getEnv().FRONTEND_URL;
  },
  get port() {
    return getEnv().PORT;
  },
  get nodeEnv() {
    return getEnv().NODE_ENV;
  },
  get isProduction() {
    return getEnv().NODE_ENV === 'production';
  },
  get isDevelopment() {
    return getEnv().NODE_ENV === 'development';
  },
};
