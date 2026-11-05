"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Truck, Store, CreditCard, CheckCircle2, Wallet, Landmark,
  Banknote, Smartphone, Package, AlertCircle, Loader2, LogIn, ShieldCheck,
} from "lucide-react";
import { useCart, cartTotals } from "@/store/cart";
import { discountedPrice, formatCurrency, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  apiEnabled, placeOrder, fetchPaymentConfig, startCardPayment, type PlacedOrder,
} from "@/lib/api";
import { useAuth } from "@/store/auth";

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
  const [step, setStep] = useState(0);
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const totals = cartTotals(items, coupon, fulfilment);
  const [payment, setPayment] = useState("card");
  const [placed, setPlaced] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", taxId: "",
    address: "", city: "", postalCode: "", date: "", window: "Morning (8am – 12pm)", notes: "",
  });
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));
  const active = items.filter((i) => !i.savedForLater);

  const authUser = useAuth((s) => s.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const user = mounted ? authUser : null;

  // Card payments are available when the backend has Stripe configured.
  const { data: cardEnabled } = useQuery({
    queryKey: ["payment-config"],
    queryFn: fetchPaymentConfig,
    enabled: apiEnabled,
  });
  const cardAvailable = !apiEnabled || cardEnabled === true;
  const visibleMethods = paymentMethods.filter((m) => m.id !== "card" || cardAvailable);
  const payWithCard = apiEnabled && cardEnabled === true && payment === "card";
  useEffect(() => {
    if (apiEnabled && cardEnabled === false && payment === "card") setPayment("bank");
  }, [cardEnabled, payment]);

  // Prefill contact details from the signed-in account.
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email }));
  }, [user]);

  async function submitOrder() {
    if (!apiEnabled) {
      clear();
      setPlaced(true);
      return;
    }
    if (fulfilment === "delivery" && !form.address.trim()) {
      setError("Please enter a delivery address.");
      setStep(1);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const deliveryAddress =
        fulfilment === "delivery"
          ? [form.address, form.city, form.postalCode].map((v) => v.trim()).filter(Boolean).join(", ")
          : undefined;
      const notes = [
        fulfilment === "delivery" ? `Window: ${form.window}` : "Warehouse pickup",
        form.phone && `Phone: ${form.phone}`,
        form.taxId && `Tax ID: ${form.taxId}`,
        form.notes,
      ].filter(Boolean).join("\n");
      const result = await placeOrder({
        items: active.map((l) => ({ slug: l.product.slug, quantity: l.quantity })),
        paymentMethod: paymentMethods.find((m) => m.id === payment)?.label ?? payment,
        fulfilment,
        deliveryAddress,
        deliveryDate: fulfilment === "delivery" && form.date ? form.date : undefined,
        notes: notes || undefined,
        couponCode: coupon ?? undefined,
      });
      setOrder(result);
      clear();
      if (payWithCard) {
        try {
          // Leaves the site for Stripe's hosted payment page.
          await startCardPayment(result.reference);
          return;
        } catch (err) {
          setPaymentNotice(
            `Your order is saved, but card payment couldn't start (${(err as Error).message}). ` +
              "You can pay from My account → Orders.",
          );
        }
      }
      setPlaced(true);
      setSubmitting(false);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <OrderConfirmed
        total={order?.total ?? totals.total}
        payment={payment}
        reference={order?.reference}
        live={Boolean(order)}
        notice={paymentNotice}
      />
    );
  }

  if (apiEnabled && mounted && !user && active.length > 0) {
    return (
      <div className="card mx-auto grid max-w-lg place-items-center p-10 text-center">
        <LogIn className="h-12 w-12 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-bold text-secondary">Sign in to check out</h1>
        <p className="mt-2 text-secondary/60">
          Your cart is saved. Sign in or create a free trade account to place your order and track delivery.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/login?next=/checkout" className="btn-primary">Sign in</Link>
          <Link href="/register?next=/checkout" className="btn-outline">Create account</Link>
        </div>
      </div>
    );
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
                <Field label="Business / full name" placeholder="Metro Foods Ltd" value={form.name} onChange={set("name")} />
                <Field label="Contact email" placeholder="orders@business.com" type="email" value={form.email} onChange={set("email")} />
                <Field label="Phone" placeholder="+1 800 555 0142" value={form.phone} onChange={set("phone")} />
                <Field label="Tax / VAT number" placeholder="Optional" value={form.taxId} onChange={set("taxId")} />
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
                  <Field label="Delivery address" placeholder="14 Market Street" full value={form.address} onChange={set("address")} />
                  <Field label="City" placeholder="Harbor City" value={form.city} onChange={set("city")} />
                  <Field label="Postal code" placeholder="10234" value={form.postalCode} onChange={set("postalCode")} />
                  <Field label="Delivery date" type="date" value={form.date} onChange={set("date")} />
                  <div>
                    <label className="label">Delivery window</label>
                    <select className="input" value={form.window} onChange={(e) => set("window")(e.target.value)}>
                      <option>Morning (8am – 12pm)</option>
                      <option>Afternoon (12pm – 5pm)</option>
                      <option>Evening (5pm – 8pm)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Order notes</label>
                    <textarea className="input min-h-[80px]" placeholder="Loading dock instructions, preferred entrance…" value={form.notes} onChange={(e) => set("notes")(e.target.value)} />
                  </div>
                </div>
              )}
            </Section>
          )}

          {step === 2 && (
            <Section title="Payment method">
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleMethods.map((m) => (
                  <Choice key={m.id} active={payment === m.id} onClick={() => setPayment(m.id)} icon={m.icon} title={m.label} note={m.note} />
                ))}
              </div>
              {payWithCard && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-canvas p-4 text-sm text-secondary/70">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  After you place the order you&apos;ll be taken to Stripe&apos;s secure page to pay by card.
                  BevSupply never sees your card details.
                </p>
              )}
              {apiEnabled && !payWithCard && (
                <p className="mt-4 rounded-xl bg-canvas p-4 text-sm text-secondary/70">
                  Your order is placed as <strong>payment pending</strong> and our team will contact you to
                  complete payment with your chosen method.
                </p>
              )}
              {!apiEnabled && payment === "card" && (
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

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-primary/10 p-4 text-sm text-primary">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
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
              <button onClick={submitOrder} disabled={submitting} className="btn-primary px-8 disabled:opacity-60">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {payWithCard ? "Place order & pay" : "Place order"} · {formatCurrency(totals.total)}
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

function OrderConfirmed({
  total, payment, reference, live, notice,
}: { total: number; payment: string; reference?: string; live: boolean; notice?: string | null }) {
  const [demoRef] = useState(() => `BVS-${Math.floor(100000 + Math.random() * 899999)}`);
  const ref = reference ?? demoRef;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mx-auto max-w-lg p-10 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
      <h1 className="mt-4 font-display text-2xl font-bold text-secondary">Order placed!</h1>
      <p className="mt-2 text-secondary/60">
        Thank you. Your order <span className="font-semibold text-secondary">{ref}</span> for{" "}
        <span className="font-semibold text-secondary">{formatCurrency(total)}</span> is confirmed.
      </p>
      <p className="mt-1 text-sm text-secondary/50">
        {payment === "cod"
          ? "Pay cash on delivery."
          : live
            ? "Payment is pending. We'll contact you to complete payment."
            : "Payment received."}{" "}
        We'll email your invoice and delivery updates.
      </p>
      {notice && (
        <p role="alert" className="mt-4 rounded-xl bg-primary/10 p-3 text-sm text-primary">{notice}</p>
      )}
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

function Field({
  label, placeholder, type = "text", full, value, onChange,
}: {
  label: string; placeholder?: string; type?: string; full?: boolean;
  value?: string; onChange?: (value: string) => void;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="label">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="input"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
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
