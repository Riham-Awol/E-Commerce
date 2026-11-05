# BevSupply — Frontend

The customer-facing storefront and dashboards for the BevSupply beverage
distribution platform, built with **Next.js (App Router)**, **TypeScript**,
**Tailwind CSS**, **Framer Motion** and **React Query**.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # strict TS check
npm run build      # production build
```

The storefront ships with local seed data (`src/data`), so every page renders
without a backend. Set `BACKEND_URL` (see `.env.example`) to connect it to the
Express API: `/api/*` is then proxied to the backend, and login, registration,
checkout, order history and live prices/stock use real data. The API client is
`src/lib/api.ts`, live catalogue data is in `src/lib/catalogue.ts`, and the
session lives in `src/store/auth.ts`.

## Structure

```
src/
├── app/                     # App Router routes
│   ├── page.tsx             # Homepage (hero, categories, offers, suppliers…)
│   ├── products/            # Catalogue with advanced search & filters
│   ├── product/[slug]/      # Product detail (gallery, specs, reviews, related)
│   ├── cart/                # Cart, save-for-later, coupons
│   ├── checkout/            # Multi-step checkout + payment methods
│   ├── dashboard/           # Customer account (orders, invoices, wishlist…)
│   ├── wishlist/            # Saved products
│   ├── login / register/    # JWT + Google auth UI
│   └── suppliers, contact, coverage, how-it-works
├── components/              # Navbar, Footer, ProductCard, home sections…
├── data/                    # Seed catalogue, categories, demo orders
├── store/                   # Zustand cart & wishlist (persisted)
├── lib/                     # API client + formatting utilities
└── types/                   # Shared TypeScript types
```

## Design system

Brand tokens live in `tailwind.config.ts`:
`primary #E63946`, `secondary #1D3557`, `accent #F4A261`, `success #2A9D8F`,
canvas background `#F8F9FA`, with `shadow-card` soft shadows and rounded
corners. Reusable button/card/input classes are in `src/app/globals.css`.

## Implemented features

- Premium responsive homepage: hero, category grid, featured / offers /
  best-seller / wholesale product rows, brand marquee, flash-sale countdown,
  featured suppliers, how-it-works, testimonials, delivery coverage, newsletter.
- Advanced search & filtering (query, category, brand, supplier, price,
  rating, availability, discount) with sorting.
- Product detail with image gallery, bulk pricing tiers, nutrition, specs,
  reviews, Q&A, frequently-bought-together and related products.
- Cart with quantity control, save-for-later, coupons and live totals
  (subtotal, tax, zone-based delivery fee).
- Multi-step checkout with delivery/pickup, delivery windows and every payment
  method (card/Stripe, PayPal, bank transfer, mobile money, COD, wallet).
- Customer dashboard: order-tracking timeline, invoices, wishlist, addresses,
  coupons, reward points, notifications, support and settings.
- Email sign-in / registration against the backend JWT flow (access token in
  memory, httpOnly refresh cookie), protected checkout and dashboard.
