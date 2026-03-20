import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'noreply@glco.us';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendApplicationConfirmation(
  email: string,
  firstName: string
) {
  if (!email) return;

  if (!resend) {
    throw new Error('RESEND_API_KEY is missing. Cannot send confirmation email.');
  }

  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to: [email],
    subject: 'Your Application Has Been Received – Global Cooperation LLC',
    html: `
      <p>Hi ${firstName || 'Driver'},</p>
      <p>Thank you for applying to <b>Global Cooperation LLC</b>.</p>
      <p>Your application has been received and is now under review by our Safety & Hiring department.</p>
      <p>We will contact you as soon as we finish reviewing your information.</p>
      <p>Best regards,<br/>Global Cooperation LLC</p>
    `,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error('Resend API did not return message id');
  }
}

