"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Loader2, XCircle } from "lucide-react";
import { startCardPayment } from "@/lib/api";

export function PaymentCancelled() {
  const reference = useSearchParams().get("ref") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setError(null);
    setLoading(true);
    try {
      await startCardPayment(reference);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="card mx-auto max-w-lg p-10 text-center">
      <XCircle className="mx-auto h-16 w-16 text-secondary/30" />
      <h1 className="mt-4 font-display text-2xl font-bold text-secondary">Payment cancelled</h1>
      <p className="mt-2 text-secondary/60">
        No money was taken. Your order{reference && <> <strong className="text-secondary">{reference}</strong></>} is
        saved — pay now to confirm it. Unpaid card orders are released after about 30 minutes.
      </p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-primary/10 p-3 text-sm text-primary">{error}</p>}
      <div className="mt-6 flex justify-center gap-3">
        {reference && (
          <button onClick={retry} disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Try payment again
          </button>
        )}
        <Link href="/dashboard" className="btn-outline">My orders</Link>
      </div>
    </div>
  );
}
