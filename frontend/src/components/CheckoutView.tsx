"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Truck, Store, CreditCard, CheckCircle2, Wallet, Landmark,
  Banknote, Smartphone, Package,
} from "lucide-react";
import { useCart, cartTotals } from "@/store/cart";
import { discountedPrice, formatCurrency, cn } from "@/lib/utils";

const steps = ["Information", "Delivery", "Payment", "Review"] as const;

const paymentMethods = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, note: "Visa, Mastercard via Stripe" },
  { id: "paypal", label: "PayPal", icon: Wallet, note: "Pay with your PayPal balance" },
  { id: "bank", label: "Bank Transfer", icon: Landmark, note: "Net terms for trade accounts" },
  { id: "mobile", label: "Mobile Money", icon: Smartphone, note: "Local wallets supported" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, note: "Pay the driver on arrival" },
  { id: "wallet", label: "Wallet Balance", icon: Wallet, note: "Use your store credit" },
];

export function CheckoutView() {
  const { items, coupon, clear } = useCart();
  const totals = cartTotals(items, coupon);
  const [step, setStep] = useState(0);
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [payment, setPayment] = useState("card");
  const [placed, setPlaced] = useState(false);
  const active = items.filter((i) => !i.savedForLater);

  if (placed) {
    return <OrderConfirmed total={totals.total} payment={payment} />;
  }

  if (active.length === 0) {
    return (
      <div className="card grid place-items-center py-24 text-center">
        <Package className="h-14 w-14 text-secondary/20" />
        <h1 className="mt-4 font-display text-2xl font-bold text-secondary">Nothing to check out</h1>
        <Link href="/products" className="btn-primary mt-6">Browse products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold text-secondary">Checkout</h1>

      {/* Stepper */}
      <div className="mb-8 flex items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span className={cn(
                "grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition",
                i <= step ? "bg-primary text-white" : "bg-secondary/10 text-secondary/50",
              )}>
                {i < step ? "✓" : i + 1}
              </span>
              <span className={cn("hidden text-sm font-semibold sm:block", i <= step ? "text-secondary" : "text-secondary/40")}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-3 h-0.5 flex-1", i < step ? "bg-primary" : "bg-secondary/10")} />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {step === 0 && (
            <Section title="Customer information">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business / full name" placeholder="Metro Foods Ltd" />
                <Field label="Contact email" placeholder="orders@business.com" type="email" />
                <Field label="Phone" placeholder="+1 800 555 0142" />
                <Field label="Tax / VAT number" placeholder="Optional" />
              </div>
            </Section>
          )}

          {step === 1 && (
            <Section title="Delivery method">
              <div className="grid gap-3 sm:grid-cols-2">
                <Choice active={fulfilment === "delivery"} onClick={() => setFulfilment("delivery")} icon={Truck} title="Delivery" note="To your address by zone" />
                <Choice active={fulfilment === "pickup"} onClick={() => setFulfilment("pickup")} icon={Store} title="Warehouse pickup" note="Collect from Zone A depot" />
              </div>
              {fulfilment === "delivery" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Delivery address" placeholder="14 Market Street" full />
                  <Field label="City" placeholder="Harbor City" />
                  <Field label="Postal code" placeholder="10234" />
                  <Field label="Delivery date" type="date" />
                  <div>
                    <label className="label">Delivery window</label>
                    <select className="input">
                      <option>Morning (8am – 12pm)</option>
                      <option>Afternoon (12pm – 5pm)</option>
                      <option>Evening (5pm – 8pm)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Order notes</label>
                    <textarea className="input min-h-[80px]" placeholder="Loading dock instructions, preferred entrance…" />
                  </div>
                </div>
              )}
            </Section>
          )}

          {step === 2 && (
            <Section title="Payment method">
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((m) => (
                  <Choice key={m.id} active={payment === m.id} onClick={() => setPayment(m.id)} icon={m.icon} title={m.label} note={m.note} />
                ))}
              </div>
              {payment === "card" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Card number" placeholder="4242 4242 4242 4242" full />
                  <Field label="Expiry" placeholder="MM / YY" />
                  <Field label="CVC" placeholder="123" />
                </div>
              )}
            </Section>
          )}

          {step === 3 && (
            <Section title="Review your order">
              <div className="space-y-3">
                {active.map((line) => (
                  <div key={line.product.id} className="flex items-center justify-between text-sm">
                    <span className="text-secondary/70">{line.quantity} × {line.product.name}</span>
                    <span className="font-semibold text-secondary">
                      {formatCurrency(discountedPrice(line.product.wholesalePrice, line.product.discountPercent) * line.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-canvas p-4 text-sm">
                <p className="text-secondary/70">Fulfilment: <span className="font-semibold text-secondary capitalize">{fulfilment}</span></p>
                <p className="text-secondary/70">Payment: <span className="font-semibold text-secondary">{paymentMethods.find((m) => m.id === payment)?.label}</span></p>
              </div>
            </Section>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn-outline disabled:opacity-40"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} className="btn-primary">Continue</button>
            ) : (
              <button onClick={() => { clear(); setPlaced(true); }} className="btn-primary px-8">
                Place order · {formatCurrency(totals.total)}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="sticky top-24 card p-6">
            <h2 className="font-display text-lg font-bold text-secondary">Summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <SummaryRow label={`Subtotal (${totals.itemCount})`} value={formatCurrency(totals.subtotal)} />
              {totals.couponAmount > 0 && <SummaryRow label="Coupon" value={`− ${formatCurrency(totals.couponAmount)}`} />}
              <SummaryRow label="Tax" value={formatCurrency(totals.tax)} />
              <SummaryRow label="Delivery" value={totals.deliveryFee === 0 ? "Free" : formatCurrency(totals.deliveryFee)} />
              <div className="border-t border-secondary/10 pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-secondary">Total</span>
                  <span className="font-display text-xl font-bold text-secondary">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </dl>
            <p className="mt-4 flex items-center gap-2 text-xs text-secondary/50">
              <MapPin className="h-4 w-4 text-primary" /> Delivery fee is estimated by zone & distance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderConfirmed({ total, payment }: { total: number; payment: string }) {
  const ref = `BVS-${Math.floor(100000 + Math.random() * 899999)}`;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mx-auto max-w-lg p-10 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
      <h1 className="mt-4 font-display text-2xl font-bold text-secondary">Order placed!</h1>
      <p className="mt-2 text-secondary/60">
        Thank you. Your order <span className="font-semibold text-secondary">{ref}</span> for{" "}
        <span className="font-semibold text-secondary">{formatCurrency(total)}</span> is confirmed.
      </p>
      <p className="mt-1 text-sm text-secondary/50">
        {payment === "cod" ? "Pay cash on delivery." : "Payment received."} We'll email your invoice and delivery updates.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/dashboard" className="btn-primary">Track order</Link>
        <Link href="/products" className="btn-outline">Keep shopping</Link>
      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
      <h2 className="mb-4 font-display text-lg font-bold text-secondary">{title}</h2>
      {children}
    </motion.div>
  );
}

function Field({ label, placeholder, type = "text", full }: { label: string; placeholder?: string; type?: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="label">{label}</label>
      <input type={type} placeholder={placeholder} className="input" />
    </div>
  );
}

function Choice({ active, onClick, icon: Icon, title, note }: { active: boolean; onClick: () => void; icon: React.ElementType; title: string; note: string }) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition",
      active ? "border-primary bg-primary/5" : "border-secondary/10 hover:border-secondary/30",
    )}>
      <Icon className={cn("h-6 w-6", active ? "text-primary" : "text-secondary/50")} />
      <div>
        <p className="font-semibold text-secondary">{title}</p>
        <p className="text-xs text-secondary/50">{note}</p>
      </div>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-secondary/60">{label}</dt>
      <dd className="font-semibold text-secondary">{value}</dd>
    </div>
  );
}
