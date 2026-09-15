import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export const mailEnabled = () => Boolean(env.mail.host && env.mail.from);

let transporter;

const getTransporter = () =>
  (transporter ??= nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
  }));

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

const formatInr = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;

const formatDate = (date) =>
  new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });

function confirmationContent(order) {
  const { customer, selection } = order;
  const firstName = customer.name.split(' ')[0];
  const course = selection.type === 'Both Groups' ? `CA ${selection.level} · Both Groups` : `CA ${selection.level} · ${selection.type} · ${selection.item}`;
  const rows = [
    ['Order number', order.orderNumber],
    ['Plan', selection.planName],
    ['For', course],
    ['Amount paid', formatInr(order.amount)],
    ['Paid on', formatDate(order.paidAt || order.updatedAt)],
    ['Payment ID', order.razorpay?.paymentId],
  ].filter(([, value]) => value);

  const subject = `Order confirmed – ${selection.planName} (${order.orderNumber})`;

  const text = [
    `Hi ${firstName},`,
    '',
    'Thank you for your purchase. Your payment was successful and your plan is booked.',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Our team will reach out to you shortly to set up your mentored tests.',
    'Keep your order number handy if you contact us about this purchase.',
    '',
    '– FOCAS Edu',
  ].join('\n');

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
  <h2 style="color:#1e3a8a;margin:0 0 16px">Your order is confirmed</h2>
  <p>Hi ${escapeHtml(firstName)},</p>
  <p>Thank you for your purchase. Your payment was successful and your plan is booked.</p>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f3f4f6;border-radius:8px">
    ${rows
      .map(
        ([label, value]) => `<tr>
      <td style="padding:10px 16px;color:#6b7280;font-size:14px">${escapeHtml(label)}</td>
      <td style="padding:10px 16px;font-size:14px;font-weight:bold;text-align:right">${escapeHtml(value)}</td>
    </tr>`,
      )
      .join('')}
  </table>
  <p>Our team will reach out to you shortly to set up your mentored tests.</p>
  <p style="color:#6b7280;font-size:13px">Keep your order number handy if you contact us about this purchase.</p>
  <p style="margin-top:24px">– FOCAS Edu</p>
</div>`;

  return { subject, text, html };
}

// Sends the buyer their confirmation (with a copy to ORDER_NOTIFY_EMAIL when set). Throws on SMTP errors.
export async function sendOrderConfirmation(order) {
  if (!mailEnabled()) throw new Error('Email is not configured (set SMTP_HOST and MAIL_FROM)');
  await getTransporter().sendMail({
    from: env.mail.from,
    to: order.customer.email,
    bcc: env.mail.notifyTo || undefined,
    ...confirmationContent(order),
  });
}
