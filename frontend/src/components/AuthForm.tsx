"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { apiEnabled, login, register } from "@/lib/api";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const params = useSearchParams();
  // Only allow internal redirects.
  const nextParam = params.get("next");
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiEnabled) {
      setSubmitted(true);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await register(name, email, password);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="container-page grid min-h-[70vh] items-center py-10 lg:grid-cols-2 lg:gap-12">
      {/* Left panel */}
      <div className="hidden rounded-3xl bg-secondary p-12 text-white lg:block">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-lg font-bold">B</span>
        <h2 className="mt-8 font-display text-3xl font-bold">
          {isLogin ? "Welcome back to BevSupply" : "Grow your beverage business"}
        </h2>
        <p className="mt-3 text-white/70">
          {isLogin
            ? "Sign in to reorder, track deliveries, manage invoices and access your wholesale pricing."
            : "Open a trade account for wholesale pricing, credit terms, bulk tiers and same-day dispatch."}
        </p>
        <ul className="mt-8 space-y-3 text-sm text-white/80">
          {["Live inventory & wholesale pricing", "Secure accounts & order history", "Batch & expiry tracking", "Order tracking timeline"].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" /> {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-md">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-secondary">
            {isLogin ? "Sign in" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-secondary/50">
            {isLogin ? "Enter your credentials to continue" : "It takes less than a minute"}
          </p>

          {submitted ? (
            <div className="mt-6 rounded-xl bg-success/10 p-4 text-sm text-success">
              {isLogin ? "Signed in (demo)." : "Account created (demo)."} This is a front-end
              preview — connect the backend API to enable real authentication.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-xl bg-primary/10 p-3 text-sm text-primary">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              {!isLogin && (
                <InputRow icon={User} label="Business / full name" placeholder="Metro Foods Ltd" value={name} onChange={setName} minLength={2} autoComplete="organization" />
              )}
              <InputRow icon={Mail} label="Email" placeholder="you@business.com" type="email" value={email} onChange={setEmail} autoComplete="email" />
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/40" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="input pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={isLogin ? 1 : 8}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                  />
                  <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-secondary/60">
                    <input type="checkbox" className="accent-primary" /> Remember me
                  </label>
                  <Link href="#" className="font-semibold text-primary">Forgot password?</Link>
                </div>
              )}

              {!isLogin && <p className="text-xs text-secondary/50">At least 8 characters.</p>}
              <button disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLogin ? "Sign in" : "Create account"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-secondary/60">
            {isLogin ? "New to BevSupply?" : "Already have an account?"}{" "}
            <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-primary">
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function InputRow({
  icon: Icon, label, placeholder, type = "text", value, onChange, minLength, autoComplete,
}: {
  icon: React.ElementType; label: string; placeholder: string; type?: string;
  value: string; onChange: (v: string) => void; minLength?: number; autoComplete?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/40" />
        <input
          type={type}
          placeholder={placeholder}
          className="input pl-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minLength={minLength}
          autoComplete={autoComplete}
          required
        />
      </div>
    </div>
  );
}
