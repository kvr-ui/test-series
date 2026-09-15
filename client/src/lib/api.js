const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

export const getPage = (slug, { signal } = {}) => request(`/api/pages/${slug}`, { signal });

export const getQuote = (selection, { signal } = {}) =>
  request(`/api/checkout/quote?${new URLSearchParams(selection)}`, { signal });

export const createOrder = ({ selection, customer }) =>
  request('/api/checkout/orders', { method: 'POST', body: JSON.stringify({ selection, customer }) });

export const verifyOrder = (orderNumber, payment) =>
  request(`/api/checkout/orders/${encodeURIComponent(orderNumber)}/verify`, {
    method: 'POST',
    body: JSON.stringify(payment),
  });

export const getOrder = (orderNumber, { signal } = {}) =>
  request(`/api/checkout/orders/${encodeURIComponent(orderNumber)}`, { signal });

// Admin dashboard: the session lives in an HttpOnly cookie the server sets on login
export const adminLogin = ({ email, password }) =>
  request('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const adminLogout = () => request('/api/admin/logout', { method: 'POST' });

export const getAdminSession = () => request('/api/admin/me');

export const getAdminOrders = ({ status, q, page }, { signal } = {}) =>
  request(`/api/admin/orders?${new URLSearchParams({ status, q, page })}`, { signal });

export const resendConfirmation = (orderNumber) =>
  request(`/api/admin/orders/${encodeURIComponent(orderNumber)}/resend-confirmation`, { method: 'POST' });
