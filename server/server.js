import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'devsupersecret';

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// --------- Helpers / Middleware ---------
function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, is_admin: !!user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
}

function authRequired(req, res, next) {
  const token = req.cookies['token'];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminRequired(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Admin only' });
  next();
}

// --------- Auth Routes ---------
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, hash);
  const user = db.prepare('SELECT id, name, email, is_admin FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = makeToken(user);

  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = makeToken(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, is_admin: !!user.is_admin } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies['token'];
  if (!token) return res.json({ user: null });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, is_admin FROM users WHERE id = ?').get(payload.id);
    return res.json({ user });
  } catch {
    return res.json({ user: null });
  }
});

// --------- Products ---------
app.get('/api/products', (req, res) => {
  const { search = '', category = '', minPrice = '', maxPrice = '' } = req.query;
  const clauses = [];
  const params = [];
  if (search) { clauses.push('(title LIKE ? OR description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (category) { clauses.push('category = ?'); params.push(category); }
  if (minPrice) { clauses.push('price >= ?'); params.push(Number(minPrice)); }
  if (maxPrice) { clauses.push('price <= ?'); params.push(Number(maxPrice)); }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const products = db.prepare(`SELECT * FROM products ${where} ORDER BY created_at DESC`).all(...params);
  res.json({ products });
});

app.get('/api/products/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ product: p });
});

// --------- Orders ---------
app.post('/api/orders', authRequired, (req, res) => {
  const { items, payment_method } = req.body; // items: [{product_id, quantity}]
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' });
  if (!payment_method) return res.status(400).json({ error: 'Missing payment method' });
  let total = 0;
  const tx = db.transaction(() => {
    for (const it of items) {
      const p = db.prepare('SELECT id, price, stock FROM products WHERE id = ?').get(it.product_id);
      if (!p) throw new Error('Product missing');
      if (p.stock < it.quantity) throw new Error('Insufficient stock');
      total += p.price * it.quantity;
    }
    const orderInfo = db.prepare('INSERT INTO orders (user_id, total, payment_method) VALUES (?, ?, ?)')
      .run(req.user.id, total, payment_method);
    const order_id = orderInfo.lastInsertRowid;
    for (const it of items) {
      const p = db.prepare('SELECT id, price, stock FROM products WHERE id = ?').get(it.product_id);
      db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price_each) VALUES (?, ?, ?, ?)')
        .run(order_id, p.id, it.quantity, p.price);
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(it.quantity, p.id);
    }
    return order_id;
  });
  try {
    const order_id = tx();
    res.json({ ok: true, order_id, total });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --------- Admin ---------
app.get('/api/admin/users', authRequired, adminRequired, (req, res) => {
  const users = db.prepare('SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

app.post('/api/admin/products', authRequired, adminRequired, (req, res) => {
  const { title, description, price, category, image, stock } = req.body;
  if (!title || !description || !price || !category) return res.status(400).json({ error: 'Missing fields' });
  const info = db.prepare('INSERT INTO products (title, description, price, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)')
    .run(title, description, price, category, image || '', stock ?? 0);
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
  res.json({ product: p });
});

app.put('/api/admin/products/:id', authRequired, adminRequired, (req, res) => {
  const { title, description, price, category, image, stock } = req.body;
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE products SET title=?, description=?, price=?, category=?, image=?, stock=? WHERE id=?')
    .run(title ?? p.title, description ?? p.description, price ?? p.price, category ?? p.category, image ?? p.image, stock ?? p.stock, p.id);
  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(p.id);
  res.json({ product: updated });
});

app.delete('/api/admin/products/:id', authRequired, adminRequired, (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM products WHERE id = ?').run(p.id);
  res.json({ ok: true });
});

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Root
app.get('/', (_req, res) => {
  res.send('GPT Store API is running');
});

app.listen(PORT, () => {
  console.log(`GPT Store server running on http://localhost:${PORT}`);
});
