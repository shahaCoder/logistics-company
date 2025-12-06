// Сброс админ-пользователя
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function resetAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@glco.us';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!@#';

  console.log('🔄 Сброс админ-пользователя...\n');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);

  try {
    // Удалить существующего пользователя
    await prisma.adminUser.deleteMany({
      where: { email },
    });
    console.log('✅ Старый пользователь удален');

    // Создать нового
    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✅ Новый пользователь создан:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}\n`);

    // Проверить пароль
    const isValid = await bcrypt.compare(password, passwordHash);
    console.log('🔐 Проверка пароля:', isValid ? '✅ OK' : '❌ FAILED');
    
    if (isValid) {
      console.log('\n✅ Готово! Теперь можно войти с этими данными.');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();

