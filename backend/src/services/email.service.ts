import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Получаем путь к текущему файлу и директорию
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем .env из корня backend директории
dotenv.config({ path: join(__dirname, '../../.env') });

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || 'noreply.glcous@gmail.com';

// ВРЕМЕННЫЕ логи для проверки
console.log('[EmailService] SMTP_HOST =', smtpHost);
console.log('[EmailService] SMTP_USER =', smtpUser);
console.log('[EmailService] SMTP_PASS set =', !!smtpPass);

if (!smtpHost || !smtpUser || !smtpPass) {
  console.error('[EmailService] ❌ SMTP env vars are missing!', {
    smtpHost,
    smtpUser,
    hasPass: !!smtpPass,
  });
  // Можно либо упасть, либо бросить ошибку, но точно НЕ использовать тест конфиг
  // Чтобы сразу увидеть проблему, кидаем ошибку:
  throw new Error('SMTP configuration is missing. Check .env');
}

export const mailer = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendApplicationConfirmation(
  email: string,
  firstName: string
) {
  if (!email) return;

  await mailer.sendMail({
    from: emailFrom,
    to: email,
    subject: 'Your Application Has Been Received – Global Cooperation LLC',
    html: `
      <p>Hi ${firstName || 'Driver'},</p>
      <p>Thank you for applying to <b>Global Cooperation LLC</b>.</p>
      <p>Your application has been received and is now under review by our Safety & Hiring department.</p>
      <p>We will contact you as soon as we finish reviewing your information.</p>
      <p>Best regards,<br/>Global Cooperation LLC</p>
    `,
  });
}

