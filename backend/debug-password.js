// Отладка пароля
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const password = process.env.ADMIN_PASSWORD;
const email = process.env.ADMIN_EMAIL;

console.log('🔍 Отладка пароля...\n');
console.log('Email из .env:', email);
console.log('Password из .env:', password);
console.log('Длина пароля:', password?.length);
console.log('Пароль в байтах:', Buffer.from(password || '').toString('hex'));
console.log('\n');

// Хешируем пароль так же, как в seed
const passwordHash = await bcrypt.hash(password, 12);
console.log('Новый хеш:', passwordHash);
console.log('\n');

// Проверяем
const isValid = await bcrypt.compare(password, passwordHash);
console.log('Проверка нового хеша:', isValid ? '✅ OK' : '❌ FAILED');

