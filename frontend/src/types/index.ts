export type Role =
  | "guest"
  | "customer"
  | "sales_agent"
  | "warehouse_manager"
  | "delivery_driver"
  | "supplier"
  | "finance"
  | "super_admin";

export type CategorySlug =
  | "soft-drinks"
  | "energy-drinks"
  | "water"
  | "juice"
  | "milk"
  | "coffee"
  | "tea"
  | "beer"
  | "wine"
  | "spirits"
  | "health-drinks"
  | "sports-drinks"
  | "imported-drinks"
  | "local-drinks"
  | "bulk-packages"
  | "accessories";

export interface Category {
  slug: CategorySlug;
  name: string;
  icon: string;
  color: string;
  productCount: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  supplier: string;
  category: CategorySlug;
  images: string[];
  sku: string;
  barcode: string;
  description: string;
  ingredients: string;
  nutrition: { label: string; value: string }[];
  volume: string;
  packageSize: string;
  weightKg: number;
  countryOfOrigin: string;
  expiryDate: string;
  retailPrice: number;
  wholesalePrice: number;
  discountPercent: number;
  currency: string;
  inStock: number;
  minOrderQty: number;
  maxOrderQty: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  tags: ("bestseller" | "new" | "offer" | "wholesale" | "imported")[];
  featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  savedForLater?: boolean;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "ready_for_dispatch"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export interface Order {
  id: string;
  reference: string;
  date: string;
  status: OrderStatus;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
  estimatedDelivery: string;
}
