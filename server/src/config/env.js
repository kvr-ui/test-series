import 'dotenv/config';

const trimSlash = (value) => value.replace(/\/+$/, '');

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/video-insights',
  siteUrl: trimSlash(process.env.SITE_URL || ''),
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  adminToken: process.env.ADMIN_TOKEN || '',
  // Login for the /dashboard order view. Login is disabled until ADMIN_PASSWORD is set.
  admin: {
    email: (process.env.ADMIN_EMAIL || 'kvr@focasedu.com').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || '',
    sessionSecret: process.env.ADMIN_SESSION_SECRET || '',
  },
  // SMTP account the order confirmation emails are sent from. Emails are skipped until host and from are set.
  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : Number(process.env.SMTP_PORT) === 465,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || '',
    notifyTo: process.env.ORDER_NOTIFY_EMAIL || '',
  },
  isProduction: process.env.NODE_ENV === 'production',
};
