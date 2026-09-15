import mongoose from 'mongoose';

/*
 * One document per checkout attempt. Created as `created` when the buyer submits their details,
 * moved to `paid` once the Razorpay signature checks out (from the browser or the webhook).
 * `amount` is in paise, the unit Razorpay works in.
 */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
    selection: {
      level: { type: String, required: true },
      type: { type: String, required: true },
      item: { type: String, required: true },
      plan: { type: String, required: true },
      planName: { type: String, required: true },
    },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created', index: true },
    razorpay: {
      orderId: { type: String, index: true },
      paymentId: String,
      signature: String,
    },
    paidAt: Date,
  },
  { timestamps: true },
);

export const Order = mongoose.model('Order', orderSchema);
