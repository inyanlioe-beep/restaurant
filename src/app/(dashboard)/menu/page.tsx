"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Search,
  Plus,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  cost?: number;
  imageUrl: string;
  isAvailable: boolean;
  isPopular: boolean;
  categoryId: string;
  categoryName: string;
  prepTime: number;
}

export default function MenuManagementPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: catData } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: async () => {
      const res = await fetch("/api/menu/categories");
      return res.json();
    },
  });

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["menu-items", selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.append("categoryId", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      const res = await fetch(`/api/menu/items?${params.toString()}`);
      return res.json();
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/menu/items/${itemId}/toggle-availability`, {
        method: "PATCH",
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          `${data.data.name} is now ${data.data.isAvailable ? "available" : "sold out"}`
        );
        queryClient.invalidateQueries({ queryKey: ["menu-items"] });
        queryClient.invalidateQueries({ queryKey: ["pos-menu-items"] });
      } else {
        toast.error(data.error || "Failed to update item");
      }
    },
  });

  const categories = [{ id: "ALL", name: "All Categories" }, ...(catData?.data || [])];
  const items: MenuItem[] = itemsData?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Catalog & Inventory 86ing</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Menu & Recipe Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage dish pricing, food cost margins, and live 86 (stock availability) toggles for POS.
          </p>
        </div>

        <button
          onClick={() => toast.info("New dish creation wizard will open")}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Recipe Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu catalog..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Loading menu catalog...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold">No menu items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-950/40">
                  <th className="py-3 pl-4">Dish</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Menu Price</th>
                  <th className="py-3">Food Cost</th>
                  <th className="py-3">Target Margin</th>
                  <th className="py-3">Prep Time</th>
                  <th className="py-3 pr-4 text-right">In Stock (POS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((item) => {
                  const cost = item.cost || item.price * 0.3;
                  const marginPct = Math.round(((item.price - cost) / item.price) * 100);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-850/50 transition-colors group"
                    >
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-slate-800">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                              {item.name}
                              {item.isPopular && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-400 font-medium">
                        {item.categoryName || "Mains"}
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-100">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 font-mono text-slate-400">
                        {formatCurrency(cost)}
                      </td>
                      <td className="py-3 font-mono">
                        <span className="text-emerald-400 font-bold">{marginPct}%</span>
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">
                        {item.prepTime} min
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <button
                          onClick={() => toggleAvailabilityMutation.mutate(item.id)}
                          disabled={toggleAvailabilityMutation.isPending}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            item.isAvailable
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isAvailable ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          ></span>
                          <span>{item.isAvailable ? "Active" : "86'd (Sold Out)"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
