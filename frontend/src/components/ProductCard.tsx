"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/store/cart";
import { cn, discountedPrice, formatCurrency } from "@/lib/utils";
import { StarRating } from "./StarRating";

const tagStyles: Record<string, string> = {
  bestseller: "bg-primary/10 text-primary",
  new: "bg-success/10 text-success",
  offer: "bg-accent/20 text-accent-dark",
  wholesale: "bg-secondary/10 text-secondary",
  imported: "bg-secondary/10 text-secondary",
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const add = useCart((s) => s.add);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const wished = useCart((s) => s.wishlist.includes(product.id));

  const price = discountedPrice(product.wholesalePrice, product.discountPercent);
  const hasDiscount = product.discountPercent > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className="card group flex flex-col overflow-hidden hover:shadow-card-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-canvas">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {hasDiscount && (
            <span className="chip bg-primary text-white">-{product.discountPercent}%</span>
          )}
          {product.tags.slice(0, 1).map((t) => (
            <span key={t} className={cn("chip capitalize", tagStyles[t])}>
              {t}
            </span>
          ))}
        </div>

        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-card backdrop-blur transition hover:scale-105"
        >
          <Heart className={cn("h-4 w-4", wished ? "fill-primary text-primary" : "text-secondary")} />
        </button>

        {product.inStock < 500 && (
          <span className="absolute bottom-3 left-3 chip bg-white/90 text-primary">
            Low stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-secondary/40">
          {product.brand}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 font-semibold leading-snug text-secondary hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="mt-2">
          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>

        <p className="mt-1 text-xs text-secondary/50">
          {product.volume} · {product.packageSize}
        </p>

        <div className="mt-auto pt-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-secondary/40">Wholesale / unit</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-secondary">{formatCurrency(price)}</span>
                {hasDiscount && (
                  <span className="text-xs text-secondary/40 line-through">
                    {formatCurrency(product.wholesalePrice)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => add(product)}
              aria-label="Add to cart"
              className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white transition hover:bg-primary-dark"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-secondary/40">
            Min order {product.minOrderQty} · {product.inStock.toLocaleString()} in stock
          </p>
        </div>
      </div>
    </motion.div>
  );
}
