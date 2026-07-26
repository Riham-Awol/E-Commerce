"use client";

import { motion } from "framer-motion";
import { Search, ShoppingCart, CreditCard, Truck } from "lucide-react";

const steps = [
  { icon: Search, title: "Browse & compare", text: "Search thousands of drinks with live stock and wholesale pricing." },
  { icon: ShoppingCart, title: "Order in bulk", text: "Add to cart, apply coupons and hit your bulk pricing tiers." },
  { icon: CreditCard, title: "Pay your way", text: "Card, Stripe, PayPal, bank transfer, mobile money or COD." },
  { icon: Truck, title: "Track delivery", text: "Follow every order from packed to delivered on a live timeline." },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-16">
      <div className="container-page">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Simple process</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-secondary">How it works</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-canvas">
                <s.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="absolute left-1/2 top-0 -translate-x-1/2 text-6xl font-black text-secondary/5">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-secondary">{s.title}</h3>
              <p className="mt-1 text-sm text-secondary/60">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
