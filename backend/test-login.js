// Тестовый скрипт для проверки логина
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testLogin() {
  const testEmail = 'admin@glco.us';
  const testPassword = 'Admin123!@#';

  console.log('🔍 Тестирование входа...\n');
  console.log(`Email: ${testEmail}`);
  console.log(`Password: ${testPassword}\n`);

  try {
    // Найти пользователя
    const admin = await prisma.adminUser.findUnique({
      where: { email: testEmail.toLowerCase().trim() },
    });

    if (!admin) {
      console.log('❌ Пользователь не найден в базе данных');
      console.log('\n📝 Попробуйте запустить: npm run seed');
      return;
    }

    console.log('✅ Пользователь найден:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Password Hash: ${admin.passwordHash.substring(0, 20)}...\n`);

    // Проверить пароль
    console.log('🔐 Проверка пароля...');
    const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
    
    if (isValid) {
      console.log('✅ Пароль правильный!');
      console.log('\n💡 Если вход все еще не работает, проверьте:');
      console.log('   1. Запущен ли backend сервер (npm run dev)');
      console.log('   2. Правильно ли указан NEXT_PUBLIC_API_URL во frontend');
      console.log('   3. Нет ли ошибок в консоли браузера');
    } else {
      console.log('❌ Пароль неправильный!');
      console.log('\n💡 Попробуйте:');
      console.log('   1. Проверить ADMIN_PASSWORD в .env');
      console.log('   2. Запустить: npm run seed');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

