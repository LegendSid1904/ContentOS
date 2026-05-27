import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "ContentOS <hello@contentos.ai>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to ContentOS 🚀",
    html: `<p>Hey ${name},</p><p>Welcome to ContentOS — your AI content operating system.</p>`,
  });
}
