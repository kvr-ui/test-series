import { Router } from 'express';
import { env } from '../config/env.js';
import { Order } from '../models/Order.js';
import { mailEnabled } from '../lib/mailer.js';
import { deliverOrderConfirmation } from '../lib/orderConfirmation.js';
import {
  adminLoginEnabled,
  credentialsMatch,
  endAdminSession,
  readAdminSession,
  requireAdminSession,
  startAdminSession,
} from '../middleware/adminSession.js';

const router = Router();

const STATUSES = ['created', 'paid', 'failed'];
const PAGE_SIZE = 25;

// Failed logins per client IP; kept in memory, which is enough for a single admin account on one server
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGINS = 10;
const failedLogins = new Map();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const adminOrder = (order) => ({
  orderNumber: order.orderNumber,
  status: order.status,
  customer: order.customer,
  selection: order.selection,
  amount: order.amount / 100,
  currency: order.currency,
  paymentId: order.razorpay?.paymentId,
  confirmationEmail: order.confirmationEmail,
  createdAt: order.createdAt,
  paidAt: order.paidAt,
});

router.post('/login', (req, res) => {
  if (!adminLoginEnabled()) return res.status(403).json({ message: 'Dashboard login is disabled' });

  const now = Date.now();
  const attempts = failedLogins.get(req.ip);
  if (attempts && attempts.resetAt > now && attempts.count >= MAX_FAILED_LOGINS) {
    return res.status(429).json({ message: 'Too many failed attempts. Please try again in a few minutes.' });
  }

  if (!credentialsMatch(req.body?.email, req.body?.password)) {
    const current = attempts && attempts.resetAt > now ? attempts : { count: 0, resetAt: now + LOGIN_WINDOW_MS };
    failedLogins.set(req.ip, { ...current, count: current.count + 1 });
    return res.status(401).json({ message: 'Incorrect email or password' });
  }

  failedLogins.delete(req.ip);
  startAdminSession(res);
  res.json({ email: env.admin.email });
});

router.post('/logout', (req, res) => {
  endAdminSession(res);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const session = adminLoginEnabled() && readAdminSession(req);
  if (!session) return res.status(401).json({ message: 'Please log in' });
  res.json({ email: session.email });
});

// Orders newest first. `status` filters (default: all), `q` matches order number, name, email or phone.
router.get('/orders', requireAdminSession, async (req, res, next) => {
  try {
    const filter = {};
    if (STATUSES.includes(req.query.status)) filter.status = req.query.status;

    const q = String(req.query.q ?? '').trim().slice(0, 100);
    if (q) {
      const pattern = new RegExp(escapeRegex(q), 'i');
      filter.$or = [
        { orderNumber: pattern },
        { 'customer.name': pattern },
        { 'customer.email': pattern },
        { 'customer.phone': pattern },
      ];
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const [orders, total, [paidSummary]] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
      Order.countDocuments(filter),
      Order.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amount' } } }]),
    ]);

    res.json({
      orders: orders.map(adminOrder),
      total,
      page,
      pageSize: PAGE_SIZE,
      summary: { paidOrders: paidSummary?.count ?? 0, revenue: (paidSummary?.amount ?? 0) / 100 },
      mailEnabled: mailEnabled(),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:orderNumber/resend-confirmation', requireAdminSession, async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'paid') return res.status(400).json({ message: 'Only paid orders get a confirmation email' });
    if (!mailEnabled()) return res.status(503).json({ message: 'Email is not configured on the server' });

    const result = await deliverOrderConfirmation(order);
    if (!result.ok) return res.status(502).json({ message: `Email could not be sent: ${result.error}` });
    res.json(adminOrder(await Order.findById(order._id).lean()));
  } catch (err) {
    next(err);
  }
});

export default router;
