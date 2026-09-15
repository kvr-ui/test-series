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
