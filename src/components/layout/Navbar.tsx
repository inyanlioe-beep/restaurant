"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Bell,
  Search,
  Store,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [time, setTime] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0E131F]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left side: Branch info & Search */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Store className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-200">Downtown Flagship</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-[10px] text-emerald-400 font-medium">Open</span>
        </div>

        {/* Global Quick Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search items, tables, orders (⌘K)..."
            className="w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right side: Live Clock, Notifications, Quick Actions */}
      <div className="flex items-center gap-4">
        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-amber-400/80" />
          <span>{time || "00:00:00"}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#0E131F] animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="font-semibold text-slate-200">Kitchen & Service Alerts</span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">
                  2 New
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-850/50 border border-slate-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-200">Table T2 Order Ready</p>
                    <p className="text-[11px] text-slate-400">Ribeye & Truffle Pappardelle ready for pickup.</p>
                    <span className="text-[9px] text-slate-500 mt-1 block">1 min ago</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-850/50 border border-slate-800/60">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-200">New Reservation (Party of 6)</p>
                    <p className="text-[11px] text-slate-400">Terrace Garden • 8:30 PM tonight</p>
                    <span className="text-[9px] text-slate-500 mt-1 block">5 mins ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Launch POS Button */}
        <Link
          href="/pos"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Order</span>
        </Link>
      </div>
    </header>
  );
}
