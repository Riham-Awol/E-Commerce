"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Clock, Truck } from "lucide-react";

const zones = [
  { id: "A", name: "Zone A — Metro", eta: "Same day (order before 2pm)", fee: "Free over $250, otherwise $12.50" },
  { id: "B", name: "Zone B — Suburban", eta: "Next day", fee: "$12.50 flat" },
  { id: "C", name: "Zone C — Regional", eta: "2–3 days", fee: "Distance based, quoted at checkout" },
] as const;

/**
 * Demo zone lookup: maps the first digit of a postcode (or a city name length
 * when letters are entered) to a zone. Replace with a real geocoding/zone API
 * once the backend exposes one.
 */
function lookupZone(input: string) {
  const value = input.trim();
  if (!value) return null;
  const digit = value.match(/\d/)?.[0];
  const n = digit ? Number(digit) : value.length;
  return zones[n % 3 === 0 ? 0 : n % 3 === 1 ? 1 : 2];
}

export function ZoneChecker() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<(typeof zones)[number] | null>(null);
  const [checked, setChecked] = useState(false);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="font-display text-xl font-bold text-secondary">Check your zone</h2>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setResult(lookupZone(query));
            setChecked(true);
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Postcode or city"
            className="input flex-1"
            required
          />
          <button type="submit" className="btn-primary">Check</button>
        </form>

        {checked && result && (
          <div className="mt-6 rounded-xl bg-success/10 p-5 text-sm">
            <p className="font-semibold text-success">Good news, we deliver to you.</p>
            <p className="mt-2 flex items-center gap-2 text-secondary"><MapPin className="h-4 w-4" /> {result.name}</p>
            <p className="mt-1 flex items-center gap-2 text-secondary"><Clock className="h-4 w-4" /> {result.eta}</p>
            <p className="mt-1 flex items-center gap-2 text-secondary"><Truck className="h-4 w-4" /> {result.fee}</p>
            <Link href="/products" className="btn-primary mt-4">Start shopping</Link>
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {zones.map((z) => (
          <div
            key={z.id}
            className={`card flex items-center justify-between p-5 ${result?.id === z.id ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-secondary">
                <MapPin className="h-5 w-5" />
              </span>
              <p className="font-semibold text-secondary">{z.name}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-primary">{z.eta}</p>
              <p className="text-secondary/60">{z.fee}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
