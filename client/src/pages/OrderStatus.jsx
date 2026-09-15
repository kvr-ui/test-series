import { useEffect, useState } from 'react';
import { getOrder } from '../lib/api.js';
import { checkoutHref, formatInr } from '../lib/plans.js';

// A just-paid order can still read `created` until verification or the webhook lands
const POLL_MS = 3000;
const MAX_POLLS = 10;

const STATES = {
  paid: {
    tone: 'bg-green-100 text-green-700',
    icon: 'M5 13l4 4L19 7',
    title: 'Payment successful',
  },
  created: {
    tone: 'bg-amber-100 text-amber-700',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Confirming your payment',
  },
  failed: {
    tone: 'bg-destructive/10 text-destructive',
    icon: 'M6 18L18 6M6 6l12 12',
    title: 'Payment failed',
  },
};

export default function OrderStatus({ orderNumber, site }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = `Order ${orderNumber} – ${site.brand}`;
    const controller = new AbortController();
    let polls = 0;
    let timer;

    const load = () =>
      getOrder(orderNumber, { signal: controller.signal })
        .then((data) => {
          setOrder(data);
          if (data.status === 'created' && ++polls < MAX_POLLS) timer = setTimeout(load, POLL_MS);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') setError(err.status === 404 ? 'We couldn’t find this order.' : err.message);
        });

    load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [orderNumber, site.brand]);

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 pt-16 text-center">
        <h1 className="text-2xl font-bold text-primary">{error}</h1>
        <a href="/" className="rounded-full bg-accent px-6 py-2 font-bold text-accent-foreground">
          Back to home
        </a>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-busy="true">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
      </div>
    );
  }

  const state = STATES[order.status] ?? STATES.created;
  const { selection } = order;

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 pb-20 pt-24">
      <div className="w-full max-w-lg rounded-2xl border-2 border-border bg-card p-6 text-center shadow-card sm:p-10" role="status">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${state.tone}`}>
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={state.icon} />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-primary sm:text-3xl">{state.title}</h1>
        <p className="mt-2 text-muted-foreground">
          {order.status === 'paid' && `Thank you, ${order.customerName.split(' ')[0]}! Your plan is booked.`}
          {order.status === 'created' &&
            'This usually takes a few seconds. If money was deducted, it will be confirmed automatically — no need to pay again.'}
          {order.status === 'failed' && 'The payment didn’t go through. If any amount was deducted, your bank will refund it automatically.'}
        </p>

        <dl className="mt-8 space-y-3 rounded-xl bg-muted p-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Order number</dt>
            <dd className="font-mono font-medium text-foreground">{order.orderNumber}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="text-right font-medium text-foreground">{selection.planName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">For</dt>
            <dd className="text-right text-foreground">
              CA {selection.level} · {selection.item}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-3">
            <dt className="text-muted-foreground">{order.status === 'paid' ? 'Amount paid' : 'Amount'}</dt>
            <dd className="font-bold text-primary">{formatInr(order.amount)}</dd>
          </div>
        </dl>

        <p className="mt-6 text-sm text-muted-foreground">Keep your order number handy if you contact us about this purchase.</p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {order.status === 'failed' && (
            <a href={checkoutHref(selection)} className="rounded-full bg-accent px-6 py-2.5 font-bold text-accent-foreground">
              Try again
            </a>
          )}
          <a
            href="/"
            className={`rounded-full px-6 py-2.5 font-bold ${
              order.status === 'failed' ? 'border-2 border-accent text-accent' : 'bg-accent text-accent-foreground'
            }`}
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
