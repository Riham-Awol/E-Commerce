"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart, User, Menu, X, Grid3x3 } from "lucide-react";
import { useCart } from "@/store/cart";
import { categories } from "@/data/categories";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const items = useCart((s) => s.items);
  const wishlist = useCart((s) => s.wishlist);
  const cartCount = items.filter((i) => !i.savedForLater).reduce((n, i) => n + i.quantity, 0);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/products?q=${encodeURIComponent(query)}`);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-secondary/10 bg-white/95 backdrop-blur">
      <div className="container-page">
        <div className="flex h-16 items-center gap-4">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg font-bold text-white">
              B
            </span>
            <span className="font-display text-xl font-extrabold text-secondary">
              Bev<span className="text-primary">Supply</span>
            </span>
          </Link>

          {/* Category dropdown */}
          <div
            className="relative hidden lg:block"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button className="btn-ghost gap-2 text-sm">
              <Grid3x3 className="h-4 w-4" /> Categories
            </button>
            {catOpen && (
              <div className="absolute left-0 top-full z-50 grid w-[520px] grid-cols-2 gap-1 rounded-2xl border border-secondary/10 bg-white p-3 shadow-pop">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/products?category=${c.slug}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-secondary hover:bg-canvas"
                  >
                    <span className="text-lg">{c.icon}</span>
                    <span className="flex-1">{c.name}</span>
                    <span className="text-xs text-secondary/40">{c.productCount}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <form onSubmit={submitSearch} className="hidden flex-1 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search drinks, brands, suppliers, barcode…"
                className="input pl-11"
              />
            </div>
          </form>

          <nav className="ml-auto flex items-center gap-1">
            <Link href="/wishlist" className="relative rounded-full p-2.5 hover:bg-canvas">
              <Heart className="h-5 w-5 text-secondary" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/dashboard" className="rounded-full p-2.5 hover:bg-canvas">
              <User className="h-5 w-5 text-secondary" />
            </Link>
            <Link href="/cart" className="relative rounded-full p-2.5 hover:bg-canvas">
              <ShoppingCart className="h-5 w-5 text-secondary" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/login" className="btn-primary ml-2 hidden sm:inline-flex">
              Sign in
            </Link>
          </nav>
        </div>

        {/* Secondary nav */}
        <div className="hidden items-center gap-6 pb-3 text-sm font-medium text-secondary/70 lg:flex">
          <Link href="/products" className="hover:text-primary">All Products</Link>
          <Link href="/products?tag=offer" className="hover:text-primary">Today&apos;s Offers</Link>
          <Link href="/products?tag=bestseller" className="hover:text-primary">Best Sellers</Link>
          <Link href="/products?tag=wholesale" className="hover:text-primary">Wholesale Deals</Link>
          <Link href="/suppliers" className="hover:text-primary">Suppliers</Link>
          <Link href="/how-it-works" className="hover:text-primary">How It Works</Link>
          <Link href="/contact" className="hover:text-primary">Contact</Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-secondary/10 bg-white p-4 lg:hidden">
          <form onSubmit={submitSearch} className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search drinks…"
                className="input pl-11"
              />
            </div>
          </form>
          <div className="grid grid-cols-2 gap-2">
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c.slug}
                href={`/products?category=${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2 text-sm"
              >
                <span>{c.icon}</span> {c.name}
              </Link>
            ))}
          </div>
          <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-primary mt-4 w-full">
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}
