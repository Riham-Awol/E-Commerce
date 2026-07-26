"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2, Tag, ShoppingBag, ArrowRight, Clock } from "lucide-react";
import { useCart, cartTotals, COUPONS } from "@/store/cart";
import { discountedPrice, formatCurrency } from "@/lib/utils";

export function CartView() {
  const { items, setQty, remove, saveForLater, coupon, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const active = items.filter((i) => !i.savedForLater);
  const saved = items.filter((i) => i.savedForLater);
  const totals = cartTotals(items, coupon);

  function handleCoupon() {
    if (COUPONS[code.toUpperCase()]) {
      applyCoupon(code);
      setError("");
    } else {
      setError("Invalid coupon code");
    }
  }

  if (items.length === 0) {
    return (
      <div className="card grid place-items-center py-24 text-center">
        <ShoppingBag className="h-14 w-14 text-secondary/20" />
        <h1 className="mt-4 font-display text-2xl font-bold text-secondary">Your cart is empty</h1>
        <p className="mt-1 text-secondary/50">Browse the catalogue and add some drinks.</p>
        <Link href="/products" className="btn-primary mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold text-secondary">Shopping cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {active.map((line) => {
            const price = discountedPrice(line.product.wholesalePrice, line.product.discountPercent);
            return (
              <div key={line.product.id} className="card flex gap-4 p-4">
                <Link href={`/product/${line.product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-canvas">
                  <Image src={line.product.images[0]} alt={line.product.name} fill sizes="96px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase text-secondary/40">{line.product.brand}</p>
                      <Link href={`/product/${line.product.slug}`} className="font-semibold text-secondary hover:text-primary">
                        {line.product.name}
                      </Link>
                      <p className="text-sm text-secondary/50">{line.product.volume} · {line.product.packageSize}</p>
                    </div>
                    <p className="font-bold text-secondary">{formatCurrency(price * line.quantity)}</p>
                  </div>

                  <div className="mt-auto flex items-center gap-4 pt-2">
                    <div className="flex items-center rounded-lg border border-secondary/15">
                      <button onClick={() => setQty(line.product.id, line.quantity - 1)} className="grid h-8 w-8 place-items-center hover:bg-canvas">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{line.quantity}</span>
                      <button onClick={() => setQty(line.product.id, line.quantity + 1)} className="grid h-8 w-8 place-items-center hover:bg-canvas">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button onClick={() => saveForLater(line.product.id, true)} className="flex items-center gap-1 text-sm text-secondary/60 hover:text-primary">
                      <Clock className="h-4 w-4" /> Save for later
                    </button>
                    <button onClick={() => remove(line.product.id)} className="flex items-center gap-1 text-sm text-secondary/60 hover:text-primary">
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {saved.length > 0 && (
            <div className="pt-4">
              <h2 className="mb-3 font-semibold text-secondary">Saved for later ({saved.length})</h2>
              <div className="space-y-3">
                {saved.map((line) => (
                  <div key={line.product.id} className="card flex items-center gap-4 p-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-canvas">
                      <Image src={line.product.images[0]} alt={line.product.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-secondary">{line.product.name}</p>
                      <p className="text-sm text-secondary/50">{formatCurrency(discountedPrice(line.product.wholesalePrice, line.product.discountPercent))}</p>
                    </div>
                    <button onClick={() => saveForLater(line.product.id, false)} className="btn-outline">Move to cart</button>
                    <button onClick={() => remove(line.product.id)} className="text-secondary/50 hover:text-primary"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="sticky top-24 card p-6">
            <h2 className="font-display text-lg font-bold text-secondary">Order summary</h2>

            <div className="mt-4">
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
                  <span className="flex items-center gap-1.5 font-semibold"><Tag className="h-4 w-4" /> {coupon} applied</span>
                  <button onClick={removeCoupon} className="text-secondary/50 hover:text-primary">Remove</button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="input" />
                    <button onClick={handleCoupon} className="btn-secondary shrink-0">Apply</button>
                  </div>
                  {error && <p className="mt-1 text-xs text-primary">{error}</p>}
                  <p className="mt-1 text-xs text-secondary/40">Try BEV10, WHOLESALE15 or WELCOME5</p>
                </div>
              )}
            </div>

            <dl className="mt-5 space-y-2.5 text-sm">
              <Row label={`Subtotal (${totals.itemCount} items)`} value={formatCurrency(totals.subtotal)} />
              {totals.couponAmount > 0 && (
                <Row label={`Coupon (${totals.couponPct}%)`} value={`− ${formatCurrency(totals.couponAmount)}`} accent />
              )}
              <Row label="Estimated tax (8%)" value={formatCurrency(totals.tax)} />
              <Row label="Delivery fee" value={totals.deliveryFee === 0 ? "Free" : formatCurrency(totals.deliveryFee)} />
              <div className="border-t border-secondary/10 pt-3">
                <Row label="Total" value={formatCurrency(totals.total)} big />
              </div>
            </dl>

            <Link href="/checkout" className="btn-primary mt-5 w-full py-3">
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/products" className="btn-ghost mt-2 w-full">Continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, big, accent }: { label: string; value: string; big?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={big ? "font-bold text-secondary" : "text-secondary/60"}>{label}</dt>
      <dd className={big ? "font-display text-xl font-bold text-secondary" : accent ? "font-semibold text-success" : "font-semibold text-secondary"}>
        {value}
      </dd>
    </div>
  );
}
