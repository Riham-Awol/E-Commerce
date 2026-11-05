"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLiveProduct } from "@/lib/catalogue";
import { motion } from "framer-motion";
import {
  ShoppingCart, Heart, Minus, Plus, Truck, ShieldCheck, RefreshCw,
  BadgeCheck, ChevronRight, Check,
} from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/store/cart";
import { cn, discountedPrice, formatCurrency } from "@/lib/utils";
import { StarRating } from "@/components/StarRating";
import { ProductCard } from "@/components/ProductCard";

const tabs = ["Description", "Specifications", "Nutrition", "Reviews", "Q&A"] as const;

export function ProductDetail({
  product: staticProduct, related, frequentlyBought,
}: { product: Product; related: Product[]; frequentlyBought: Product[] }) {
  // Live price & stock from the API when connected.
  const product = useLiveProduct(staticProduct);
  const add = useCart((s) => s.add);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const wished = useCart((s) => s.wishlist.includes(product.id));

  const [qty, setQty] = useState(product.minOrderQty);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Description");
  const [added, setAdded] = useState(false);

  // Keep the quantity valid if live data changes the minimum order.
  useEffect(() => {
    setQty((q) => Math.max(q, product.minOrderQty));
  }, [product.minOrderQty]);

  const price = discountedPrice(product.wholesalePrice, product.discountPercent);
  const tiers = [
    { min: product.minOrderQty, price },
    { min: 48, price: +(price * 0.96).toFixed(2) },
    { min: 240, price: +(price * 0.9).toFixed(2) },
  ];

  function handleAdd() {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="container-page py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-secondary/50">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/products?category=${product.category}`} className="capitalize hover:text-primary">
          {product.category.replace("-", " ")}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-secondary">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-card"
          >
            <Image
              src={product.images[activeImg]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {product.discountPercent > 0 && (
              <span className="chip absolute left-4 top-4 bg-primary text-white">
                -{product.discountPercent}% OFF
              </span>
            )}
          </motion.div>
          <div className="mt-4 flex gap-3">
            {product.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "relative h-20 w-20 overflow-hidden rounded-xl border-2 bg-white transition",
                  activeImg === i ? "border-primary" : "border-transparent",
                )}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold uppercase tracking-wide text-primary">{product.brand}</span>
            <span className="text-secondary/30">·</span>
            <span className="flex items-center gap-1 text-secondary/60">
              <BadgeCheck className="h-4 w-4 text-success" /> {product.supplier}
            </span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-bold text-secondary">{product.name}</h1>

          <div className="mt-3 flex items-center gap-4">
            <StarRating rating={product.rating} showValue count={product.reviewCount} />
            <span className="text-sm text-secondary/50">SKU {product.sku}</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-4xl font-extrabold text-secondary">{formatCurrency(price)}</span>
            {product.discountPercent > 0 && (
              <span className="mb-1 text-lg text-secondary/40 line-through">
                {formatCurrency(product.wholesalePrice)}
              </span>
            )}
            <span className="mb-1 text-sm text-secondary/50">/ unit · wholesale</span>
          </div>
          <p className="mt-1 text-sm text-secondary/50">
            Retail RRP {formatCurrency(product.retailPrice)} · {product.volume} · {product.packageSize}
          </p>

          {/* Bulk tiers */}
          <div className="mt-5 rounded-2xl border border-secondary/10 p-4">
            <p className="mb-2 text-sm font-semibold text-secondary">Bulk pricing tiers</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {tiers.map((t) => (
                <div key={t.min} className="rounded-xl bg-canvas py-2">
                  <p className="text-xs text-secondary/50">{t.min}+ units</p>
                  <p className="font-bold text-secondary">{formatCurrency(t.price)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="mt-5 flex items-center gap-2 text-sm">
            {product.inStock > 0 ? (
              <span className="flex items-center gap-1.5 font-semibold text-success">
                <span className="h-2 w-2 rounded-full bg-success" />
                In stock — {product.inStock.toLocaleString()} units
              </span>
            ) : (
              <span className="font-semibold text-primary">Out of stock</span>
            )}
          </div>

          {/* Quantity + actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-secondary/15">
              <button
                onClick={() => setQty((q) => Math.max(product.minOrderQty, q - 1))}
                className="grid h-11 w-11 place-items-center text-secondary hover:bg-canvas"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                value={qty}
                onChange={(e) => setQty(Math.max(product.minOrderQty, Number(e.target.value) || product.minOrderQty))}
                className="h-11 w-16 border-x border-secondary/15 text-center font-semibold text-secondary outline-none"
              />
              <button
                onClick={() => setQty((q) => Math.min(product.maxOrderQty, q + 1))}
                className="grid h-11 w-11 place-items-center text-secondary hover:bg-canvas"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button onClick={handleAdd} className="btn-primary flex-1 px-6 py-3 text-base sm:flex-none">
              {added ? <><Check className="h-5 w-5" /> Added</> : <><ShoppingCart className="h-5 w-5" /> Add to cart</>}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-secondary/15 hover:bg-canvas"
              aria-label="Wishlist"
            >
              <Heart className={cn("h-5 w-5", wished ? "fill-primary text-primary" : "text-secondary")} />
            </button>
          </div>
          <p className="mt-2 text-sm text-secondary/50">
            Minimum order {product.minOrderQty} units · Subtotal{" "}
            <span className="font-semibold text-secondary">{formatCurrency(price * qty)}</span>
          </p>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-secondary/10 pt-6">
            {[
              { icon: Truck, label: "Tracked delivery" },
              { icon: ShieldCheck, label: "Batch & expiry tracked" },
              { icon: RefreshCw, label: "Easy returns" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1 text-center">
                <b.icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-secondary/60">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="flex gap-1 overflow-x-auto border-b border-secondary/10">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "whitespace-nowrap px-5 py-3 text-sm font-semibold transition",
                tab === t ? "border-b-2 border-primary text-primary" : "text-secondary/50 hover:text-secondary",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === "Description" && (
            <div className="max-w-3xl space-y-4 text-secondary/80">
              <p>{product.description}</p>
              <p><span className="font-semibold text-secondary">Ingredients:</span> {product.ingredients}</p>
            </div>
          )}

          {tab === "Specifications" && (
            <div className="max-w-2xl">
              <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {[
                  ["Brand", product.brand], ["Supplier", product.supplier],
                  ["SKU", product.sku], ["Barcode", product.barcode],
                  ["Volume", product.volume], ["Package size", product.packageSize],
                  ["Weight", `${product.weightKg} kg`], ["Country of origin", product.countryOfOrigin],
                  ["Expiry date", product.expiryDate], ["Min order", `${product.minOrderQty} units`],
                  ["Max order", `${product.maxOrderQty} units`], ["In stock", product.inStock.toLocaleString()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-secondary/10 py-2.5 text-sm">
                    <dt className="text-secondary/50">{k}</dt>
                    <dd className="font-semibold text-secondary">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {tab === "Nutrition" && (
            <div className="max-w-md">
              <table className="w-full text-sm">
                <tbody>
                  {product.nutrition.map((n) => (
                    <tr key={n.label} className="border-b border-secondary/10">
                      <td className="py-2.5 text-secondary/60">{n.label}</td>
                      <td className="py-2.5 text-right font-semibold text-secondary">{n.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "Reviews" && (
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-display text-4xl font-bold text-secondary">{product.rating.toFixed(1)}</span>
                <div>
                  <StarRating rating={product.rating} />
                  <p className="text-sm text-secondary/50">{product.reviewCount} verified reviews</p>
                </div>
              </div>
              {product.reviews.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-secondary">{r.author}</span>
                      {r.verified && (
                        <span className="chip bg-success/10 text-success">
                          <Check className="mr-0.5 h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                  <p className="mt-2 font-semibold text-secondary">{r.title}</p>
                  <p className="mt-1 text-sm text-secondary/70">{r.body}</p>
                  <p className="mt-2 text-xs text-secondary/40">{r.date} · {r.helpful} found this helpful</p>
                </div>
              ))}
            </div>
          )}

          {tab === "Q&A" && (
            <div className="max-w-2xl space-y-4">
              {[
                ["Do you offer credit terms for approved retailers?", "Yes — approved trade accounts get credit limits with net payment terms. Apply from your dashboard."],
                ["Can I mix cases to reach a bulk tier?", "Bulk tiers apply per SKU, but combined order value unlocks free delivery over $250."],
              ].map(([q, a]) => (
                <div key={q} className="card p-5">
                  <p className="font-semibold text-secondary">Q: {q}</p>
                  <p className="mt-1 text-sm text-secondary/70">A: {a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Frequently bought together */}
      {frequentlyBought.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-2xl font-bold text-secondary">Frequently bought together</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {frequentlyBought.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 font-display text-2xl font-bold text-secondary">Related products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
