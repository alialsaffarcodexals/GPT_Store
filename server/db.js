import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('gptstore.db');

// Create tables if not exist
db.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS trg_products_updated_at
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = datetime('now') WHERE id = old.id;
END;

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price_each REAL NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

// Seed admin if not exists
const adminEmail = 'admin@gptstore.local';
const getAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
if (!getAdmin) {
  const hash = bcrypt.hashSync('Admin@123', 10);
  db.prepare('INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, 1)')
    .run('Admin', adminEmail, hash);
  console.log('Seeded admin account: admin@gptstore.local / Admin@123');
}

// Seed some products if empty
const countProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
if (countProducts === 0) {
  const sample = [
    ['Galaxy S24', 'Latest Samsung flagship smartphone with stunning display.', 899.00, 'Mobile Phone', '/images/galaxy.jpg', 25],
    ['iPhone 15 Pro', 'Apple high-end smartphone with A17 chip.', 1099.00, 'Mobile Phone', '/images/iphone.jpg', 30],
    ['Lenovo IdeaPad 5', '15-inch laptop for everyday productivity.', 699.00, 'Laptop', '/images/lenovo.jpg', 15],
    ['MacBook Air M2', 'Ultra-light laptop with M2 chip.', 1199.00, 'Laptop', '/images/mba.jpg', 20],
    ['Custom Gaming PC', 'Ryzen + RTX for 1440p gaming.', 1499.00, 'PC', '/images/pc.jpg', 8],
    ['Sony Bravia 55"', '4K OLED TV with vivid colors.', 1299.00, 'TV Screen', '/images/bravia.jpg', 12],
    ['LG C3 65"', 'Premium 4K OLED TV with deep blacks.', 1899.00, 'TV Screen', '/images/lgc3.jpg', 9],
    ['Logitech G502', 'Gaming mouse with adjustable DPI.', 59.99, 'Addon', '/images/g502.jpg', 100],
    ['Anker 65W Charger', 'Fast GaN charger for laptops and phones.', 39.99, 'Addon', '/images/anker.jpg', 200],
    ['Samsung 1TB SSD', 'NVMe SSD with fast read/write.', 99.99, 'Addon', '/images/ssd.jpg', 80]
  ];
  const stmt = db.prepare('INSERT INTO products (title, description, price, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)');
  const tx = db.transaction((items) => {
    for (const p of items) stmt.run(...p);
  });
  tx(sample);
  console.log('Seeded products.');
}

export default db;
