import { useEffect, useRef, useState } from 'react';
import { createOrder, getQuote, verifyOrder } from '../lib/api.js';
import { buildPlans, formatInr } from '../lib/plans.js';
import { loadRazorpay } from '../lib/razorpay.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

function readSelection() {
  const params = new URLSearchParams(window.location.search);
  return {
    level: params.get('level') || '',
    type: params.get('type') || '',
    item: params.get('item') || '',
    plan: params.get('plan') || '',
  };
}

function validate({ name, email, phone, agreed }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Please enter your full name';
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Please enter a valid email address';
  if (!PHONE_RE.test(phone)) errors.phone = 'Please enter a valid 10-digit mobile number';
  if (!agreed) errors.agreed = 'Please accept the terms to continue';
  return errors;
}

function Field({ id, label, error, prefix, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <div
        className={`flex overflow-hidden rounded-lg border-2 bg-card transition-colors focus-within:border-accent ${
          error ? 'border-destructive' : 'border-border'
        }`}
      >
        {prefix && <span className="flex items-center border-r border-border bg-muted px-3 text-sm text-muted-foreground">{prefix}</span>}
        <input
          id={id}
          name={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-h-[44px] w-full bg-transparent px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          {...inputProps}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2" />
    <path strokeLinecap="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0v4" />
  </svg>
);

export default function Checkout({ site }) {
  const [selection] = useState(readSelection);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', agreed: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | processing | verifying
  const [error, setError] = useState('');
  // Reopen the same order if the buyer closes the popup and tries again with unchanged details
  const lastOrder = useRef(null);

  useEffect(() => {
    document.title = `Checkout – ${site.brand}`;
    const controller = new AbortController();
    getQuote(selection, { signal: controller.signal })
      .then(setQuote)
      .catch((err) => {
        if (err.name !== 'AbortError') setQuoteError(err.message);
      });
    return () => controller.abort();
  }, [selection, site.brand]);

  const update = (key) => (e) => {
    const value = key === 'agreed' ? e.target.checked : key === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const pay = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setStatus('processing');
    const customer = { name: form.name.trim(), email: form.email.trim(), phone: form.phone };
    const customerKey = JSON.stringify(customer);

    try {
      const orderPromise =
        lastOrder.current?.customerKey === customerKey
          ? Promise.resolve(lastOrder.current.order)
          : createOrder({ selection, customer });
      const [Razorpay, order] = await Promise.all([loadRazorpay(), orderPromise]);
      lastOrder.current = { customerKey, order };

      const popup = new Razorpay({
        key: order.keyId,
        order_id: order.razorpayOrderId,
        amount: order.amount,
        currency: order.currency,
        name: site.brand,
        description: order.description,
        image: `${window.location.origin}/focas-logo.jpg`,
        prefill: { name: customer.name, email: customer.email, contact: `+91${customer.phone}` },
        notes: { orderNumber: order.orderNumber },
        theme: { color: '#2463eb' },
        handler: async (response) => {
          setStatus('verifying');
          // The order page shows the final state; the webhook confirms the payment if this call fails
          await verifyOrder(order.orderNumber, response).catch(() => {});
          window.location.assign(`/order/${encodeURIComponent(order.orderNumber)}`);
        },
        modal: {
          confirm_close: true,
          ondismiss: () => setStatus('idle'),
        },
      });
      popup.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed. Please try again or use another payment method.');
      });
      popup.open();
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  if (quoteError) {
    return (
      <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 pt-16 text-center">
        <h1 className="text-2xl font-bold text-primary">This plan isn&apos;t available</h1>
        <p className="max-w-md text-muted-foreground">{quoteError}</p>
        <a href="/#pricing" className="rounded-full bg-accent px-6 py-2 font-bold text-accent-foreground">
          Choose a plan
        </a>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-busy="true">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
      </div>
    );
  }

  const plan = buildPlans(quote.type, quote.item).find((p) => p.key === quote.plan);
  const busy = status !== 'idle';

  return (
    <div className="container mx-auto max-w-2xl px-4 pb-24 pt-20 sm:pt-24 lg:max-w-6xl lg:pt-28">
      <a href="/#pricing" className="-my-2 inline-flex min-h-[44px] items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
        <span aria-hidden="true">←</span> Change plan
      </a>
      <h1 className="mt-1 text-3xl font-bold text-primary md:text-4xl">Checkout</h1>

      <div className="mt-6 grid items-start gap-6 sm:mt-8 lg:grid-cols-5 lg:gap-8">
        {/* Order summary: first on mobile so the price is visible before the form */}
        <aside className="rounded-2xl border-2 border-border bg-card p-5 shadow-card sm:p-6 lg:sticky lg:top-24 lg:order-2 lg:col-span-2">
          <h2 className="text-lg font-bold text-primary">Order summary</h2>

          <div className="mt-5 border-b border-border pb-5">
            <p className="font-display text-xl font-bold text-primary">{quote.planName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              CA {quote.level} · {quote.type === 'Both Groups' ? 'Both Groups' : `${quote.type} · ${quote.item}`}
            </p>
            <ul className="mt-4 space-y-2">
              {plan?.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/20">
                    <CheckIcon className="h-2.5 w-2.5 text-accent" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <dl className="space-y-2 py-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-foreground">{formatInr(quote.price)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Billing</dt>
              <dd className="text-foreground">One-time</dd>
            </div>
          </dl>

          <div className="flex items-baseline justify-between border-t border-border pt-5">
            <span className="font-medium text-foreground">Total</span>
            <span className="font-display text-3xl font-bold text-primary">{formatInr(quote.price)}</span>
          </div>
        </aside>

        {/* Customer details */}
        <form onSubmit={pay} noValidate className="rounded-2xl border-2 border-border bg-card p-5 shadow-soft sm:p-6 lg:order-1 lg:col-span-3 lg:p-8">
          <h2 className="text-lg font-bold text-primary">Your details</h2>
          <p className="mt-1 text-sm text-muted-foreground">We&apos;ll use these to set up your mentored tests and share updates.</p>

          <div className="mt-6 space-y-5">
            <Field
              id="name"
              label="Full name"
              autoComplete="name"
              value={form.name}
              onChange={update('name')}
              error={fieldErrors.name}
              disabled={busy}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                error={fieldErrors.email}
                disabled={busy}
              />
              <Field
                id="phone"
                label="Mobile number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                prefix="+91"
                value={form.phone}
                onChange={update('phone')}
                error={fieldErrors.phone}
                disabled={busy}
              />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={update('agreed')}
                  disabled={busy}
                  aria-invalid={Boolean(fieldErrors.agreed)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(var(--accent))]"
                />
                <span>
                  I agree to the{' '}
                  <a href="/terms-and-conditions.pdf" target="_blank" rel="noopener" className="font-medium text-accent underline-offset-2 hover:underline">
                    Terms &amp; Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy-policy.pdf" target="_blank" rel="noopener" className="font-medium text-accent underline-offset-2 hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {fieldErrors.agreed && <p className="mt-1 text-sm text-destructive">{fieldErrors.agreed}</p>}
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {!quote.paymentsEnabled && (
            <p className="mt-6 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              Online payments are temporarily unavailable. Please reach us on WhatsApp to complete your purchase.
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !quote.paymentsEnabled}
            className="mt-6 w-full rounded-xl bg-accent px-6 py-3.5 text-lg font-bold text-accent-foreground transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'processing' ? 'Opening payment…' : status === 'verifying' ? 'Confirming payment…' : `Pay ${formatInr(quote.price)}`}
          </button>

          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <LockIcon />
            Secure payment via UPI, cards, net banking or wallets. We never see your card details.
          </p>
        </form>
      </div>
    </div>
  );
}
