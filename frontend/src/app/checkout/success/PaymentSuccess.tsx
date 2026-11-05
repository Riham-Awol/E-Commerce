"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { apiEnabled, confirmCardPayment } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export function PaymentSuccess() {
  const params = useSearchParams();
  const sessionId = params.get("session_id") ?? "";
  const reference = params.get("ref") ?? "";

  const { data, error, isLoading } = useQuery({
    queryKey: ["confirm-payment", sessionId],
    queryFn: () => confirmCardPayment(sessionId),
    enabled: apiEnabled && Boolean(sessionId),
    retry: 2,
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <Card>
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h1 className="mt-4 font-display text-2xl font-bold text-secondary">Confirming your payment…</h1>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <AlertCircle className="mx-auto h-14 w-14 text-accent" />
        <h1 className="mt-4 font-display text-2xl font-bold text-secondary">We couldn&apos;t confirm the payment yet</h1>
        <p className="mt-2 text-secondary/60">
          {error ? (error as Error).message : "Missing payment details."} If you completed payment, your order
          {reference ? <> <strong>{reference}</strong></> : null} will update automatically within a few minutes.
        </p>
        <Actions />
      </Card>
    );
  }

  return (
    <Card>
      {data.paid ? (
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
      ) : (
        <Clock className="mx-auto h-16 w-16 text-accent" />
      )}
      <h1 className="mt-4 font-display text-2xl font-bold text-secondary">
        {data.paid ? "Payment received — thank you!" : "Payment processing"}
      </h1>
      <p className="mt-2 text-secondary/60">
        Order <span className="font-semibold text-secondary">{data.reference}</span> for{" "}
        <span className="font-semibold text-secondary">{formatCurrency(data.total)}</span>{" "}
        {data.paid ? "is paid and confirmed." : "will be confirmed as soon as your bank approves the payment."}
      </p>
      <p className="mt-1 text-sm text-secondary/50">Stripe will email your receipt. Track delivery from your account.</p>
      <Actions />
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mx-auto max-w-lg p-10 text-center">
      {children}
    </motion.div>
  );
}

function Actions() {
  return (
    <div className="mt-6 flex justify-center gap-3">
      <Link href="/dashboard" className="btn-primary">Track order</Link>
      <Link href="/products" className="btn-outline">Keep shopping</Link>
    </div>
  );
}
