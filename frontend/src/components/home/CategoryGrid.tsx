"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { categories } from "@/data/categories";
import { SectionHeader } from "@/components/SectionHeader";

export function CategoryGrid() {
  return (
    <section className="container-page py-14">
      <SectionHeader eyebrow="Shop by category" title="Browse our range" href="/products" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((c, i) => (
          <motion.div
            key={c.slug}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
          >
            <Link
              href={`/products?category=${c.slug}`}
              className="card flex flex-col items-center gap-2 p-4 text-center hover:shadow-card-hover"
            >
              <span
                className="grid h-14 w-14 place-items-center rounded-2xl text-2xl"
                style={{ backgroundColor: `${c.color}1a` }}
              >
                {c.icon}
              </span>
              <span className="text-sm font-semibold text-secondary">{c.name}</span>
              <span className="text-xs text-secondary/40">{c.productCount} items</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
