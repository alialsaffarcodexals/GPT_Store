const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function api(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const AuthAPI = {
  me: () => api('/api/auth/me'),
  login: (email, password) => api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => api('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  logout: () => api('/api/auth/logout', { method: 'POST' }),
};

export const ProductAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api('/api/products' + (qs ? `?${qs}` : ''));
  },
  get: (id) => api(`/api/products/${id}`),
  reviews: (id) => api(`/api/products/${id}/reviews`),
  addReview: (id, r) => api(`/api/products/${id}/reviews`, { method: 'POST', body: JSON.stringify(r) })
};

export const AdminAPI = {
  users: () => api('/api/admin/users'),
  addUser: (u) => api('/api/admin/users', { method: 'POST', body: JSON.stringify(u) }),
  updateUser: (id, u) => api(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(u) }),
  deleteUser: (id) => api(`/api/admin/users/${id}`, { method: 'DELETE' }),
  addProduct: (p) => api('/api/admin/products', { method: 'POST', body: JSON.stringify(p) }),
  updateProduct: (id, p) => api(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  deleteProduct: (id) => api(`/api/admin/products/${id}`, { method: 'DELETE' }),
};

export const OrderAPI = {
  create: (payload) => api('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
};
