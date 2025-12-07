import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { validatePassword } from '../src/utils/password-validation.js';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    console.error(`❌ Password validation failed: ${passwordValidation.error}`);
    console.error('Password requirements:');
    console.error('  - Minimum 12 characters');
    console.error('  - At least one uppercase letter');
    console.error('  - At least one lowercase letter');
    console.error('  - At least one number');
    console.error('  - At least one special character');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'SUPER_ADMIN',
    },
    create: {
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Admin user created/updated:', email);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

