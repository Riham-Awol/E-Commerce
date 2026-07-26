"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock, Route } from "lucide-react";

const zones = [
  { zone: "Zone A — Metro", eta: "Same day", fee: "Free over $250" },
  { zone: "Zone B — Suburban", eta: "1 day", fee: "$12.50" },
  { zone: "Zone C — Regional", eta: "2–3 days", fee: "Distance based" },
];

export function Coverage() {
  return (
    <section className="bg-secondary py-16 text-white">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Logistics</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Delivery coverage & routes</h2>
          <p className="mt-3 max-w-lg text-white/70">
            Delivery fees are calculated by zone and distance, with route
            optimisation for our drivers. Track every drop with live GPS, photo
            proof and captured signatures.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <span className="flex items-center gap-2"><Route className="h-4 w-4 text-accent" /> Optimised routes</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Live GPS tracking</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> Scheduled windows</span>
          </div>
          <Link href="/coverage" className="btn-primary mt-8">Check your zone</Link>
        </div>

        <div className="grid gap-3">
          {zones.map((z, i) => (
            <motion.div
              key={z.zone}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between rounded-2xl bg-white/10 p-5 backdrop-blur"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-secondary">
                  <MapPin className="h-5 w-5" />
                </span>
                <p className="font-semibold">{z.zone}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-accent">{z.eta}</p>
                <p className="text-white/60">{z.fee}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
