# BevSupply — Backend API

REST API for the BevSupply beverage distribution platform, built with
**Express.js**, **TypeScript** and **MySQL**, secured with **JWT access +
refresh tokens** and **role-based access control**.

## Setup

```bash
npm install
cp .env.example .env                 # configure DB + JWT secrets
mysql -u root -p < src/db/schema.sql # create schema
npm run seed                         # load demo catalogue + users
npm run dev                          # http://localhost:4000
```

Health check: `GET /api/health`.

Demo accounts (password `Password123`):

| Role              | Email                       |
|-------------------|-----------------------------|
| Customer          | customer@bevsupply.com      |
| Warehouse manager | warehouse@bevsupply.com     |
| Finance           | finance@bevsupply.com       |
| Super admin       | admin@bevsupply.com         |

## API

| Method | Endpoint                        | Access            | Description                         |
|--------|---------------------------------|-------------------|-------------------------------------|
| POST   | `/api/auth/register`            | public            | Create a customer account           |
| POST   | `/api/auth/login`               | public            | Login, returns access token + cookie|
| POST   | `/api/auth/refresh`             | cookie            | Rotate a new access token           |
| POST   | `/api/auth/logout`              | public            | Revoke refresh token                 |
| GET    | `/api/auth/me`                  | authenticated     | Current user profile                |
| GET    | `/api/products`                 | public            | Search / filter / sort / paginate   |
| GET    | `/api/products/:slug`           | public            | Product with images & reviews       |
| POST   | `/api/products`                 | warehouse / admin | Create a product                    |
| GET    | `/api/categories`               | public            | Categories with product counts      |
| GET    | `/api/suppliers`                | public            | Active suppliers                    |
| POST   | `/api/coupons/validate`         | public            | Validate a coupon against a subtotal|
| POST   | `/api/orders`                   | authenticated     | Place an order (atomic, decrements stock) |
| GET    | `/api/orders`                   | authenticated     | List my orders                      |
| GET    | `/api/orders/:reference`        | owner / staff     | Order detail with line items        |
| PATCH  | `/api/orders/:reference/status` | staff             | Advance order status                |

### Product query parameters
`q`, `category`, `brand`, `supplier`, `minPrice`, `maxPrice`, `minRating`,
`inStock`, `discounted`, `tag`, `sort` (`price-asc`|`price-desc`|`rating`|`newest`),
`page`, `limit`.

## Structure

```
src/
├── index.ts                # bootstrap (DB check + listen)
├── app.ts                  # express app, middleware, route mounting
├── config/                 # env + MySQL pool
├── middleware/             # authenticate, authorize (RBAC), validate, error
├── controllers/            # auth, product, order, catalog
├── routes/                 # route definitions
├── utils/                  # tokens, ApiError, asyncHandler
└── db/                     # schema.sql + seed.ts
```

## Security

- Passwords hashed with bcrypt.
- Short-lived JWT access tokens + long-lived refresh tokens (persisted &
  revocable in `refresh_tokens`).
- `authorize(...roles)` middleware enforces RBAC; `super_admin` bypasses.
- `helmet`, `cors` (credentialed), rate limiting on auth, Zod request validation.
- `audit_logs` table records sensitive actions (e.g. order creation).
- Orders are created inside a transaction with `SELECT … FOR UPDATE` to prevent
  overselling stock.
