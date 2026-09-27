"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Receipt,
  LayoutGrid,
  TrendingUp,
  ArrowUpRight,
  Clock,
  UtensilsCrossed,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardData {
  kpi: {
    totalRevenue: number;
    activeOrders: number;
    occupancyRate: number;
    occupiedTables: number;
    totalTables: number;
    avgOrderValue: number;
    revenueGrowth: string;
    ordersGrowth: string;
  };
  hourlySales: { time: string; revenue: number; orders: number }[];
  topItems: { name: string; quantity: number; revenue: number; category: string }[];
  recentOrders: {
    id: string;
    orderNumber: number;
    status: string;
    type: string;
    tableLabel?: string;
    totalAmount: number;
    createdAt: string;
    items: { name: string; quantity: number }[];
  }[];
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<{ success: boolean; data: DashboardData }>({
    queryKey: ["dashboard-reports"],
    queryFn: async () => {
      const res = await fetch("/api/reports");
      return res.json();
    },
    refetchInterval: 15000, // Refresh every 15s for live dashboard
  });

  const dashboard = data?.data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Service Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Dinner Service & Terminal Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Downtown Flagship • Real-time floor occupancy, kitchen orders, and sales throughput.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tables"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all flex items-center gap-2"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span>Floor Plan</span>
          </Link>
          <Link
            href="/pos"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Today&apos;s Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
            {isLoading ? "..." : formatCurrency(dashboard?.kpi.totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{dashboard?.kpi.revenueGrowth || "+18.4%"} vs last week</span>
          </div>
        </div>

        {/* Active Kitchen Orders */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Active Kitchen Orders</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
            {isLoading ? "..." : `${dashboard?.kpi.activeOrders || 0} Tickets`}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Live kitchen preparation</span>
          </div>
        </div>

        {/* Floor Occupancy */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Table Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
            {isLoading ? "..." : `${dashboard?.kpi.occupancyRate || 0}%`}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span>
              {dashboard?.kpi.occupiedTables || 0} of {dashboard?.kpi.totalTables || 0} tables occupied
            </span>
          </div>
        </div>

        {/* Average Ticket Size */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Avg. Ticket Value</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
            {isLoading ? "..." : formatCurrency(dashboard?.kpi.avgOrderValue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-medium">
            <span>Healthy check averages</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Sales Volume Hourly Heatmap & Top Menu Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Sales Throughput */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Hourly Revenue Throughput</h2>
              <p className="text-[11px] text-slate-400">Pacing during lunch and dinner rushes</p>
            </div>
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full font-semibold border border-amber-500/20">
              Peak: 7 PM ($1,120)
            </span>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="space-y-3 pt-2">
            {(dashboard?.hourlySales || []).map((slot) => {
              const maxVal = 1200;
              const pct = Math.min(100, Math.round((slot.revenue / maxVal) * 100));
              return (
                <div key={slot.time} className="flex items-center gap-3 text-xs">
                  <span className="w-14 text-slate-400 text-[11px] font-mono shrink-0">
                    {slot.time}
                  </span>
                  <div className="flex-1 h-6 bg-slate-950 rounded-lg overflow-hidden relative border border-slate-800/80">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-300 font-semibold">
                      {formatCurrency(slot.revenue)} ({slot.orders} orders)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Dishes */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Top Selling Items</h2>
              <p className="text-[11px] text-slate-400">By quantity sold today</p>
            </div>
            <Link href="/menu" className="text-xs text-amber-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60">
            {(dashboard?.topItems || []).map((item, idx) => (
              <div key={item.name} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[11px]">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-100">{item.quantity} sold</p>
                  <p className="text-[10px] text-amber-400/90 font-mono">{formatCurrency(item.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Recent Service Orders</h2>
            <p className="text-[11px] text-slate-400">Live order status from POS terminals and dining floor</p>
          </div>
          <Link
            href="/orders"
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            <span>Orders Management</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Order #</th>
                <th className="pb-3">Table / Type</th>
                <th className="pb-3">Items Summary</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3 pr-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(dashboard?.recentOrders || []).map((order) => {
                const statusColors: Record<string, string> = {
                  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  PREPARING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                  READY: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                  SERVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                  COMPLETED: "bg-slate-800 text-slate-300 border-slate-700",
                };

                return (
                  <tr key={order.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-slate-200">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3.5">
                      <span className="font-semibold text-slate-200">
                        {order.tableLabel ? `Table ${order.tableLabel}` : order.type}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                      {formatDate(order.createdAt, "HH:mm")}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-slate-200">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          statusColors[order.status] || "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
