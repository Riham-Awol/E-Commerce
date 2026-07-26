"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";
import { discountedPrice } from "@/lib/utils";

interface Line {
  product: Product;
  quantity: number;
  savedForLater: boolean;
}

interface CartState {
  items: Line[];
  wishlist: string[];
  coupon: string | null;
  add: (product: Product, quantity?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, quantity: number) => void;
  saveForLater: (id: string, saved: boolean) => void;
  clear: () => void;
  toggleWishlist: (id: string) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
}

export const COUPONS: Record<string, number> = {
  BEV10: 10,
  WHOLESALE15: 15,
  WELCOME5: 5,
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      wishlist: [],
      coupon: null,
      add: (product, quantity = product.minOrderQty || 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity, savedForLater: false }
                  : i,
              ),
            };
          }
          return { items: [...s.items, { product, quantity, savedForLater: false }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.product.id !== id) })),
      setQty: (id, quantity) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.product.id === id ? { ...i, quantity: Math.max(1, quantity) } : i,
          ),
        })),
      saveForLater: (id, saved) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.product.id === id ? { ...i, savedForLater: saved } : i,
          ),
        })),
      clear: () => set({ items: [], coupon: null }),
      toggleWishlist: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((w) => w !== id)
            : [...s.wishlist, id],
        })),
      applyCoupon: (code) =>
        set(() => ({ coupon: COUPONS[code.toUpperCase()] ? code.toUpperCase() : null })),
      removeCoupon: () => set({ coupon: null }),
    }),
    { name: "bevsupply-cart" },
  ),
);

export function cartTotals(items: Line[], couponCode: string | null) {
  const active = items.filter((i) => !i.savedForLater);
  const subtotal = active.reduce(
    (sum, i) =>
      sum + discountedPrice(i.product.wholesalePrice, i.product.discountPercent) * i.quantity,
    0,
  );
  const couponPct = couponCode ? COUPONS[couponCode] ?? 0 : 0;
  const couponAmount = +(subtotal * (couponPct / 100)).toFixed(2);
  const afterCoupon = subtotal - couponAmount;
  const tax = +(afterCoupon * 0.08).toFixed(2);
  const deliveryFee = afterCoupon > 250 || afterCoupon === 0 ? 0 : 12.5;
  const total = +(afterCoupon + tax + deliveryFee).toFixed(2);
  const itemCount = active.reduce((n, i) => n + i.quantity, 0);
  return { subtotal, couponAmount, couponPct, tax, deliveryFee, total, itemCount };
}
