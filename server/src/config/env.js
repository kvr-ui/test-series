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
  isProduction: process.env.NODE_ENV === 'production',
};
