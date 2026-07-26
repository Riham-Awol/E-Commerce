"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { StarRating } from "@/components/StarRating";

const testimonials = [
  { name: "Metro Foods Ltd", role: "Supermarket chain", rating: 5, text: "We restock 40+ SKUs weekly through BevSupply. Pricing tiers and reliable delivery cut our procurement time in half." },
  { name: "Harbor Café", role: "Café & roastery", rating: 5, text: "Cold brew and juices arrive fresh with clear expiry batches. Reordering past orders is a single click." },
  { name: "Sunrise Hotel", role: "Hospitality", rating: 4, text: "From minibar sodas to the wine list, one supplier, one invoice. The credit account is a game changer." },
];

export function Reviews() {
  return (
    <section className="container-page py-14">
      <SectionHeader eyebrow="What buyers say" title="Trusted by businesses" />
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="card flex flex-col p-6"
          >
            <Quote className="h-8 w-8 text-primary/20" />
            <p className="mt-3 flex-1 text-secondary/80">{t.text}</p>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-secondary">{t.name}</p>
                <p className="text-sm text-secondary/50">{t.role}</p>
              </div>
              <StarRating rating={t.rating} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
