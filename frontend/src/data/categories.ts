import type { Category } from "@/types";

export const categories: Category[] = [
  { slug: "soft-drinks", name: "Soft Drinks", icon: "🥤", color: "#E63946", productCount: 128 },
  { slug: "energy-drinks", name: "Energy Drinks", icon: "⚡", color: "#F4A261", productCount: 64 },
  { slug: "water", name: "Water", icon: "💧", color: "#2A9D8F", productCount: 42 },
  { slug: "juice", name: "Juice", icon: "🧃", color: "#F4A261", productCount: 96 },
  { slug: "milk", name: "Milk", icon: "🥛", color: "#1D3557", productCount: 38 },
  { slug: "coffee", name: "Coffee", icon: "☕", color: "#6F4E37", productCount: 71 },
  { slug: "tea", name: "Tea", icon: "🍵", color: "#2A9D8F", productCount: 55 },
  { slug: "beer", name: "Beer", icon: "🍺", color: "#F4A261", productCount: 89 },
  { slug: "wine", name: "Wine", icon: "🍷", color: "#722F37", productCount: 112 },
  { slug: "spirits", name: "Spirits", icon: "🥃", color: "#1D3557", productCount: 77 },
  { slug: "health-drinks", name: "Health Drinks", icon: "🌿", color: "#2A9D8F", productCount: 33 },
  { slug: "sports-drinks", name: "Sports Drinks", icon: "🏃", color: "#E63946", productCount: 29 },
  { slug: "imported-drinks", name: "Imported Drinks", icon: "🌍", color: "#1D3557", productCount: 61 },
  { slug: "local-drinks", name: "Local Drinks", icon: "🏠", color: "#F4A261", productCount: 48 },
  { slug: "bulk-packages", name: "Bulk Packages", icon: "📦", color: "#6F4E37", productCount: 24 },
  { slug: "accessories", name: "Accessories", icon: "🧊", color: "#2A9D8F", productCount: 19 },
];

export const categoryMap = Object.fromEntries(
  categories.map((c) => [c.slug, c]),
) as Record<Category["slug"], Category>;
