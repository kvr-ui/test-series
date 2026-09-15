import crypto from 'node:crypto';
import { env } from '../config/env.js';

const API_BASE = 'https://api.razorpay.com/v1';

export const paymentsEnabled = () => Boolean(env.razorpay.keyId && env.razorpay.keySecret);

export async function createRazorpayOrder({ amount, currency, receipt, notes }) {
  const auth = Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString('base64');
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, receipt, notes }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Razorpay order creation failed (${res.status}): ${data.error?.description || 'unknown error'}`);
  }
  return data;
}

function hmacMatches(payload, secret, signature) {
  if (typeof signature !== 'string' || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const given = Buffer.from(signature, 'utf8');
  return given.length === expected.length && crypto.timingSafeEqual(given, Buffer.from(expected, 'utf8'));
}

// Signature Razorpay Checkout hands back to the browser after a successful payment
export const verifyPaymentSignature = ({ orderId, paymentId, signature }) =>
  hmacMatches(`${orderId}|${paymentId}`, env.razorpay.keySecret, signature);

// Signature on webhook deliveries, computed over the raw request body
export const verifyWebhookSignature = (rawBody, signature) =>
  hmacMatches(rawBody, env.razorpay.webhookSecret, signature);
