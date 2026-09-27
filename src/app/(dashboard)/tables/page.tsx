"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutGrid,
  Users,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
  RefreshCw,
  Plus,
  Receipt,
  X,
} from "lucide-react";
import { usePosStore } from "@/stores/pos-store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface TableItem {
  id: string;
  label: string;
  capacity: number;
  shape: "rectangle" | "circle" | "square";
  posX: number;
  posY: number;
  floorId: string;
  floorName: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING";
  currentOrderId?: string;
  currentBill?: number;
}

export default function TablesManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedFloor, setSelectedFloor] = useState<string>("ALL");
  const [activeTableForModal, setActiveTableForModal] = useState<TableItem | null>(null);

  const { setTable } = usePosStore();

  const { data: tablesData, isLoading } = useQuery<{ success: boolean; data: TableItem[] }>({
    queryKey: ["tables-floorplan", selectedFloor],
    queryFn: async () => {
      const url = selectedFloor === "ALL" ? "/api/tables" : `/api/tables?floorId=${selectedFloor}`;
      const res = await fetch(url);
      return res.json();
    },
    refetchInterval: 10000,
  });

  const updateTableStatusMutation = useMutation({
    mutationFn: async ({
      tableId,
      status,
    }: {
      tableId: string;
      status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING";
    }) => {
      const res = await fetch(`/api/tables/${tableId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: (data, vars) => {
      if (data.success) {
        toast.success(`Table ${vars.status.toLowerCase()}`);
        queryClient.invalidateQueries({ queryKey: ["tables-floorplan"] });
        queryClient.invalidateQueries({ queryKey: ["pos-tables"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-reports"] });
        setActiveTableForModal(null);
      } else {
        toast.error(data.error || "Failed to update table status");
      }
    },
  });

  const allTables: TableItem[] = tablesData?.data || [];
  const floors = Array.from(new Set(allTables.map((t) => t.floorName || "Main Hall"))).map(
    (name) => ({
      name,
      id: allTables.find((t) => t.floorName === name)?.floorId || name,
    })
  );

  const displayedTables =
    selectedFloor === "ALL"
      ? allTables
      : allTables.filter((t) => t.floorId === selectedFloor || t.floorName === selectedFloor);

  const statusConfig = {
    AVAILABLE: {
      label: "Available",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      card: "border-slate-800 bg-slate-900/90 hover:border-emerald-500/60",
      ring: "hover:ring-1 hover:ring-emerald-500/30",
    },
    OCCUPIED: {
      label: "Occupied",
      badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      card: "border-rose-900/40 bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 hover:border-rose-500/60",
      ring: "hover:ring-1 hover:ring-rose-500/30",
    },
    RESERVED: {
      label: "Reserved",
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      card: "border-amber-900/40 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 hover:border-amber-500/60",
      ring: "hover:ring-1 hover:ring-amber-500/30",
    },
    CLEANING: {
      label: "Needs Bussing",
      badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      card: "border-blue-900/40 bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900 hover:border-blue-500/60",
      ring: "hover:ring-1 hover:ring-blue-500/30",
    },
  };

  const handleOpenPOSForTable = (table: TableItem) => {
    setTable(table.id, table.label);
    toast.success(`Assigned Table ${table.label} to POS ticket`);
    router.push("/pos");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Floor Plan & Turn Rate</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Dining Room & Table Status</h1>
          <p className="text-xs text-slate-400 mt-1">
            Live seating occupancy, dining status, guest count capacity, and quick POS association.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400 text-[11px]">Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span className="text-slate-400 text-[11px]">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-slate-400 text-[11px]">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-slate-400 text-[11px]">Cleaning</span>
          </div>
        </div>
      </div>

      {/* Floor Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedFloor("ALL")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedFloor === "ALL"
              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          All Dining Areas
        </button>
        {floors.map((fl) => (
          <button
            key={fl.id}
            onClick={() => setSelectedFloor(fl.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedFloor === fl.id
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {fl.name}
          </button>
        ))}
      </div>

      {/* Tables Grid Layout */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
          Loading floor plan layout...
        </div>
      ) : displayedTables.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <LayoutGrid className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold">No tables found on this floor</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayedTables.map((table) => {
            const conf = statusConfig[table.status];

            return (
              <div
                key={table.id}
                onClick={() => setActiveTableForModal(table)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between shadow-lg ${conf.card} ${conf.ring}`}
              >
                {/* Top: Label and Status Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black font-mono text-slate-100 group-hover:text-amber-400 transition-colors">
                      {table.label}
                    </h3>
                    <p className="text-[10px] text-slate-500">{table.floorName}</p>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${conf.badge}`}
                  >
                    {conf.label}
                  </span>
                </div>

                {/* Center: Capacity Shape Graphic */}
                <div className="py-6 flex flex-col items-center justify-center">
                  <div
                    className={`w-14 h-14 flex items-center justify-center border-2 border-dashed ${
                      table.shape === "circle" ? "rounded-full" : "rounded-xl"
                    } ${
                      table.status === "OCCUPIED"
                        ? "border-rose-500/50 bg-rose-500/10 text-rose-300"
                        : table.status === "AVAILABLE"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                        : "border-slate-700 bg-slate-800/60 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-1 font-mono text-xs font-bold">
                      <Users className="w-3.5 h-3.5" />
                      <span>{table.capacity}p</span>
                    </div>
                  </div>

                  {table.currentBill && (
                    <span className="mt-2 text-xs font-mono font-bold text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                      {formatCurrency(table.currentBill)}
                    </span>
                  )}
                </div>

                {/* Bottom: Quick Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 text-[10px] font-medium capitalize">
                    {table.shape}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPOSForTable(table);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                  >
                    <UtensilsCrossed className="w-3 h-3" />
                    <span>POS</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TABLE ACTION MODAL ────────────────────────────────────── */}
      {activeTableForModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Table {activeTableForModal.label} Details
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeTableForModal.floorName} • Capacity {activeTableForModal.capacity} guests
                </p>
              </div>
              <button
                onClick={() => setActiveTableForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Set Table Status</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() =>
                      updateTableStatusMutation.mutate({
                        tableId: activeTableForModal.id,
                        status: st,
                      })
                    }
                    className={`p-2.5 rounded-xl border font-semibold transition-all ${
                      activeTableForModal.status === st
                        ? "border-amber-500 bg-amber-500/20 text-amber-300"
                        : "border-slate-800 bg-slate-850 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {st === "AVAILABLE"
                      ? "Available"
                      : st === "OCCUPIED"
                      ? "Occupied"
                      : st === "RESERVED"
                      ? "Reserved"
                      : "Cleaning / Clear"}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex justify-between gap-2">
              <button
                onClick={() => setActiveTableForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleOpenPOSForTable(activeTableForModal)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Open in POS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
