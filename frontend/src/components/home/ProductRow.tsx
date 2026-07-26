import type { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";

export function ProductRow({
  eyebrow,
  title,
  href,
  products,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  products: Product[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="container-page py-8">
      <SectionHeader eyebrow={eyebrow} title={title} href={href} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 8).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
