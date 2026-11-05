"use client";

import { useQuery } from "@tanstack/react-query";
import { products as localProducts } from "@/data/products";
import type { CategorySlug, Product } from "@/types";
import { api, apiEnabled } from "@/lib/api";

/** Product row as returned by GET /api/products. */
interface ApiProduct {
  id: number;
  slug: string;
  name: string;
  brand: string | null;
  sku: string;
  barcode: string | null;
  description: string | null;
  ingredients: string | null;
  volume: string | null;
  package_size: string | null;
  weight_kg: number | null;
  country_of_origin: string | null;
  expiry_date: string | null;
  retail_price: number;
  wholesale_price: number;
  discount_percent: number;
  currency: string;
  stock: number;
  min_order_qty: number;
  max_order_qty: number;
  rating: number;
  review_count: number;
  featured: number;
  tags: string | null;
  category_slug: string | null;
  supplier_name: string | null;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80";

/**
 * Live data (price, discount, stock, order limits) comes from the API; rich
 * content the API doesn't store (gallery, nutrition, reviews) is kept from the
 * built-in catalogue when the product exists there.
 */
function merge(row: ApiProduct, local?: Product): Product {
  const live = {
    retailPrice: Number(row.retail_price),
    wholesalePrice: Number(row.wholesale_price),
    discountPercent: Number(row.discount_percent),
    inStock: Number(row.stock),
    minOrderQty: Number(row.min_order_qty),
    maxOrderQty: Number(row.max_order_qty),
  };
  if (local) return { ...local, ...live };

  return {
    id: `api-${row.id}`,
    slug: row.slug,
    name: row.name,
    brand: row.brand ?? "",
    supplier: row.supplier_name ?? "",
    category: (row.category_slug ?? "local-drinks") as CategorySlug,
    images: [FALLBACK_IMAGE],
    sku: row.sku,
    barcode: row.barcode ?? "",
    description: row.description ?? "",
    ingredients: row.ingredients ?? "See packaging for full ingredient and allergen information.",
    nutrition: [],
    volume: row.volume ?? "",
    packageSize: row.package_size ?? "",
    weightKg: Number(row.weight_kg ?? 0),
    countryOfOrigin: row.country_of_origin ?? "",
    expiryDate: row.expiry_date ?? "",
    currency: row.currency,
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    reviews: [],
    tags: (row.tags ? row.tags.split(",") : []) as Product["tags"],
    featured: Boolean(row.featured),
    ...live,
  };
}

async function fetchCatalogue(): Promise<Product[]> {
  const res = await api.get<{ data: ApiProduct[] }>("/products?limit=60");
  const bySlug = new Map(localProducts.map((p) => [p.slug, p]));
  return res.data.map((row) => merge(row, bySlug.get(row.slug)));
}

/**
 * The product catalogue: live from the API when it is configured and
 * reachable, otherwise the built-in data. Always returns a usable list.
 */
export function useCatalogue(): { products: Product[]; live: boolean } {
  const { data } = useQuery({
    queryKey: ["catalogue"],
    queryFn: fetchCatalogue,
    enabled: apiEnabled,
  });
  return data && data.length ? { products: data, live: true } : { products: localProducts, live: false };
}

/** A single product, overlaid with live price/stock when available. */
export function useLiveProduct(product: Product): Product {
  const { products } = useCatalogue();
  return products.find((p) => p.slug === product.slug) ?? product;
}
