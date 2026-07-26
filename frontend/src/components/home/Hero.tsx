"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PackageCheck, Store, Truck } from "lucide-react";

const stats = [
  { value: "12k+", label: "Products" },
  { value: "850+", label: "Business buyers" },
  { value: "60+", label: "Suppliers" },
  { value: "99.2%", label: "On-time delivery" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container-page relative grid gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col justify-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium"
          >
            <span className="h-2 w-2 rounded-full bg-success" />
            Wholesale beverage distribution, simplified
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl"
          >
            Every drink your <span className="text-accent">business</span> needs — delivered.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-xl text-lg text-white/80"
          >
            From soft drinks to fine wine, order in bulk from vetted suppliers.
            Live inventory, transparent wholesale pricing, batch tracking and
            same-day dispatch across our delivery network.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/products" className="btn-primary px-6 py-3 text-base">
              Browse products <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/register" className="btn px-6 py-3 text-base bg-white/10 text-white hover:bg-white/20">
              Open a trade account
            </Link>
          </motion.div>

          <div className="mt-10 grid grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-bold text-accent sm:text-3xl">{s.value}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative hidden items-center justify-center lg:flex"
        >
          <div className="grid w-full max-w-md gap-4">
            {[
              { icon: Store, title: "Retail & HORECA", text: "Supermarkets, restaurants, hotels, bars & cafés." },
              { icon: PackageCheck, title: "Bulk pricing tiers", text: "The more you order, the better the unit price." },
              { icon: Truck, title: "Tracked delivery", text: "Live GPS, proof of delivery & signatures." },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-secondary">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-sm text-white/70">{c.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
