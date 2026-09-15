import crypto from 'node:crypto';
import { Router } from 'express';
import { env } from '../config/env.js';
import { Order } from '../models/Order.js';
import { quoteSelection } from '../data/plans.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  createRazorpayOrder,
  paymentsEnabled,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from '../lib/razorpay.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

const newOrderNumber = () => `VI-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

// What the browser may see about an order: no email or phone, since the order number is the only key
const publicOrder = (order) => ({
  orderNumber: order.orderNumber,
  status: order.status,
  selection: order.selection,
  amount: order.amount / 100,
  currency: order.currency,
  customerName: order.customer.name,
  createdAt: order.createdAt,
  paidAt: order.paidAt,
});

function readCustomer(body) {
  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim().toLowerCase();
  const phone = String(body?.phone ?? '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');

  if (name.length < 2 || name.length > 100) return { error: 'Please enter your full name' };
  if (!EMAIL_RE.test(email) || email.length > 200) return { error: 'Please enter a valid email address' };
  if (!PHONE_RE.test(phone)) return { error: 'Please enter a valid 10-digit mobile number' };
  return { customer: { name, email, phone } };
}

async function markPaid(order, { paymentId, signature }) {
  if (order.status === 'paid') return order;
  order.status = 'paid';
  order.paidAt = new Date();
  order.razorpay.paymentId = paymentId;
  if (signature) order.razorpay.signature = signature;
  return order.save();
}

// Validates a selection and returns its server-side price for the checkout summary
router.get('/quote', async (req, res, next) => {
  try {
    const { quote, error } = await quoteSelection(req.query);
    if (error) return res.status(400).json({ message: error });
    res.json({ ...quote, paymentsEnabled: paymentsEnabled() });
  } catch (err) {
    next(err);
  }
});

// Creates our order plus the matching Razorpay order the payment popup is opened against
router.post('/orders', async (req, res, next) => {
  try {
    if (!paymentsEnabled()) {
      return res.status(503).json({ message: 'Online payments are not available right now. Please contact support.' });
    }

    const { quote, error: selectionError } = await quoteSelection(req.body?.selection);
    if (selectionError) return res.status(400).json({ message: selectionError });

    const { customer, error: customerError } = readCustomer(req.body?.customer);
    if (customerError) return res.status(400).json({ message: customerError });

    const orderNumber = newOrderNumber();
    const amount = Math.round(quote.price * 100);
    const { price, ...selection } = quote;

    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: quote.currency,
      receipt: orderNumber,
      notes: { orderNumber, level: quote.level, type: quote.type, item: quote.item, plan: quote.planName },
    });

    const order = await Order.create({
      orderNumber,
      customer,
      selection,
      amount,
      currency: quote.currency,
      razorpay: { orderId: razorpayOrder.id },
    });

    res.status(201).json({
      orderNumber: order.orderNumber,
      amount: order.amount,
      currency: order.currency,
      keyId: env.razorpay.keyId,
      razorpayOrderId: razorpayOrder.id,
      customer,
      description: `${quote.planName} · ${quote.item} (${quote.level})`,
    });
  } catch (err) {
    next(err);
  }
});

// Called by the browser with what Razorpay Checkout returns after a successful payment
router.post('/orders/:orderNumber/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body ?? {};
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (orderId !== order.razorpay.orderId || !verifyPaymentSignature({ orderId, paymentId, signature })) {
      return res.status(400).json({ message: 'We could not verify this payment. If money was deducted, please contact support.' });
    }

    res.json(publicOrder(await markPaid(order, { paymentId, signature })));
  } catch (err) {
    next(err);
  }
});

router.get('/orders/:orderNumber', async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber }).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(publicOrder(order));
  } catch (err) {
    next(err);
  }
});

// Full order list for the team, newest first. `?status=paid` to filter.
router.get('/admin/orders', requireAdmin, async (req, res, next) => {
  try {
    const filter = ['created', 'paid', 'failed'].includes(req.query.status) ? { status: req.query.status } : {};
    const orders = await Order.find(filter, { __v: 0 }).sort({ createdAt: -1 }).limit(500).lean();
    res.json(orders.map((order) => ({ ...order, amount: order.amount / 100 })));
  } catch (err) {
    next(err);
  }
});

/*
 * Razorpay webhook (order.paid / payment.captured / payment.failed). Records payments even when
 * the buyer closes the tab before the browser-side verify call runs. Mounted in index.js with a
 * raw body parser because the signature covers the exact bytes Razorpay sent.
 */
export async function handleRazorpayWebhook(req, res, next) {
  try {
    if (!verifyWebhookSignature(req.body, req.get('x-razorpay-signature'))) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString('utf8'));
    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = event.payload?.order?.entity?.id || payment?.order_id;
    const order = razorpayOrderId && (await Order.findOne({ 'razorpay.orderId': razorpayOrderId }));

    if (order) {
      if (event.event === 'order.paid' || event.event === 'payment.captured') {
        await markPaid(order, { paymentId: payment?.id });
      } else if (event.event === 'payment.failed' && order.status === 'created') {
        order.status = 'failed';
        await order.save();
      }
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export default router;
