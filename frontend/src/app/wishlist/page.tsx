"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/store/cart";
import { ProductCard } from "@/components/ProductCard";

export default function WishlistPage() {
  const wishlistIds = useCart((s) => s.wishlist);
  const list = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-secondary">My wishlist</h1>
      {list.length === 0 ? (
        <div className="card grid place-items-center py-24 text-center">
          <Heart className="h-14 w-14 text-secondary/20" />
          <p className="mt-4 text-lg font-semibold text-secondary">Your wishlist is empty</p>
          <p className="mt-1 text-secondary/50">Tap the heart on any product to save it here.</p>
          <Link href="/products" className="btn-primary mt-6">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
