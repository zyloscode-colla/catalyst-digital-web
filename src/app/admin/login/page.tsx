"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("superadmin@catalystdigital.com");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Please verify credentials.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  }

  function autofill(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("Admin123!");
    setError(null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Catalyst Digital CMS
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Secure administrative access & content management system
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur">
          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  placeholder="admin@catalystdigital.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign in to Dashboard <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Account Switchers */}
          <div className="mt-8 border-t border-slate-800 pt-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
              <span>Select Demo Role to Test RBAC:</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => autofill("superadmin@catalystdigital.com")}
                className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-2 text-left text-xs font-medium text-purple-300 hover:bg-purple-500/20 transition-colors"
              >
                <p className="font-semibold">Super Admin</p>
                <p className="text-[10px] text-purple-400/80">Full unrestricted access</p>
              </button>

              <button
                type="button"
                onClick={() => autofill("content@catalystdigital.com")}
                className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-2 text-left text-xs font-medium text-blue-300 hover:bg-blue-500/20 transition-colors"
              >
                <p className="font-semibold">Content Admin</p>
                <p className="text-[10px] text-blue-400/80">All content & sections</p>
              </button>

              <button
                type="button"
                onClick={() => autofill("editor@catalystdigital.com")}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2 text-left text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                <p className="font-semibold">Staff Editor</p>
                <p className="text-[10px] text-emerald-400/80">Services, projects, blog</p>
              </button>

              <button
                type="button"
                onClick={() => autofill("auditor@catalystdigital.com")}
                className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-2 text-left text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <p className="font-semibold">Auditor</p>
                <p className="text-[10px] text-slate-400">Read-only permissions</p>
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-500">
              Default password for all accounts: <span className="font-mono text-slate-300">Admin123!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
