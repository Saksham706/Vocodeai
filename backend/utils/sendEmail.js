import nodemailer from "nodemailer";

export async function sendEmail(to, subject, html, text, attachments = []) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"VocodeAI" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
    ...(attachments.length > 0 ? { attachments } : {}),
  });
}