"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { StarRating } from "@/components/StarRating";

const suppliers = [
  { name: "Atlas Wholesale", category: "Soft & bulk drinks", rating: 4.8, products: 320, since: 2012 },
  { name: "Nova Beverages", category: "Energy & sports", rating: 4.7, products: 145, since: 2015 },
  { name: "Highland Springs", category: "Water & mineral", rating: 4.9, products: 88, since: 2009 },
  { name: "Vintage Cellars", category: "Wine & spirits", rating: 4.9, products: 210, since: 2004 },
  { name: "Brewers Union", category: "Beer & craft", rating: 4.6, products: 176, since: 2011 },
  { name: "Orchard Direct", category: "Juice & dairy", rating: 4.5, products: 132, since: 2016 },
];

export function Suppliers() {
  return (
    <section className="container-page py-10">
      <SectionHeader eyebrow="Sourcing" title="Featured suppliers" href="/suppliers" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
          >
            <Link href="/suppliers" className="card flex items-center gap-4 p-5 hover:shadow-card-hover">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-secondary text-lg font-bold text-white">
                {s.name.split(" ").map((w) => w[0]).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-semibold text-secondary">
                  {s.name} <BadgeCheck className="h-4 w-4 text-success" />
                </p>
                <p className="text-sm text-secondary/50">{s.category}</p>
                <div className="mt-1 flex items-center gap-3">
                  <StarRating rating={s.rating} showValue />
                  <span className="text-xs text-secondary/40">{s.products} products</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
