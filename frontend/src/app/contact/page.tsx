"use client";

import { useState } from "react";
import { Mail, Phone, MessageCircle, MapPin, Send } from "lucide-react";

const faqs = [
  ["Do you offer credit accounts?", "Yes, approved retailers get credit limits with net payment terms."],
  ["What's the minimum order?", "Minimum order quantities are set per product, shown on each product page."],
  ["How is delivery calculated?", "By zone and distance. Orders over $250 ship free in metro zones."],
  ["Can I return products?", "Yes, request a return from your dashboard within the return window."],
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-bold text-secondary">Contact & support</h1>
      <p className="mt-2 text-secondary/60">We're here to help — reach us any way you like.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Phone, label: "Call us", value: "+1 (800) 555-0142" },
              { icon: Mail, label: "Email", value: "orders@bevsupply.com" },
              { icon: MessageCircle, label: "Live chat / WhatsApp", value: "Available 8am – 8pm" },
              { icon: MapPin, label: "Warehouse", value: "14 Harbor Distribution Park" },
            ].map((c) => (
              <div key={c.label} className="card flex items-start gap-3 p-5">
                <c.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-secondary">{c.label}</p>
                  <p className="text-sm text-secondary/60">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="mb-3 font-display text-lg font-bold text-secondary">FAQ</h2>
            <div className="space-y-3">
              {faqs.map(([q, a]) => (
                <details key={q} className="card p-4">
                  <summary className="cursor-pointer font-semibold text-secondary">{q}</summary>
                  <p className="mt-2 text-sm text-secondary/60">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="card h-fit p-6">
          <h2 className="font-display text-lg font-bold text-secondary">Send us a message</h2>
          {sent ? (
            <p className="mt-4 rounded-xl bg-success/10 p-4 text-sm text-success">
              Thanks! Our support team will reply within one business day.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div><label className="label">Name</label><input className="input" required /></div>
              <div><label className="label">Email</label><input type="email" className="input" required /></div>
              <div><label className="label">Subject</label><input className="input" /></div>
              <div><label className="label">Message</label><textarea className="input min-h-[120px]" required /></div>
              <button className="btn-primary w-full">Send message <Send className="h-4 w-4" /></button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
