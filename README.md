# BevSupply — Beverage Distribution & Wholesale E-Commerce Platform

A modern, responsive, professional **B2B e-commerce platform** for a beverage
distribution company. The company buys drinks from multiple wholesalers and
distributes them to retailers, supermarkets, restaurants, hotels, bars, cafés,
and individual customers.

Customers can browse products, place orders, pay online, track deliveries and
manage their purchases, while administrators manage inventory, suppliers,
orders, deliveries and finances.

## Tech Stack

**Frontend**
- Next.js (App Router) + React + TypeScript
- Tailwind CSS (custom design system)
- Framer Motion (animations)
- React Query (server state) + Zustand (cart / UI state)

**Backend**
- Node.js + Express.js + TypeScript
- MySQL (schema + seed included)
- JWT access + refresh token authentication
- Role-Based Access Control (RBAC)

## Design System

| Token       | Value      | Usage                    |
|-------------|------------|--------------------------|
| Primary     | `#E63946`  | Brand red, CTAs          |
| Secondary   | `#1D3557`  | Navy, headers            |
| Accent      | `#F4A261`  | Orange highlights        |
| Success     | `#2A9D8F`  | Confirmations, in-stock  |
| Background   | `#F8F9FA`  | Page background          |

White cards with soft shadows and rounded corners, smooth animations, a
mobile-first responsive layout.

## Monorepo Layout

```
.
├── frontend/    # Next.js customer-facing storefront + dashboards
└── backend/     # Express + MySQL REST API
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```
The storefront ships with local seed data, so it runs and looks complete
without the backend. Point it at the API by setting `NEXT_PUBLIC_API_URL`.

### Backend
```bash
cd backend
npm install
cp .env.example .env         # configure MySQL + JWT secrets
mysql -u root -p < src/db/schema.sql
npm run seed                 # load demo catalogue
npm run dev                  # http://localhost:4000
```

## Feature Map

- **Storefront**: premium homepage, category browsing, advanced search &
  filters, product detail with gallery / nutrition / reviews, cart, checkout
  with multiple payment methods, order tracking timeline.
- **Accounts**: register / login (JWT + refresh), customer dashboard (orders,
  invoices, wishlist, addresses, reward points).
- **Roles**: Guest, Customer, Sales Agent, Warehouse Manager, Delivery Driver,
  Supplier, Finance, Super Admin — enforced through RBAC middleware.
- **Commerce back office** (API): products, suppliers, inventory, orders,
  deliveries, promotions/coupons.

See `frontend/README.md` and `backend/README.md` for module-level detail.

## Deployment

**Frontend (Vercel)** — import the repo on vercel.com, set *Root Directory* to
`frontend`, keep the Next.js defaults and deploy. No env vars are needed: the
storefront runs on its built-in seed data.

**Backend (optional, e.g. Render + a managed MySQL)** — root directory
`backend`, build `npm install && npm run build`, start `npm start`. Required
env vars in production: `NODE_ENV=production`, `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`, `CLIENT_ORIGIN` (your Vercel URL), plus the `DB_*`
settings. Load `src/db/schema.sql` into the database, then run `npm run seed`
once. Health check: `/api/health`.

> Note: the storefront UI is not yet wired to the API — login, register and
> checkout are front-end demos. Hosting the backend is only useful once that
> integration is built.
