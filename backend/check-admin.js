// Скрипт для проверки текущего админ-пользователя
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (admins.length === 0) {
      console.log('❌ Админ-пользователи не найдены в базе данных.');
      console.log('\n📝 Чтобы создать админ-пользователя:');
      console.log('1. Добавьте в backend/.env:');
      console.log('   ADMIN_EMAIL=youremail@example.com');
      console.log('   ADMIN_PASSWORD=yourPassword123');
      console.log('2. Запустите: npm run seed');
    } else {
      console.log('✅ Найденные админ-пользователи:\n');
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.createdAt.toLocaleString()}`);
        console.log('');
      });
      console.log('💡 Пароль хранится в зашифрованном виде и не может быть показан.');
      console.log('💡 Чтобы изменить пароль, измените ADMIN_PASSWORD в .env и запустите: npm run seed');
    }
  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();

