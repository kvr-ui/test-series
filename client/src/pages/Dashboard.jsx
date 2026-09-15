import { useCallback, useEffect, useState } from 'react';
import { adminLogin, adminLogout, getAdminOrders, getAdminSession, resendConfirmation } from '../lib/api.js';
import { formatInr } from '../lib/plans.js';

const FILTERS = [
  { value: 'paid', label: 'Paid' },
  { value: 'created', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: '', label: 'All' },
];

const STATUS_BADGES = {
  paid: { label: 'Paid', tone: 'bg-green-100 text-green-700' },
  created: { label: 'Pending', tone: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Failed', tone: 'bg-destructive/10 text-destructive' },
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const describeSelection = ({ level, type, item }) => (type === 'Both Groups' ? `CA ${level} · Both Groups` : `CA ${level} · ${type} · ${item}`);

const Spinner = () => (
  <div className="flex min-h-[40vh] items-center justify-center" aria-busy="true">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
  </div>
);

function LoginForm({ onLoggedIn }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      onLoggedIn(await adminLogin(form));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const inputClass =
    'min-h-[44px] w-full rounded-lg border-2 border-border bg-card px-4 py-2.5 text-base text-foreground focus:border-accent focus:outline-none';

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border-2 border-border bg-card p-6 shadow-card sm:p-8">
        <img src="/focas-logo.jpg" alt="FOCAS Edu" className="h-10 w-auto" />
        <h1 className="mt-6 text-2xl font-bold text-primary">Orders dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to see who purchased.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-accent px-6 py-3 font-bold text-accent-foreground transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

function EmailStatus({ order, mailEnabled, onResend }) {
  const [busy, setBusy] = useState(false);
  if (order.status !== 'paid') return <span className="text-muted-foreground">—</span>;

  const { sentAt, error } = order.confirmationEmail ?? {};
  const resend = async () => {
    setBusy(true);
    await onResend(order.orderNumber);
    setBusy(false);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      {sentAt ? (
        <span className="text-green-700">Sent {formatDate(sentAt)}</span>
      ) : (
        <span className="text-destructive" title={error}>
          {error ? 'Failed' : 'Not sent'}
        </span>
      )}
      {mailEnabled && (
        <button type="button" onClick={resend} disabled={busy} className="text-xs font-medium text-accent hover:underline disabled:opacity-60">
          {busy ? 'Sending…' : sentAt ? 'Resend' : 'Send now'}
        </button>
      )}
    </div>
  );
}

function OrdersView({ admin, onLoggedOut }) {
  const [status, setStatus] = useState('paid');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Search runs shortly after typing stops rather than on every key
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleError = useCallback(
    (err) => {
      if (err.name === 'AbortError') return;
      if (err.status === 401) onLoggedOut();
      else setError(err.message);
    },
    [onLoggedOut],
  );

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    getAdminOrders({ status, q: query, page }, { signal: controller.signal }).then(setData).catch(handleError);
    return () => controller.abort();
  }, [status, query, page, handleError]);

  const resend = async (orderNumber) => {
    setNotice('');
    try {
      const updated = await resendConfirmation(orderNumber);
      setData((prev) => ({ ...prev, orders: prev.orders.map((o) => (o.orderNumber === orderNumber ? updated : o)) }));
      setNotice(`Confirmation email sent to ${updated.customer.email}`);
    } catch (err) {
      handleError(err);
    }
  };

  const logout = async () => {
    await adminLogout().catch(() => {});
    onLoggedOut();
  };

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/focas-logo.jpg" alt="FOCAS Edu" className="h-8 w-auto" />
            <span className="hidden font-bold text-primary sm:inline">Orders</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{admin.email}</span>
            <button type="button" onClick={logout} className="rounded-full border-2 border-border px-4 py-1.5 font-medium text-foreground hover:border-accent">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {data && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Paid orders</p>
              <p className="mt-1 text-3xl font-bold text-primary">{data.summary.paidOrders.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-2xl border-2 border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="mt-1 text-3xl font-bold text-primary">{formatInr(data.summary.revenue)}</p>
            </div>
          </div>
        )}

        {data && !data.mailEnabled && (
          <p className="mt-4 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-800">
            Confirmation emails are off: set SMTP_HOST and MAIL_FROM in the server environment.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Order status">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={status === filter.value}
                onClick={() => {
                  setStatus(filter.value);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  status === filter.value ? 'bg-accent text-accent-foreground' : 'border-2 border-border bg-card text-foreground hover:border-accent'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search name, email, phone or order no."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border-2 border-border bg-card px-4 text-sm text-foreground focus:border-accent focus:outline-none sm:w-80"
          />
        </div>

        {notice && <p className="mt-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800">{notice}</p>}
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!data ? (
          !error && <Spinner />
        ) : data.orders.length === 0 ? (
          <p className="mt-6 rounded-2xl border-2 border-border bg-card p-10 text-center text-muted-foreground">No orders found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border-2 border-border bg-card">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Purchased</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.orders.map((order) => {
                  const badge = STATUS_BADGES[order.status] ?? STATUS_BADGES.created;
                  return (
                    <tr key={order.orderNumber} className="align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-foreground">
                        {formatDate(order.paidAt || order.createdAt)}
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground">{order.orderNumber}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{order.customer.name}</td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${order.customer.email}`} className="block break-all text-accent hover:underline">
                          {order.customer.email}
                        </a>
                        <a href={`tel:+91${order.customer.phone}`} className="mt-0.5 block whitespace-nowrap text-foreground hover:underline">
                          +91 {order.customer.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{order.selection.planName}</div>
                        <div className="mt-0.5 text-muted-foreground">{describeSelection(order.selection)}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-primary">{formatInr(order.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.tone}`}>{badge.label}</span>
                        {order.paymentId && <div className="mt-1 font-mono text-xs text-muted-foreground">{order.paymentId}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <EmailStatus order={order} mailEnabled={data.mailEnabled} onResend={resend} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > data.pageSize && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {data.total.toLocaleString('en-IN')} orders · page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-full border-2 border-border bg-card px-4 py-1.5 font-medium text-foreground disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border-2 border-border bg-card px-4 py-1.5 font-medium text-foreground disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Dashboard() {
  const [admin, setAdmin] = useState(undefined); // undefined while checking, null when logged out

  useEffect(() => {
    document.title = 'Orders dashboard – FOCAS Edu';
    getAdminSession()
      .then(setAdmin)
      .catch(() => setAdmin(null));
  }, []);

  const loggedOut = useCallback(() => setAdmin(null), []);

  if (admin === undefined) return <Spinner />;
  if (!admin) return <LoginForm onLoggedIn={setAdmin} />;
  return <OrdersView admin={admin} onLoggedOut={loggedOut} />;
}
