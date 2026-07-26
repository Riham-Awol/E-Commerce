"use client";

import { brands } from "@/data/products";
import { SectionHeader } from "@/components/SectionHeader";

export function Brands() {
  const loop = [...brands, ...brands, ...brands];
  return (
    <section className="container-page py-8">
      <SectionHeader eyebrow="Trusted names" title="Popular brands" />
      <div className="overflow-hidden rounded-2xl bg-white py-6 shadow-card">
        <div className="flex animate-marquee items-center gap-14 whitespace-nowrap px-8">
          {loop.map((b, i) => (
            <span
              key={`${b}-${i}`}
              className="font-display text-xl font-bold text-secondary/40 transition hover:text-primary"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
