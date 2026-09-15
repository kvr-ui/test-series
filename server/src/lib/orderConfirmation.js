import { Order } from '../models/Order.js';
import { sendOrderConfirmation } from './mailer.js';

// Emails the confirmation and records the outcome on the order, so the dashboard can show it and offer a resend
export async function deliverOrderConfirmation(order) {
  try {
    await sendOrderConfirmation(order);
    await Order.updateOne({ _id: order._id }, { $set: { confirmationEmail: { sentAt: new Date() } } });
    return { ok: true };
  } catch (err) {
    console.error(`Confirmation email for ${order.orderNumber} failed:`, err.message);
    await Order.updateOne({ _id: order._id }, { $set: { 'confirmationEmail.error': err.message } }).catch(() => {});
    return { ok: false, error: err.message };
  }
}
