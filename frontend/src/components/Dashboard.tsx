"use client";

import Link from "next/link";
import { useState } from "react";
import {
  User, Package, FileText, Heart, Ticket, Star, Bell, LifeBuoy,
  MapPin, Settings, Gift, Download, RefreshCw, LogOut,
} from "lucide-react";
import { demoOrders } from "@/data/orders";
import { products } from "@/data/products";
import { useCart } from "@/store/cart";
import { cn, formatCurrency } from "@/lib/utils";
import { OrderTimeline } from "@/components/OrderTimeline";
import { ProductCard } from "@/components/ProductCard";

const nav = [
  { id: "overview", label: "Overview", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "rewards", label: "Reward points", icon: Gift },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const statusLabels: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", packed: "Packed",
  ready_for_dispatch: "Ready", out_for_delivery: "Out for delivery",
  delivered: "Delivered", cancelled: "Cancelled", returned: "Returned", refunded: "Refunded",
};

export function Dashboard() {
  const [tab, setTab] = useState<(typeof nav)[number]["id"]>("overview");
  const wishlistIds = useCart((s) => s.wishlist);
  const add = useCart((s) => s.add);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const stats = [
    { label: "Total orders", value: "38", icon: Package },
    { label: "Reward points", value: "2,140", icon: Gift },
    { label: "Active coupons", value: "3", icon: Ticket },
    { label: "Lifetime spend", value: "$14.2k", icon: FileText },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold text-secondary">My account</h1>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside>
          <div className="card p-4">
            <div className="mb-4 flex items-center gap-3 border-b border-secondary/10 pb-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-lg font-bold text-white">M</span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-secondary">Metro Foods Ltd</p>
                <p className="truncate text-xs text-secondary/50">Gold member</p>
              </div>
            </div>
            <nav className="space-y-0.5">
              {nav.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setTab(n.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    tab === n.id ? "bg-primary/10 text-primary" : "text-secondary/70 hover:bg-canvas",
                  )}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </button>
              ))}
              <Link href="/login" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-secondary/70 hover:bg-canvas">
                <LogOut className="h-4 w-4" /> Sign out
              </Link>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="card p-5">
                    <s.icon className="h-6 w-6 text-primary" />
                    <p className="mt-3 font-display text-2xl font-bold text-secondary">{s.value}</p>
                    <p className="text-sm text-secondary/50">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="card p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-secondary">Active order tracking</h2>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold text-secondary">{demoOrders[0].reference}</p>
                  <span className="chip bg-accent/20 text-accent-dark">{statusLabels[demoOrders[0].status]}</span>
                </div>
                <OrderTimeline status={demoOrders[0].status} />
                <p className="mt-4 text-sm text-secondary/60">Estimated delivery: <span className="font-semibold text-secondary">{demoOrders[0].estimatedDelivery}</span></p>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="space-y-4">
              {demoOrders.map((o) => (
                <div key={o.id} className="card p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-secondary">{o.reference}</p>
                      <p className="text-sm text-secondary/50">{o.date} · {o.paymentMethod}</p>
                    </div>
                    <span className={cn("chip", o.status === "delivered" ? "bg-success/10 text-success" : "bg-accent/20 text-accent-dark")}>
                      {statusLabels[o.status]}
                    </span>
                  </div>
                  <OrderTimeline status={o.status} />
                  <div className="mt-4 space-y-1 border-t border-secondary/10 pt-4 text-sm">
                    {o.items.map((it) => (
                      <div key={it.name} className="flex justify-between text-secondary/70">
                        <span>{it.qty} × {it.name}</span>
                        <span>{formatCurrency(it.qty * it.price)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 font-semibold text-secondary">
                      <span>Total</span><span>{formatCurrency(o.total)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="btn-outline"><RefreshCw className="h-4 w-4" /> Reorder</button>
                    <button className="btn-ghost"><Download className="h-4 w-4" /> Invoice</button>
                    <button className="btn-ghost">Leave review</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "invoices" && (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-canvas text-left text-secondary/60">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Invoice</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {demoOrders.map((o) => (
                    <tr key={o.id} className="border-t border-secondary/10">
                      <td className="px-5 py-3 font-semibold text-secondary">INV-{o.reference.slice(4)}</td>
                      <td className="px-5 py-3 text-secondary/60">{o.date}</td>
                      <td className="px-5 py-3 font-semibold text-secondary">{formatCurrency(o.total)}</td>
                      <td className="px-5 py-3"><span className="chip bg-success/10 text-success">Paid</span></td>
                      <td className="px-5 py-3 text-right">
                        <button className="btn-ghost"><Download className="h-4 w-4" /> PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "wishlist" && (
            wishlistProducts.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {wishlistProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            ) : <Empty icon={Heart} text="Your wishlist is empty." />
          )}

          {tab === "addresses" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Primary — Store", addr: "14 Market Street, Harbor City, 10234" },
                { label: "Warehouse", addr: "Unit 8, Dockside Estate, Harbor City" },
              ].map((a) => (
                <div key={a.label} className="card p-5">
                  <p className="font-semibold text-secondary">{a.label}</p>
                  <p className="mt-1 text-sm text-secondary/60">{a.addr}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="btn-ghost text-sm">Edit</button>
                    <button className="btn-ghost text-sm">Remove</button>
                  </div>
                </div>
              ))}
              <button className="card grid min-h-[120px] place-items-center border-2 border-dashed border-secondary/15 text-sm font-semibold text-secondary/50 hover:border-primary hover:text-primary">
                + Add new address
              </button>
            </div>
          )}

          {tab === "coupons" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[["BEV10", "10% off any order"], ["WHOLESALE15", "15% off wholesale"], ["WELCOME5", "5% welcome bonus"]].map(([code, desc]) => (
                <div key={code} className="card flex items-center justify-between border-l-4 border-primary p-5">
                  <div>
                    <p className="font-display text-lg font-bold text-secondary">{code}</p>
                    <p className="text-sm text-secondary/60">{desc}</p>
                  </div>
                  <Ticket className="h-8 w-8 text-primary/30" />
                </div>
              ))}
            </div>
          )}

          {tab === "rewards" && (
            <div className="card p-8 text-center">
              <Gift className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-4 font-display text-4xl font-extrabold text-secondary">2,140</p>
              <p className="text-secondary/50">reward points · Gold tier</p>
              <div className="mx-auto mt-6 h-2 max-w-sm overflow-hidden rounded-full bg-secondary/10">
                <div className="h-full w-3/4 rounded-full bg-primary" />
              </div>
              <p className="mt-2 text-sm text-secondary/50">860 points to Platinum</p>
            </div>
          )}

          {tab === "reviews" && <Empty icon={Star} text="You haven't written any reviews yet." />}
          {tab === "notifications" && (
            <div className="card divide-y divide-secondary/10">
              {["Order BVS-482910 is out for delivery", "Flash sale: 22% off bulk crates today", "Invoice INV-482755 is ready to download"].map((n) => (
                <div key={n} className="flex items-center gap-3 p-4 text-sm text-secondary/70">
                  <Bell className="h-4 w-4 text-primary" /> {n}
                </div>
              ))}
            </div>
          )}
          {tab === "support" && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-secondary">Support tickets</h2>
              <p className="mt-1 text-sm text-secondary/50">Open a ticket, start live chat or request a call back.</p>
              <div className="mt-4 flex gap-2">
                <button className="btn-primary">New ticket</button>
                <button className="btn-outline">Live chat</button>
              </div>
            </div>
          )}
          {tab === "settings" && (
            <div className="card p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-secondary">Account settings</h2>
              <div className="space-y-3">
                {["Two-factor authentication", "Email notifications", "SMS notifications", "Push notifications"].map((s) => (
                  <label key={s} className="flex items-center justify-between text-sm text-secondary/70">
                    {s}
                    <input type="checkbox" defaultChecked className="h-5 w-9 accent-primary" />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="card grid place-items-center py-20 text-center">
      <Icon className="h-12 w-12 text-secondary/20" />
      <p className="mt-3 text-secondary/50">{text}</p>
    </div>
  );
}
