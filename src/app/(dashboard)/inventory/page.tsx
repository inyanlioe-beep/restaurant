"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  Search,
  Plus,
  AlertTriangle,
  History,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  X,
  Warehouse,
  FileSpreadsheet,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { MockInventoryItem, MockStockMovement } from "@/lib/services/inventory-service";

const CATEGORIES = [
  { id: "ALL", label: "All Items" },
  { id: "MEAT", label: "Meat & Poultry" },
  { id: "SEAFOOD", label: "Fish & Seafood" },
  { id: "DAIRY", label: "Dairy & Cheese" },
  { id: "PRODUCE", label: "Fresh Produce" },
  { id: "DRY_GOODS", label: "Dry Goods & Bakery" },
  { id: "BEVERAGE", label: "Wines & Spirits" },
];

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeItemForAdjust, setActiveItemForAdjust] = useState<MockInventoryItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [adjustType, setAdjustType] = useState<"STOCK_IN" | "STOCK_OUT" | "WASTE" | "ADJUSTMENT">("STOCK_IN");
  const [adjustQty, setAdjustQty] = useState<string>("");
  const [adjustReason, setAdjustReason] = useState<string>("");

  // Queries
  const { data: itemsData, isLoading } = useQuery<{ success: boolean; data: MockInventoryItem[] }>({
    queryKey: ["inventory-items", selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      const res = await fetch(`/api/inventory?${params.toString()}`);
      return res.json();
    },
  });

  const { data: movementsData } = useQuery<{ success: boolean; data: MockStockMovement[] }>({
    queryKey: ["inventory-movements"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/movements");
      return res.json();
    },
    enabled: showHistoryModal,
  });

  // Mutation
  const adjustMutation = useMutation({
    mutationFn: async (payload: {
      itemId: string;
      changeQuantity: number;
      type: string;
      reason: string;
    }) => {
      const res = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Stock level updated successfully");
        queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
        setActiveItemForAdjust(null);
        setAdjustQty("");
        setAdjustReason("");
      } else {
        toast.error(data.error || "Failed to adjust stock");
      }
    },
    onError: () => toast.error("An error occurred while updating stock"),
  });

  const items = itemsData?.data || [];
  const movements = movementsData?.data || [];

  // Summary Metrics
  const totalStockValue = items.reduce((acc, curr) => acc + curr.quantity * curr.costPerUnit, 0);
  const lowStockCount = items.filter((i) => i.status === "LOW_STOCK").length;
  const outOfStockCount = items.filter((i) => i.status === "OUT_OF_STOCK").length;

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItemForAdjust || !adjustQty || Number(adjustQty) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    adjustMutation.mutate({
      itemId: activeItemForAdjust.id,
      changeQuantity: Number(adjustQty),
      type: adjustType,
      reason: adjustReason || `${adjustType} transaction recorded`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
            <Warehouse className="w-3.5 h-3.5" />
            <span>Back of House Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Inventory & Raw Materials Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track ingredient stock levels, low-threshold alerts, spoilage, and supply shipments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all flex items-center gap-2"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Audit Movements</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Inventory Value</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {isLoading ? "..." : formatCurrency(totalStockValue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">{items.length} unique ingredients tracked</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Low Stock Warnings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{lowStockCount} Items</div>
          <p className="text-[11px] text-amber-400/80 mt-1.5">Below reorder threshold point</p>
        </div>

        {/* Out of Stock */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Out of Stock</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{outOfStockCount} Items</div>
          <p className="text-[11px] text-slate-400 mt-1.5">Requires immediate PO purchase</p>
        </div>

        {/* Healthy Stock */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Healthy Stock Ratio</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {items.length > 0
              ? `${Math.round(((items.length - lowStockCount - outOfStockCount) / items.length) * 100)}%`
              : "100%"}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1.5">Sufficient for weekend dinner rush</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredient or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-950/40">
                <th className="py-3.5 pl-5">SKU & Item Name</th>
                <th className="py-3.5">Category</th>
                <th className="py-3.5">Stock Level</th>
                <th className="py-3.5">Min Threshold</th>
                <th className="py-3.5">Unit Cost</th>
                <th className="py-3.5">Total Value</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading inventory records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No ingredients found matching this criteria.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const pct = Math.min(100, Math.round((item.quantity / (item.minQuantity * 2)) * 100));
                  return (
                    <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 pl-5">
                        <div className="font-semibold text-slate-200 text-sm">{item.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">{item.sku}</div>
                      </td>
                      <td className="py-3.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-100 text-sm">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full ${
                              item.status === "OUT_OF_STOCK"
                                ? "bg-rose-500"
                                : item.status === "LOW_STOCK"
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                            }`}
                            style={{ width: `${Math.max(8, pct)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-slate-400">
                        {item.minQuantity} {item.unit}
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">
                        {formatCurrency(item.costPerUnit)} / {item.unit}
                      </td>
                      <td className="py-3.5 font-mono font-bold text-slate-100">
                        {formatCurrency(item.quantity * item.costPerUnit)}
                      </td>
                      <td className="py-3.5">
                        {item.status === "IN_STOCK" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            In Stock
                          </span>
                        )}
                        {item.status === "LOW_STOCK" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            Low Stock
                          </span>
                        )}
                        {item.status === "OUT_OF_STOCK" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-5 text-right">
                        <button
                          onClick={() => {
                            setActiveItemForAdjust(item);
                            setAdjustType("STOCK_IN");
                            setAdjustQty("");
                            setAdjustReason("");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold transition-all"
                        >
                          Restock / Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {activeItemForAdjust && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveItemForAdjust(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Adjust Inventory Level</h3>
                <p className="text-xs text-slate-400">
                  {activeItemForAdjust.name} ({activeItemForAdjust.sku})
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl mb-4 text-xs flex justify-between">
              <div>
                <span className="text-slate-500">Current Stock:</span>
                <p className="font-mono font-bold text-slate-200 mt-0.5">
                  {activeItemForAdjust.quantity} {activeItemForAdjust.unit}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Min Threshold:</span>
                <p className="font-mono text-slate-400 mt-0.5">
                  {activeItemForAdjust.minQuantity} {activeItemForAdjust.unit}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Unit Cost:</span>
                <p className="font-mono text-slate-200 mt-0.5">
                  {formatCurrency(activeItemForAdjust.costPerUnit)}
                </p>
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "STOCK_IN", label: "Restock (In)", color: "text-emerald-400" },
                    { id: "STOCK_OUT", label: "Requisition (Out)", color: "text-amber-400" },
                    { id: "WASTE", label: "Spoilage / Waste", color: "text-rose-400" },
                    { id: "ADJUSTMENT", label: "Audit Count (Set)", color: "text-blue-400" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAdjustType(t.id as unknown as typeof adjustType)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        adjustType === t.id
                          ? "bg-slate-800 border-amber-500/60 text-slate-100 shadow-md"
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      <span className={t.color}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Quantity ({activeItemForAdjust.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder={
                    adjustType === "ADJUSTMENT"
                      ? "Enter new physical count..."
                      : `Enter amount to ${adjustType === "STOCK_IN" ? "add" : "deduct"}...`
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reason / Reference Note
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Supplier Invoice #PO-941 or Prep Waste"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveItemForAdjust(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {adjustMutation.isPending ? "Processing..." : "Confirm Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Audit Drawer/Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Stock Movement Audit Log</h3>
                  <p className="text-[11px] text-slate-400">Historical stock ins, requisitions, and adjustments</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {movements.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-500">No stock movements recorded yet.</p>
              ) : (
                movements.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{m.itemName}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            m.type === "STOCK_IN"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : m.type === "WASTE"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {m.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{m.reason}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">By {m.performedBy}</p>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-200">
                        {m.type === "STOCK_IN" ? "+" : "-"}
                        {m.quantity}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {m.previousQuantity} ➔ {m.newQuantity}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {formatDate(m.createdAt, "dd MMM HH:mm")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-all"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
