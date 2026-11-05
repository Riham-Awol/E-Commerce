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
without the backend. To connect it to the API, create `frontend/.env.local`
with `BACKEND_URL=http://localhost:4000`.

### Backend
```bash
cd backend
npm install
cp .env.example .env         # configure MySQL + JWT secrets
# create an empty MySQL database named bevsupply first
npm run dev                  # http://localhost:4000 (creates tables + loads the catalogue on first start)
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

Three free services: **Vercel** (website), **Render** (API) and **Aiven**
(MySQL database). Deploy in this order.

### 1. Database — Aiven (free MySQL)
1. Sign up at aiven.io → *Create service* → **MySQL** → *Free plan*.
2. When it's running, open the service's *Overview* and note **Host, Port,
   User, Password** and **Database name** (`defaultdb`).

### 2. API — Render
1. Sign up at render.com with GitHub → **New → Blueprint** → pick this repo.
   Render reads `render.yaml` and creates the `bevsupply-api` service.
2. Fill in `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` from
   Aiven, and choose an `ADMIN_PASSWORD` for the staff accounts.
3. Deploy. On first start the API creates the tables and loads the catalogue
   automatically. Check `https://<your-service>.onrender.com/api/health`.

> If the connection fails with a certificate error, either paste Aiven's
> *CA certificate* into a `DB_SSL_CA` variable or set
> `DB_SSL_REJECT_UNAUTHORIZED=false`.

### 3. Website — Vercel
1. Sign up at vercel.com with GitHub → **Add New → Project** → import this repo.
2. Set **Root Directory** to `frontend`.
3. Add the environment variable `BACKEND_URL` = your Render URL
   (e.g. `https://bevsupply-api.onrender.com`).
4. Deploy. The site proxies `/api/*` to the backend, so no CORS setup is needed.

Without `BACKEND_URL` the website still deploys and runs as a demo on its
built-in data.

### 4. Card payments — Stripe (optional)
Customers pay on Stripe's hosted payment page, so card details never touch
your servers. Until Stripe is configured, the card option is simply hidden and
the other payment methods still work.

1. Sign up at stripe.com. Stay in **Test mode** for now (toggle at the top).
2. *Developers → API keys*: copy the **Secret key** (`sk_test_…`) into
   `STRIPE_SECRET_KEY` on Render.
3. Set `SITE_URL` on Render to your Vercel address
   (e.g. `https://bevsupply.vercel.app`).
4. *Developers → Webhooks → Add endpoint*:
   - URL: `https://<your-service>.onrender.com/api/payments/webhook`
   - Events: `checkout.session.completed`,
     `checkout.session.async_payment_succeeded`, `checkout.session.expired`
   - Copy the endpoint's **Signing secret** (`whsec_…`) into
     `STRIPE_WEBHOOK_SECRET` on Render.
5. Redeploy the Render service, then place an order and pay with the test card
   `4242 4242 4242 4242` (any future date, any CVC).
6. To take real money: activate your Stripe account, switch to **Live mode**,
   and repeat steps 2 and 4 with the live key and a live webhook.

How it works: an order is created as *payment pending*, then the customer is
sent to Stripe. When payment succeeds the order becomes *paid / confirmed*
(confirmed both when the customer returns and via the webhook, in case they
close the tab). Unpaid card orders are cancelled after 30 minutes and their
stock is released (this needs the webhook). Customers can retry from the
cancelled page or with **Pay now** in *My account → Orders*.

### Notes
- Render's free plan sleeps after 15 min idle; the first request after that
  takes ~1 minute. Product pages fall back to built-in data while it wakes.
- Demo customer login: `customer@bevsupply.com` / `Password123`.
- Staff logins (`admin@`, `warehouse@`, `finance@bevsupply.com`) use your
  `ADMIN_PASSWORD`.
- Payment methods other than card (bank transfer, PayPal, mobile money, cash
  on delivery, wallet) are recorded on the order as *payment pending* for your
  team to collect.
