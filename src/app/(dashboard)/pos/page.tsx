"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  CreditCard,
  Banknote,
  RotateCcw,
  Sparkles,
  Users,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Printer,
  X,
  FileText,
} from "lucide-react";
import { usePosStore, CartModifier } from "@/stores/pos-store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface MenuItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isPopular: boolean;
  categoryId: string;
  prepTime: number;
  modifiers?: {
    id: string;
    name: string;
    type: string;
    isRequired: boolean;
    options: { id: string; label: string; priceAdjust: number; isDefault: boolean }[];
  }[];
}

interface TableData {
  id: string;
  label: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING";
}

export default function POSTerminalPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showModifierModal, setShowModifierModal] = useState<boolean>(false);
  const [activeItemForModifier, setActiveItemForModifier] = useState<MenuItemData | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<CartModifier[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CREDIT_CARD" | "UPI">("CASH");
  const [amountTendered, setAmountTendered] = useState<string>("");
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<Record<string, unknown> | null>(null);

  const {
    orderType,
    selectedTableId,
    selectedTableLabel,
    customerCount,
    items,
    discountPercentage,
    taxRate,
    setOrderType,
    setTable,
    setCustomerCount,
    setDiscountPercentage,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getTaxAmount,
    getTotalAmount,
    getItemCount,
  } = usePosStore();

  // Queries
  const { data: catData } = useQuery({
    queryKey: ["pos-categories"],
    queryFn: async () => {
      const res = await fetch("/api/menu/categories");
      return res.json();
    },
  });

  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ["pos-menu-items", selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.append("categoryId", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      const res = await fetch(`/api/menu/items?${params.toString()}`);
      return res.json();
    },
  });

  const { data: tablesData } = useQuery({
    queryKey: ["pos-tables"],
    queryFn: async () => {
      const res = await fetch("/api/tables");
      return res.json();
    },
  });

  // Mutations
  const sendToKitchenMutation = useMutation({
    mutationFn: async () => {
      if (items.length === 0) throw new Error("Ticket is empty");
      const payload = {
        tableId: selectedTableId,
        tableLabel: selectedTableLabel,
        type: orderType,
        customerCount,
        discount: getDiscountAmount(),
        taxRate,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          note: i.note,
          modifiers: i.modifiers.map((m) => ({ label: m.optionLabel, priceAdjust: m.priceAdjust })),
        })),
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Order #${data.data.orderNumber} sent to Kitchen KDS!`);
        queryClient.invalidateQueries({ queryKey: ["pos-tables"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-reports"] });
        clearCart();
      } else {
        toast.error(data.error || "Failed to submit order");
      }
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      const total = getTotalAmount();
      // First create or finish order
      const orderPayload = {
        tableId: selectedTableId,
        tableLabel: selectedTableLabel,
        type: orderType,
        customerCount,
        discount: getDiscountAmount(),
        taxRate,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          note: i.note,
          modifiers: i.modifiers.map((m) => ({ label: m.optionLabel, priceAdjust: m.priceAdjust })),
        })),
      };
      const orderRes = await (
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        })
      ).json();

      if (!orderRes.success) throw new Error("Could not register order");

      const paymentRes = await (
        await fetch("/api/billing/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderRes.data.id,
            amount: total,
            method: paymentMethod,
            tipAmount: 0,
          }),
        })
      ).json();

      return { order: orderRes.data, payment: paymentRes.data };
    },
    onSuccess: (result) => {
      toast.success("Payment completed successfully!");
      setPaymentSuccessReceipt({
        orderNumber: result.order.orderNumber,
        items: [...items],
        subtotal: getSubtotal(),
        tax: getTaxAmount(),
        discount: getDiscountAmount(),
        total: getTotalAmount(),
        paymentMethod,
        date: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ["pos-tables"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-reports"] });
      clearCart();
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
  });

  const handleItemClick = (item: MenuItemData) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setActiveItemForModifier(item);
      const defaults: CartModifier[] = [];
      item.modifiers.forEach((m) => {
        const defaultOpt = m.options.find((o) => o.isDefault) || m.options[0];
        if (defaultOpt) {
          defaults.push({
            modifierId: m.id,
            modifierName: m.name,
            optionId: defaultOpt.id,
            optionLabel: defaultOpt.label,
            priceAdjust: defaultOpt.priceAdjust,
          });
        }
      });
      setSelectedModifiers(defaults);
      setShowModifierModal(true);
    } else {
      addItem({
        menuItemId: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        price: Number(item.price),
      });
      toast.success(`Added ${item.name}`);
    }
  };

  const handleConfirmModifiers = () => {
    if (activeItemForModifier) {
      addItem({
        menuItemId: activeItemForModifier.id,
        name: activeItemForModifier.name,
        imageUrl: activeItemForModifier.imageUrl,
        price: Number(activeItemForModifier.price),
        modifiers: selectedModifiers,
      });
      toast.success(`Added ${activeItemForModifier.name}`);
      setShowModifierModal(false);
      setActiveItemForModifier(null);
    }
  };

  const categories = [{ id: "ALL", name: "All Items" }, ...(catData?.data || [])];
  const menuItems: MenuItemData[] = menuData?.data || [];
  const tables: TableData[] = tablesData?.data || [];

  const subtotal = getSubtotal();
  const tax = getTaxAmount();
  const discount = getDiscountAmount();
  const total = getTotalAmount();
  const tenderedNum = parseFloat(amountTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - total);

  return (
    <div className="h-[calc(100vh-5.5rem)] flex gap-5 select-none">
      {/* ── LEFT PANE: MENU BROWSER & CATALOG ───────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Top Control Bar: Category Tabs & Search */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu items by name or keywords..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-slate-100 border border-slate-750"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {menuLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 animate-pulse">
              Loading culinary catalog...
            </div>
          ) : menuItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-semibold">No items found</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Try searching for something else</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.isAvailable && handleItemClick(item)}
                  className={`group relative rounded-xl bg-slate-850/80 border border-slate-800 p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/5 active:scale-[0.98] ${
                    !item.isAvailable ? "opacity-40 pointer-events-none grayscale" : ""
                  }`}
                >
                  {/* Photo & Badges */}
                  <div className="w-full h-28 rounded-lg overflow-hidden relative mb-2.5 bg-slate-900">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    {item.isPopular && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-500/90 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                        Chef Pick
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] font-mono flex items-center gap-1 border border-white/10">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {item.prepTime}m
                    </span>
                  </div>

                  {/* Item Details */}
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Add Indicator */}
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {formatCurrency(item.price)}
                    </span>
                    <button className="w-6 h-6 rounded-lg bg-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-400 flex items-center justify-center transition-all">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANE: LIVE ORDER TICKET / CART ──────────────────────── */}
      <div className="w-96 flex flex-col bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden shrink-0">
        {/* Order Header / Table Selector */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-3">
          {/* Order Type Toggle */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold text-slate-300">
            {(["DINE_IN", "TAKEAWAY", "DELIVERY"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-1 rounded-lg transition-all ${
                  orderType === type
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "hover:text-slate-100"
                }`}
              >
                {type === "DINE_IN" ? "Dine In" : type === "TAKEAWAY" ? "Takeaway" : "Delivery"}
              </button>
            ))}
          </div>

          {/* Table & Guest Count Row */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setShowTableModal(true)}
              className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-xs transition-all"
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-slate-200">
                  {selectedTableLabel ? `Table ${selectedTableLabel}` : "Assign Table"}
                </span>
              </div>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-mono font-bold">
                {selectedTableId ? "Selected" : "Select"}
              </span>
            </button>

            {/* Guest Count Stepper */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => setCustomerCount(Math.max(1, customerCount - 1))}
                className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
              >
                -
              </button>
              <span className="w-4 text-center font-mono font-bold text-slate-200">
                {customerCount}
              </span>
              <button
                onClick={() => setCustomerCount(customerCount + 1)}
                className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Live Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-850 flex items-center justify-center mb-2 text-slate-600 border border-slate-800">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-400">Order ticket is empty</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Select menu dishes from the left</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartItemId}
                className="p-3 rounded-xl bg-slate-850/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.name}</h4>
                    <span className="text-[11px] font-mono text-amber-400 font-semibold">
                      {formatCurrency(item.unitPrice)} each
                    </span>
                  </div>
                  <button
                    onClick={() => removeItem(item.cartItemId)}
                    className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Modifiers List */}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.modifiers.map((m, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/60"
                      >
                        {m.optionLabel} {m.priceAdjust > 0 && `(+${formatCurrency(m.priceAdjust)})`}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-xs text-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-100">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Calculation Summary */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal ({getItemCount()} items)</span>
            <span className="font-mono text-slate-200">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <div className="flex items-center gap-1">
              <span>Discount</span>
              <button
                onClick={() => setDiscountPercentage(discountPercentage === 0 ? 10 : 0)}
                className="text-[10px] text-amber-400 hover:underline"
              >
                ({discountPercentage}% toggle)
              </button>
            </div>
            <span className="font-mono text-rose-400">-{formatCurrency(discount)}</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Estimated Tax (NYC 8.875%)</span>
            <span className="font-mono text-slate-200">{formatCurrency(tax)}</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-100">Total Check</span>
            <span className="text-lg font-black font-mono text-amber-400">
              {formatCurrency(total)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => sendToKitchenMutation.mutate()}
              disabled={items.length === 0 || sendToKitchenMutation.isPending}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs border border-slate-700/80 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Send Kitchen</span>
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={items.length === 0}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 active:scale-95"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Checkout</span>
            </button>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="w-full text-center text-[10px] text-slate-500 hover:text-rose-400 pt-1 transition-colors"
            >
              Clear Current Ticket
            </button>
          )}
        </div>
      </div>

      {/* ── MODAL: TABLE SELECTOR ──────────────────────────────────── */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Select Dining Table</h3>
                <p className="text-[11px] text-slate-400">Choose an available table for this party</p>
              </div>
              <button
                onClick={() => setShowTableModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1 scrollbar-thin">
              {tables.map((t) => {
                const isSelected = selectedTableId === t.id;
                const statusStyles = {
                  AVAILABLE: "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500 text-emerald-300",
                  OCCUPIED: "border-rose-500/40 bg-rose-500/5 hover:border-rose-500 text-rose-300",
                  RESERVED: "border-amber-500/40 bg-amber-500/5 text-amber-300",
                  CLEANING: "border-blue-500/40 bg-blue-500/5 text-blue-300",
                };

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setTable(t.id, t.label);
                      setShowTableModal(false);
                      toast.info(`Assigned to Table ${t.label}`);
                    }}
                    className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected ? "ring-2 ring-amber-500 bg-amber-500/10" : statusStyles[t.status]
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black font-mono">{t.label}</span>
                      <span className="text-[10px] font-semibold">{t.capacity}p</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider mt-2">
                      {t.status}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setTable(null, null);
                  setShowTableModal(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Clear Table Assignment
              </button>
              <button
                onClick={() => setShowTableModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MODIFIER BUILDER ───────────────────────────────── */}
      {showModifierModal && activeItemForModifier && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{activeItemForModifier.name}</h3>
                <p className="text-[11px] text-slate-400">Customize temperatures and accompaniments</p>
              </div>
              <button
                onClick={() => setShowModifierModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto scrollbar-thin pr-1">
              {activeItemForModifier.modifiers?.map((mod) => (
                <div key={mod.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span>{mod.name}</span>
                    {mod.isRequired && (
                      <span className="text-[10px] text-amber-400 font-normal">Required</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {mod.options.map((opt) => {
                      const isSelected = selectedModifiers.some(
                        (m) => m.modifierId === mod.id && m.optionId === opt.id
                      );

                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            if (mod.type === "SELECT") {
                              const filtered = selectedModifiers.filter((m) => m.modifierId !== mod.id);
                              setSelectedModifiers([
                                ...filtered,
                                {
                                  modifierId: mod.id,
                                  modifierName: mod.name,
                                  optionId: opt.id,
                                  optionLabel: opt.label,
                                  priceAdjust: opt.priceAdjust,
                                },
                              ]);
                            } else {
                              if (isSelected) {
                                setSelectedModifiers(
                                  selectedModifiers.filter(
                                    (m) => !(m.modifierId === mod.id && m.optionId === opt.id)
                                  )
                                );
                              } else {
                                setSelectedModifiers([
                                  ...selectedModifiers,
                                  {
                                    modifierId: mod.id,
                                    modifierName: mod.name,
                                    optionId: opt.id,
                                    optionLabel: opt.label,
                                    priceAdjust: opt.priceAdjust,
                                  },
                                ]);
                              }
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 text-amber-300 font-semibold"
                              : "border-slate-800 bg-slate-850/60 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className="font-mono text-[11px]">
                            {opt.priceAdjust > 0 ? `+${formatCurrency(opt.priceAdjust)}` : "Included"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200">
                Item Total:{" "}
                {formatCurrency(
                  Number(activeItemForModifier.price) +
                    selectedModifiers.reduce((acc, m) => acc + m.priceAdjust, 0)
                )}
              </span>
              <button
                onClick={handleConfirmModifiers}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                Add to Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PAYMENT CHECKOUT & RECEIPT ──────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            {!paymentSuccessReceipt ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Process Guest Payment</h3>
                    <p className="text-[11px] text-slate-400">
                      Table {selectedTableLabel || "Quick Order"} • {getItemCount()} items
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount Due Banner */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Total Amount Due</span>
                  <span className="text-2xl font-black font-mono text-amber-400">
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Payment Tender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "CASH", label: "Cash", icon: Banknote },
                      { id: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
                      { id: "UPI", label: "Mobile / UPI", icon: Sparkles },
                    ].map((m) => {
                      const Icon = m.icon;
                      const active = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as "CASH" | "CREDIT_CARD" | "UPI")}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                            active
                              ? "border-amber-500 bg-amber-500/15 text-amber-300 font-bold"
                              : "border-slate-800 bg-slate-850 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-xs">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cash Calculations */}
                {paymentMethod === "CASH" && (
                  <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Amount Tendered</label>
                      <input
                        type="number"
                        step="0.01"
                        value={amountTendered}
                        onChange={(e) => setAmountTendered(e.target.value)}
                        placeholder={`e.g. ${Math.ceil(total)}`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="flex justify-between items-baseline pt-1 font-mono">
                      <span className="text-slate-400">Change Due:</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {formatCurrency(changeDue)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => processPaymentMutation.mutate()}
                    disabled={processPaymentMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {processPaymentMutation.isPending ? "Finalizing..." : "Complete & Print Receipt"}
                  </button>
                </div>
              </>
            ) : (
              /* Receipt View */
              <div className="space-y-4">
                <div className="text-center py-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">Payment Approved</h3>
                  <p className="text-[11px] text-slate-400">Order #{paymentSuccessReceipt.orderNumber as number} Settled</p>
                </div>

                <div className="p-4 rounded-xl bg-white text-slate-950 font-mono text-xs space-y-2 border border-slate-300 shadow-md">
                  <div className="text-center pb-2 border-b border-dashed border-slate-400">
                    <p className="font-black text-sm">LE MAJESTIC BISTRO</p>
                    <p className="text-[10px]">123 Culinary Blvd, New York</p>
                    <p className="text-[10px]">{new Date().toLocaleString()}</p>
                  </div>

                  <div className="divide-y divide-dashed divide-slate-300 py-1">
                    {(paymentSuccessReceipt.items as { name: string; quantity: number; unitPrice: number }[]).map(
                      (item, idx) => (
                        <div key={idx} className="py-1 flex justify-between text-[11px]">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="pt-2 border-t border-dashed border-slate-400 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(paymentSuccessReceipt.subtotal as number)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8.875%):</span>
                      <span>{formatCurrency(paymentSuccessReceipt.tax as number)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-400">
                      <span>Total Paid:</span>
                      <span>{formatCurrency(paymentSuccessReceipt.total as number)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => {
                      setPaymentSuccessReceipt(null);
                      setShowPaymentModal(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    Next Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
