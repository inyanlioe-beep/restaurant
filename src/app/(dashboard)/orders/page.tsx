"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  Filter,
  Check,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface OrderData {
  id: string;
  orderNumber: number;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
  type: string;
  tableLabel?: string;
  customerCount?: number;
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  note?: string;
  createdAt: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    modifiers?: { label: string; priceAdjust: number }[];
  }[];
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const { data, isLoading } = useQuery<{ success: boolean; data: OrderData[] }>({
    queryKey: ["orders-list", selectedStatus],
    queryFn: async () => {
      const url = selectedStatus === "ALL" ? "/api/orders" : `/api/orders?status=${selectedStatus}`;
      const res = await fetch(url);
      return res.json();
    },
    refetchInterval: 8000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, nextStatus }: { orderId: string; nextStatus: string }) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      return res.json();
    },
    onSuccess: (res, vars) => {
      if (res.success) {
        toast.success(`Order updated to ${vars.nextStatus}`);
        queryClient.invalidateQueries({ queryKey: ["orders-list"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-reports"] });
        queryClient.invalidateQueries({ queryKey: ["pos-tables"] });
        if (selectedOrder && selectedOrder.id === vars.orderId) {
          setSelectedOrder({ ...selectedOrder, status: vars.nextStatus as OrderData["status"] });
        }
      } else {
        toast.error(res.error || "Failed to update order");
      }
    },
  });

  const orders = (data?.data || []).filter((o) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      o.orderNumber.toString().includes(query) ||
      (o.tableLabel && o.tableLabel.toLowerCase().includes(query)) ||
      o.items.some((i) => i.name.toLowerCase().includes(query))
    );
  });

  const statusFilters = [
    { id: "ALL", label: "All Orders" },
    { id: "PREPARING", label: "Preparing (Kitchen)" },
    { id: "READY", label: "Ready to Serve" },
    { id: "SERVED", label: "Served / Dining" },
    { id: "COMPLETED", label: "Completed" },
  ];

  const getNextStatus = (current: string): { label: string; status: string; color: string } | null => {
    switch (current) {
      case "PENDING":
      case "CONFIRMED":
        return { label: "Start Cooking", status: "PREPARING", color: "bg-blue-600 hover:bg-blue-500" };
      case "PREPARING":
        return { label: "Mark as Ready", status: "READY", color: "bg-purple-600 hover:bg-purple-500" };
      case "READY":
        return { label: "Mark as Served", status: "SERVED", color: "bg-emerald-600 hover:bg-emerald-500" };
      case "SERVED":
        return { label: "Complete & Close", status: "COMPLETED", color: "bg-amber-600 hover:bg-amber-500" };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen & Floor Operations</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Live Orders & Ticket Tracking</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status transitions between kitchen prep, table service, and checkout.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedStatus === f.id
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Orders List & Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, table, or item name..."
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
                Loading live kitchen tickets...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold">No orders found in this view</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {orders.map((order) => {
                  const next = getNextStatus(order.status);
                  const isSelected = selectedOrder?.id === order.id;

                  const statusColors: Record<string, string> = {
                    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
                    PREPARING: "bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse",
                    READY: "bg-purple-500/10 text-purple-400 border-purple-500/30",
                    SERVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                    COMPLETED: "bg-slate-800 text-slate-400 border-slate-700",
                  };

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/60 ${
                        isSelected ? "bg-slate-850 border-l-4 border-amber-500" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-100">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs font-semibold text-slate-300">
                            {order.tableLabel ? `Table ${order.tableLabel}` : order.type}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              statusColors[order.status] || "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span>{formatDate(order.createdAt, "HH:mm")}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Next Transition Trigger */}
                      {next && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              nextStatus: next.status,
                            });
                          }}
                          disabled={updateStatusMutation.isPending}
                          className={`px-3.5 py-1.5 rounded-xl text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto ${next.color}`}
                        >
                          <span>{next.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Detail Inspector */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-lg h-fit space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">Order Inspector</h3>
            {selectedOrder && (
              <span className="text-xs font-mono font-bold text-amber-400">
                #{selectedOrder.orderNumber}
              </span>
            )}
          </div>

          {!selectedOrder ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Select an order from the list to view its complete ticket details and breakdown.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Destination:</span>
                  <span className="font-semibold text-slate-200">
                    {selectedOrder.tableLabel ? `Table ${selectedOrder.tableLabel}` : selectedOrder.type}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Party Size:</span>
                  <span className="text-slate-200">{selectedOrder.customerCount || 2} Guests</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Timestamp:</span>
                  <span className="font-mono text-slate-200">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                {selectedOrder.note && (
                  <div className="pt-1 text-[11px] text-amber-300 font-medium">
                    Note: &quot;{selectedOrder.note}&quot;
                  </div>
                )}
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-300">Items Ordered</h4>
                <div className="divide-y divide-slate-800/80">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-200">
                          {item.quantity}x {item.name}
                        </p>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <p className="text-[10px] text-slate-500">
                            {item.modifiers.map((m) => m.label).join(", ")}
                          </p>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-300">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Tax:</span>
                  <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-amber-400 pt-1 border-t border-slate-800">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
