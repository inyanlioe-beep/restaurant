"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  UtensilsCrossed,
  Receipt,
  BookOpen,
  LayoutGrid,
  Calendar,
  Boxes,
  Users,
  BarChart3,
  SlidersHorizontal,
  LogOut,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: BarChart3 },
  { label: "POS Terminal", href: "/pos", icon: UtensilsCrossed, badge: "Live" },
  { label: "Live Orders", href: "/orders", icon: Receipt },
  { label: "Floor & Tables", href: "/tables", icon: LayoutGrid },
  { label: "Menu Catalog", href: "/menu", icon: BookOpen },
  { label: "Reservations", href: "/reservations", icon: Calendar },
];

const managementNavItems: NavItem[] = [
  { label: "Inventory", href: "/inventory", icon: Boxes, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { label: "Staff & Shifts", href: "/staff", icon: Users, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { label: "Reports & KPIs", href: "/reports", icon: BarChart3, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { label: "Settings", href: "/settings", icon: SlidersHorizontal, roles: ["SUPER_ADMIN", "ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as unknown as { role?: string })?.role || "STAFF";

  const isAllowed = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(userRole);
  };

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0 z-30 transition-all duration-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
            LE MAJESTIC
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
              POS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-wide">Grand Bistro • NYC</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {/* Core Operations */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
            Service Floor
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
                    isActive
                      ? "bg-gradient-to-r from-amber-500/15 to-transparent text-amber-400 border-l-2 border-amber-500 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-300")} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Management & Analytics */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
            Administration
          </div>
          <nav className="space-y-1">
            {managementNavItems
              .filter((item) => isAllowed(item.roles))
              .map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
                      isActive
                        ? "bg-gradient-to-r from-amber-500/15 to-transparent text-amber-400 border-l-2 border-amber-500 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/60"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-300")} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
          </nav>
        </div>
      </div>

      {/* User Profile & Branch Info Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {session?.user?.name || "Staff Member"}
              </p>
              <p className="text-[10px] text-amber-400/90 font-mono tracking-tight capitalize">
                {userRole.replace("_", " ").toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
