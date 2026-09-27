"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, KeyRound, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@restaurant.com");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Invalid credentials. Try using one of the demo accounts below.");
      } else {
        toast.success("Welcome back! Redirecting to POS...");
        router.push("/pos");
        router.refresh();
      }
    } catch {
      toast.error("Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.info(`Selected ${roleName} credentials`);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/25 mb-4">
          <Sparkles className="w-7 h-7 text-slate-950" />
        </div>
        <h1 className="text-xl font-bold tracking-wider text-slate-100">LE MAJESTIC</h1>
        <p className="text-xs text-slate-400 mt-1">Enterprise Restaurant Management & POS</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@restaurant.com"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In to Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Credentials Selector */}
      <div className="mt-8 pt-6 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Demo Roles (1-Click Fill)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("admin@restaurant.com", "Admin123!", "Admin")}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
          >
            <div className="text-[11px] font-bold text-slate-200 group-hover:text-amber-400">
              Admin
            </div>
            <div className="text-[10px] text-slate-500 truncate">admin@restaurant.com</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin("manager@restaurant.com", "Manager123!", "Manager")}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
          >
            <div className="text-[11px] font-bold text-slate-200 group-hover:text-amber-400">
              Manager
            </div>
            <div className="text-[10px] text-slate-500 truncate">manager@restaurant.com</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin("waiter@restaurant.com", "Staff123!", "Waiter")}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
          >
            <div className="text-[11px] font-bold text-slate-200 group-hover:text-amber-400">
              Waiter (Staff)
            </div>
            <div className="text-[10px] text-slate-500 truncate">waiter@restaurant.com</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin("chef@restaurant.com", "Chef123!", "Chef")}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
          >
            <div className="text-[11px] font-bold text-slate-200 group-hover:text-amber-400">
              Head Chef
            </div>
            <div className="text-[10px] text-slate-500 truncate">chef@restaurant.com</div>
          </button>
        </div>
      </div>
    </div>
  );
}
