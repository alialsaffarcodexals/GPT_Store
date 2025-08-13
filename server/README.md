# GPT Store — Server

## Setup
```bash
cd server
cp .env.example .env
# (optional) edit .env
npm install
npm start
```
The server will:
- Create `gptstore.db` (SQLite)
- Seed an admin user: **admin@gptstore.local / Admin@123**
- Seed sample products

**CORS origin** is controlled by `CLIENT_ORIGIN` (defaults to http://localhost:5173).

## API Overview
- `POST /api/auth/register {name,email,password}`
- `POST /api/auth/login {email,password}`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

- `GET  /api/products?search=&category=&minPrice=&maxPrice=`
- `GET  /api/products/:id`

- `POST /api/orders {items:[{product_id,quantity}], payment_method}` (auth required)

- Admin (auth + admin):
  - `GET /api/admin/users`
  - `POST /api/admin/products`
  - `PUT  /api/admin/products/:id`
  - `DELETE /api/admin/products/:id`
