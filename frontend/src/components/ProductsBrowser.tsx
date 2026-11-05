"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useCatalogue } from "@/lib/catalogue";
import { categories, categoryMap } from "@/data/categories";
import { ProductCard } from "@/components/ProductCard";
import { cn, discountedPrice } from "@/lib/utils";
import type { Product } from "@/types";

type Sort = "relevance" | "price-asc" | "price-desc" | "rating" | "newest";

export function ProductsBrowser() {
  const params = useSearchParams();
  const { products } = useCatalogue();
  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand).filter(Boolean))), [products]);
  const suppliers = useMemo(() => Array.from(new Set(products.map((p) => p.supplier).filter(Boolean))), [products]);
  const q = params.get("q")?.toLowerCase() ?? "";
  const initialCategory = params.get("category") ?? "";
  const initialTag = params.get("tag") ?? "";

  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState<string[]>([]);
  const [supplier, setSupplier] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(initialTag === "offer");
  const [sort, setSort] = useState<Sort>("relevance");
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.brand} ${p.supplier} ${p.barcode} ${p.countryOfOrigin} ${p.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (category && p.category !== category) return false;
      if (initialTag && !p.tags.includes(initialTag as Product["tags"][number])) return false;
      if (brand.length && !brand.includes(p.brand)) return false;
      if (supplier.length && !supplier.includes(p.supplier)) return false;
      if (discountedPrice(p.wholesalePrice, p.discountPercent) > maxPrice) return false;
      if (p.rating < minRating) return false;
      if (inStockOnly && p.inStock <= 0) return false;
      if (discountOnly && p.discountPercent <= 0) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return discountedPrice(a.wholesalePrice, a.discountPercent) - discountedPrice(b.wholesalePrice, b.discountPercent);
        case "price-desc":
          return discountedPrice(b.wholesalePrice, b.discountPercent) - discountedPrice(a.wholesalePrice, a.discountPercent);
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return (b.tags.includes("new") ? 1 : 0) - (a.tags.includes("new") ? 1 : 0);
        default:
          return 0;
      }
    });
    return list;
  }, [products, q, category, initialTag, brand, supplier, maxPrice, minRating, inStockOnly, discountOnly, sort]);

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const title = q
    ? `Results for “${q}”`
    : category
      ? categoryMap[category as keyof typeof categoryMap]?.name ?? "Products"
      : initialTag
        ? `${initialTag[0].toUpperCase()}${initialTag.slice(1)}`
        : "All Products";

  const Filters = (
    <div className="space-y-6">
      <FilterBlock label="Category">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </FilterBlock>

      <FilterBlock label={`Max price · $${maxPrice}`}>
        <input
          type="range" min={1} max={50} value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </FilterBlock>

      <FilterBlock label="Brand">
        <div className="max-h-40 space-y-1.5 overflow-auto pr-1">
          {brands.map((b) => (
            <Check key={b} label={b} checked={brand.includes(b)} onChange={() => toggle(brand, b, setBrand)} />
          ))}
        </div>
      </FilterBlock>

      <FilterBlock label="Supplier">
        <div className="space-y-1.5">
          {suppliers.map((s) => (
            <Check key={s} label={s} checked={supplier.includes(s)} onChange={() => toggle(supplier, s, setSupplier)} />
          ))}
        </div>
      </FilterBlock>

      <FilterBlock label="Rating">
        <div className="space-y-1.5">
          {[4, 3, 0].map((r) => (
            <Check
              key={r}
              label={r === 0 ? "All ratings" : `${r}★ & up`}
              checked={minRating === r}
              onChange={() => setMinRating(r)}
              radio
            />
          ))}
        </div>
      </FilterBlock>

      <FilterBlock label="Availability">
        <Check label="In stock only" checked={inStockOnly} onChange={() => setInStockOnly((v) => !v)} />
        <Check label="Discounted only" checked={discountOnly} onChange={() => setDiscountOnly((v) => !v)} />
      </FilterBlock>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-secondary">{title}</h1>
          <p className="mt-1 text-sm text-secondary/50">{filtered.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFilters(true)}
            className="btn-outline lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input w-auto">
            <option value="relevance">Sort: Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 card p-5">{Filters}</div>
        </aside>

        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="card grid place-items-center py-24 text-center">
              <p className="text-lg font-semibold text-secondary">No products match your filters</p>
              <p className="mt-1 text-sm text-secondary/50">Try widening the price range or clearing brands.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-secondary/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 overflow-auto bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-secondary">Filters</h3>
              <button onClick={() => setMobileFilters(false)}><X className="h-5 w-5" /></button>
            </div>
            {Filters}
            <button onClick={() => setMobileFilters(false)} className="btn-primary mt-6 w-full">
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-secondary">{label}</p>
      {children}
    </div>
  );
}

function Check({
  label, checked, onChange, radio,
}: { label: string; checked: boolean; onChange: () => void; radio?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-secondary/70">
      <span
        onClick={onChange}
        className={cn(
          "grid h-4 w-4 place-items-center border transition",
          radio ? "rounded-full" : "rounded",
          checked ? "border-primary bg-primary" : "border-secondary/30 bg-white",
        )}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-sm bg-white" />}
      </span>
      <span onClick={onChange}>{label}</span>
    </label>
  );
}
