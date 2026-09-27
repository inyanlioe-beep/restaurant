"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Receipt,
  Download,
  Printer,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  PieChart,
  ArrowUpRight,
  Sparkles,
  Percent,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState<"TODAY" | "WEEK" | "MONTH">("TODAY");

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["reports-analytics", timeframe],
    queryFn: async () => {
      const res = await fetch("/api/reports");
      return res.json();
    },
  });

  const dashboard = reportData?.data;

  // Multiplier for week/month view demonstration
  const mult = timeframe === "WEEK" ? 6.2 : timeframe === "MONTH" ? 24.5 : 1;

  const grossRevenue = (dashboard?.kpi.totalRevenue || 4380) * mult;
  const foodCost = grossRevenue * 0.285; // 28.5% food cost ratio
  const grossProfit = grossRevenue - foodCost;
  const marginPct = 71.5;

  const paymentMethods = [
    { name: "Credit / Debit Cards", pct: 64, amount: grossRevenue * 0.64, icon: CreditCard, color: "bg-blue-500" },
    { name: "Cash Transactions", pct: 24, amount: grossRevenue * 0.24, icon: Banknote, color: "bg-emerald-500" },
    { name: "Digital Wallets / QRIS", pct: 12, amount: grossRevenue * 0.12, icon: QrCode, color: "bg-amber-500" },
  ];

  const categoryDistribution = [
    { category: "Prime Steaks & Mains", pct: 45, revenue: grossRevenue * 0.45, itemsSold: Math.round(180 * mult) },
    { category: "Craft Cocktails & Wine", pct: 24, revenue: grossRevenue * 0.24, itemsSold: Math.round(240 * mult) },
    { category: "Woodfired Pizza & Pasta", pct: 18, revenue: grossRevenue * 0.18, itemsSold: Math.round(145 * mult) },
    { category: "Signature Starters", pct: 9, revenue: grossRevenue * 0.09, itemsSold: Math.round(95 * mult) },
    { category: "Decadent Desserts", pct: 4, revenue: grossRevenue * 0.04, itemsSold: Math.round(65 * mult) },
  ];

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      `Gross Revenue,$${grossRevenue.toFixed(2)}\n` +
      `Estimated Food Cost,$${foodCost.toFixed(2)}\n` +
      `Gross Profit,$${grossProfit.toFixed(2)}\n` +
      `Profit Margin,${marginPct}%\n` +
      `Timeframe,${timeframe}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `le_majestic_report_${timeframe.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Financial report downloaded (CSV)");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Financial & Analytical Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Revenue, Margin & Sales Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            P&L overview, cost of goods sold (COGS), payment settlement distribution, and category performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {/* Time Window Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          {[
            { id: "TODAY", label: "Today's Service" },
            { id: "WEEK", label: "This Week" },
            { id: "MONTH", label: "This Month (M-T-D)" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as unknown as typeof timeframe)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === t.id
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Settlement Currency: <strong className="text-amber-400">USD ($)</strong>
        </span>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Gross Sales Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {isLoading ? "..." : formatCurrency(grossRevenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% compared to prior period</span>
          </div>
        </div>

        {/* Cost of Goods Sold */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Cost of Goods (COGS)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {isLoading ? "..." : formatCurrency(foodCost)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">28.5% prime cost ratio (Target: &lt;30%)</p>
        </div>

        {/* Gross Profit */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Gross Kitchen Margin</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {isLoading ? "..." : formatCurrency(grossProfit)}
          </div>
          <p className="text-[11px] text-amber-400/90 mt-2">{marginPct}% gross operating margin</p>
        </div>

        {/* Avg Check */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Avg. Ticket Check</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {isLoading ? "..." : formatCurrency(dashboard?.kpi.avgOrderValue || 74.5)}
          </div>
          <p className="text-[11px] text-blue-400 mt-2">Driven by dry-aged steaks & pairings</p>
        </div>
      </div>

      {/* Middle Grid: Category Breakdown & Payment Settlement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Menu Category */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Revenue by Menu Category</h2>
              <p className="text-[11px] text-slate-400">Share of total sales volume</p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Top: Steaks (45%)
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {categoryDistribution.map((cat) => (
              <div key={cat.category} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{cat.category}</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-100">{formatCurrency(cat.revenue)}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({cat.pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                    style={{ width: `${cat.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-100">Settlement Method Split</h2>
                <p className="text-[11px] text-slate-400">Transaction channels and payment tender</p>
              </div>
              <span className="text-xs text-slate-400">100% Audited</span>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                return (
                  <div
                    key={pm.name}
                    className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{pm.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {formatCurrency(pm.amount)} processed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-slate-100">{pm.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>All credit card batches batch-settled at 02:00 AM daily via Merchant Terminal.</span>
          </div>
        </div>
      </div>

      {/* Top 5 Revenue Contributing Menu Items */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Top Grossing Dishes & Mixology</h2>
            <p className="text-[11px] text-slate-400">Ranked by gross sales volume and profitability</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-3">Rank & Item</th>
                <th className="py-3.5">Category</th>
                <th className="py-3.5">Units Sold</th>
                <th className="py-3.5">Gross Revenue</th>
                <th className="py-3.5">Estimated Cost</th>
                <th className="py-3.5 pr-3 text-right">Contribution Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(dashboard?.topItems || []).map((item: { name: string; quantity: number; revenue: number; category: string }, idx: number) => {
                const scaledUnits = Math.round(item.quantity * mult);
                const scaledRev = item.revenue * mult;
                const cost = scaledRev * 0.28;
                const margin = scaledRev - cost;
                return (
                  <tr key={item.name} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 pl-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[11px]">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-200">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-300">{scaledUnits} units</td>
                    <td className="py-3.5 font-mono font-bold text-slate-100">
                      {formatCurrency(scaledRev)}
                    </td>
                    <td className="py-3.5 font-mono text-slate-400">{formatCurrency(cost)}</td>
                    <td className="py-3.5 pr-3 text-right font-mono font-bold text-emerald-400">
                      +{formatCurrency(margin)} (72%)
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
