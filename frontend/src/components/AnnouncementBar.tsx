"use client";

import { Truck, ShieldCheck, Percent } from "lucide-react";

const items = [
  { icon: Truck, text: "Free delivery on wholesale orders over $250" },
  { icon: Percent, text: "Bulk pricing tiers on every product" },
  { icon: ShieldCheck, text: "Batch & expiry tracking on all beverages" },
  { icon: Truck, text: "Same-day dispatch in delivery zones" },
];

export function AnnouncementBar() {
  const loop = [...items, ...items];
  return (
    <div className="bg-secondary text-white">
      <div className="container-page flex items-center overflow-hidden py-2">
        <div className="flex min-w-full shrink-0 animate-marquee items-center gap-10 whitespace-nowrap">
          {loop.map((it, i) => (
            <span key={i} className="flex items-center gap-2 text-xs font-medium text-white/90">
              <it.icon className="h-3.5 w-3.5 text-accent" />
              {it.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
