"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const columns = [
  {
    title: "Shop",
    links: [
      ["All Products", "/products"],
      ["Today's Offers", "/products?tag=offer"],
      ["Best Sellers", "/products?tag=bestseller"],
      ["Wholesale Deals", "/products?tag=wholesale"],
      ["Bulk Packages", "/products?category=bulk-packages"],
    ],
  },
  {
    title: "Business",
    links: [
      ["Become a Supplier", "/suppliers"],
      ["Sales Agents", "/how-it-works"],
      ["Credit Accounts", "/how-it-works"],
      ["Delivery Coverage", "/coverage"],
      ["Partner Program", "/how-it-works"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Help Center", "/contact"],
      ["Track Order", "/dashboard"],
      ["Returns & Refunds", "/contact"],
      ["Live Chat", "/contact"],
      ["FAQ", "/contact"],
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="mt-20 bg-secondary text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-6 py-10 md:flex-row">
          <div>
            <h3 className="font-display text-2xl font-bold">Stay in the loop</h3>
            <p className="mt-1 text-white/70">
              Get wholesale deals, flash sales and new-arrival alerts.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setDone(true);
            }}
            className="flex w-full max-w-md gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              className="input flex-1 text-secondary"
            />
            <button className="btn-primary shrink-0">
              {done ? "Subscribed ✓" : <>Subscribe <Send className="h-4 w-4" /></>}
            </button>
          </form>
        </div>
      </div>

      <div className="container-page grid grid-cols-2 gap-8 py-14 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg font-bold">
              B
            </span>
            <span className="font-display text-xl font-extrabold">
              Bev<span className="text-accent">Supply</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Wholesale beverage distribution connecting suppliers with retailers,
            restaurants, hotels and cafés — from cart to doorstep.
          </p>
          <div className="mt-5 space-y-2 text-sm text-white/70">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> 14 Harbor Distribution Park</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> +1 (800) 555-0142</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> orders@bevsupply.com</p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold">{col.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-accent">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/60 sm:flex-row">
          <p>© {new Date().getFullYear()} BevSupply. All rights reserved.</p>
          <div className="flex gap-5">
            <span>Stripe</span><span>PayPal</span><span>Bank Transfer</span>
            <span>Mobile Money</span><span>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
