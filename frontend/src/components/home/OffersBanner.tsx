"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(target);
  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0"));
}

export function OffersBanner() {
  const [h, m, s] = useCountdown(5 * 3600 + 42 * 60);
  return (
    <section className="container-page py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent p-8 text-white sm:p-10"
      >
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              <Zap className="h-4 w-4" /> Flash Sale
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
              Up to 22% off bulk crates
            </h2>
            <p className="mt-1 text-white/90">Buy-one-get-one on selected energy drinks — today only.</p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <div className="flex gap-2">
              {[["Hrs", h], ["Min", m], ["Sec", s]].map(([label, val]) => (
                <div key={label} className="grid h-16 w-16 place-items-center rounded-xl bg-white/20 backdrop-blur">
                  <span className="font-display text-2xl font-bold tabular-nums">{val}</span>
                  <span className="text-[10px] uppercase tracking-wide text-white/70">{label}</span>
                </div>
              ))}
            </div>
            <Link href="/products?tag=offer" className="btn bg-white text-primary hover:bg-white/90">
              Shop the sale
            </Link>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
      </motion.div>
    </section>
  );
}
