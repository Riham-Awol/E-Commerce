/**
 * The product catalogue loaded by `npm run seed`.
 * Kept identical to the storefront's built-in data (frontend/src/data/products.ts)
 * so slugs, SKUs, images and prices match between the website and the API.
 */
export interface CatalogueItem {
  name: string;
  brand: string;
  supplier: string;
  category: string;
  image: string;
  retail: number;
  wholesale: number;
  discount: number;
  volume: string;
  pack: string;
  weight: number;
  origin: string;
  stock: number;
  rating: number;
  tags: string[];
  featured?: boolean;
  ingredients?: string;
}

export const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const imageUrl = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const catalogue: CatalogueItem[] = [
  { name: "Classic Cola 330ml Can", brand: "FizzCo", supplier: "Atlas Wholesale", category: "soft-drinks", image: "photo-1622483767028-3f66f32aef97", retail: 0.9, wholesale: 0.55, discount: 10, volume: "330ml", pack: "24-pack", weight: 8.6, origin: "USA", stock: 4200, rating: 4.7, tags: ["bestseller", "offer"], featured: true, ingredients: "Carbonated water, sugar, caramel color, phosphoric acid, natural flavors, caffeine." },
  { name: "Zero Sugar Cola 330ml", brand: "FizzCo", supplier: "Atlas Wholesale", category: "soft-drinks", image: "photo-1554866585-cd94860890b7", retail: 0.95, wholesale: 0.58, discount: 0, volume: "330ml", pack: "24-pack", weight: 8.6, origin: "USA", stock: 3100, rating: 4.5, tags: ["bestseller"] },
  { name: "Thunder Energy 250ml", brand: "Voltage", supplier: "Nova Beverages", category: "energy-drinks", image: "photo-1622543925917-763c34d1a86e", retail: 1.8, wholesale: 1.1, discount: 15, volume: "250ml", pack: "24-pack", weight: 7.2, origin: "Austria", stock: 2600, rating: 4.6, tags: ["bestseller", "offer", "imported"], featured: true, ingredients: "Water, sucrose, glucose, citric acid, taurine, caffeine, B-vitamins." },
  { name: "Alpine Spring Water 500ml", brand: "PureAlp", supplier: "Highland Springs", category: "water", image: "photo-1523362628745-0c100150b504", retail: 0.6, wholesale: 0.32, discount: 0, volume: "500ml", pack: "24-pack", weight: 12.4, origin: "Switzerland", stock: 8800, rating: 4.8, tags: ["bestseller", "wholesale"], featured: true },
  { name: "Orange Sunrise Juice 1L", brand: "GrovePress", supplier: "Orchard Direct", category: "juice", image: "photo-1600271886742-f049cd451bba", retail: 2.4, wholesale: 1.5, discount: 20, volume: "1L", pack: "12-pack", weight: 13.0, origin: "Spain", stock: 1900, rating: 4.4, tags: ["offer", "new"], featured: true, ingredients: "100% pressed orange juice, no added sugar." },
  { name: "Whole Milk 1L UHT", brand: "DairyGold", supplier: "Meadow Farms", category: "milk", image: "photo-1550583724-b2692b85b150", retail: 1.2, wholesale: 0.78, discount: 0, volume: "1L", pack: "12-pack", weight: 12.5, origin: "Ireland", stock: 2400, rating: 4.5, tags: ["wholesale"] },
  { name: "Dark Roast Cold Brew 300ml", brand: "Nightshift", supplier: "Bean & Barrel", category: "coffee", image: "photo-1461023058943-07fcbe16d735", retail: 2.9, wholesale: 1.9, discount: 10, volume: "300ml", pack: "12-pack", weight: 4.2, origin: "Colombia", stock: 1400, rating: 4.7, tags: ["new", "bestseller"], featured: true, ingredients: "Filtered water, cold-brewed arabica coffee." },
  { name: "Green Tea Infusion 500ml", brand: "LeafLite", supplier: "Orient Trading", category: "tea", image: "photo-1556679343-c7306c1976bc", retail: 1.5, wholesale: 0.95, discount: 0, volume: "500ml", pack: "24-pack", weight: 13.5, origin: "Japan", stock: 2100, rating: 4.3, tags: ["imported"] },
  { name: "Golden Lager 330ml", brand: "Hopyard", supplier: "Brewers Union", category: "beer", image: "photo-1608270586620-248524c67de9", retail: 1.4, wholesale: 0.9, discount: 12, volume: "330ml", pack: "24-pack", weight: 9.1, origin: "Germany", stock: 3600, rating: 4.6, tags: ["offer", "imported"], featured: true, ingredients: "Water, malted barley, hops, yeast. Contains gluten. 4.8% ABV." },
  { name: "Reserve Red Wine 750ml", brand: "Vallefino", supplier: "Vintage Cellars", category: "wine", image: "photo-1510812431401-41d2bd2722f3", retail: 8.5, wholesale: 5.8, discount: 0, volume: "750ml", pack: "6-pack", weight: 7.8, origin: "Italy", stock: 640, rating: 4.8, tags: ["imported", "wholesale"], featured: true },
  { name: "Highland Malt Whisky 700ml", brand: "GlenOra", supplier: "Vintage Cellars", category: "spirits", image: "photo-1569529465841-dfecdab7503b", retail: 24.0, wholesale: 18.5, discount: 5, volume: "700ml", pack: "6-pack", weight: 6.4, origin: "Scotland", stock: 320, rating: 4.9, tags: ["imported"] },
  { name: "Aloe Wellness Drink 400ml", brand: "VitaLeaf", supplier: "Nova Beverages", category: "health-drinks", image: "photo-1625772299848-391b6a87d7b3", retail: 1.9, wholesale: 1.2, discount: 0, volume: "400ml", pack: "12-pack", weight: 5.4, origin: "South Korea", stock: 980, rating: 4.2, tags: ["new", "imported"] },
  { name: "Isotonic Sports Blue 500ml", brand: "Kinetix", supplier: "Nova Beverages", category: "sports-drinks", image: "photo-1596803244897-4e3f4b6f4f4c", retail: 1.3, wholesale: 0.82, discount: 18, volume: "500ml", pack: "24-pack", weight: 13.2, origin: "USA", stock: 2700, rating: 4.4, tags: ["offer", "bestseller"] },
  { name: "Sparkling Grape 275ml", brand: "GrovePress", supplier: "Orchard Direct", category: "soft-drinks", image: "photo-1625740822008-4a5f1c1f1c2f", retail: 1.1, wholesale: 0.7, discount: 0, volume: "275ml", pack: "24-pack", weight: 8.0, origin: "France", stock: 1500, rating: 4.3, tags: ["imported"] },
  { name: "Craft IPA 440ml", brand: "Hopyard", supplier: "Brewers Union", category: "beer", image: "photo-1584225064785-c62a8b43d148", retail: 2.2, wholesale: 1.5, discount: 0, volume: "440ml", pack: "12-pack", weight: 6.0, origin: "UK", stock: 1100, rating: 4.7, tags: ["new"] },
  { name: "Mixed Beverage Party Crate", brand: "BevSupply", supplier: "Atlas Wholesale", category: "bulk-packages", image: "photo-1607622750671-6cd9a99eabd1", retail: 39.0, wholesale: 29.0, discount: 22, volume: "Assorted", pack: "48-unit crate", weight: 22.0, origin: "Mixed", stock: 210, rating: 4.6, tags: ["offer", "wholesale", "bestseller"], featured: true },
];
