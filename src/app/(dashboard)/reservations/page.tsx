"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  UtensilsCrossed,
  LayoutGrid,
  Filter,
  Check,
  X,
  ChevronRight,
  Flame,
  Wine,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { usePosStore } from "@/stores/pos-store";
import { cn } from "@/lib/utils";

interface Reservation {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  guestCount: number;
  date: string;
  time: string;
  durationMinutes: number;
  status: "PENDING" | "CONFIRMED" | "SEATED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  tableId?: string;
  tableLabel?: string;
  floorName?: string;
  note?: string;
  specialRequests?: string;
  createdAt: string;
}

interface TableOption {
  id: string;
  label: string;
  capacity: number;
  floorName: string;
  status: string;
}

export default function ReservationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split("T")[0];

  const [dateFilter, setDateFilter] = useState<string>(todayStr);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const { setTable, setCustomerCount } = usePosStore();

  // New Reservation Form State
  const [formData, setFormData] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    guestCount: 2,
    date: todayStr,
    time: "19:00",
    durationMinutes: 90,
    tableId: "",
    note: "",
    specialRequests: "",
  });

  // Fetch Reservations
  const { data: resData, isLoading } = useQuery<{ success: boolean; data: Reservation[] }>({
    queryKey: ["reservations-list", dateFilter, statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFilter) params.append("date", dateFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/reservations?${params.toString()}`);
      return res.json();
    },
    refetchInterval: 10000,
  });

  // Fetch Tables for selection
  const { data: tablesData } = useQuery<{ success: boolean; data: TableOption[] }>({
    queryKey: ["tables-selection"],
    queryFn: async () => {
      const res = await fetch("/api/tables");
      return res.json();
    },
  });

  const reservations = resData?.data || [];
  const tables = tablesData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const selectedTable = tables.find((t) => t.id === payload.tableId);
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          tableLabel: selectedTable?.label || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create reservation");
      return data;
    },
    onSuccess: () => {
      toast.success("Reservation confirmed and scheduled!");
      queryClient.invalidateQueries({ queryKey: ["reservations-list"] });
      queryClient.invalidateQueries({ queryKey: ["tables-selection"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const seatMutation = useMutation({
    mutationFn: async (reservation: Reservation) => {
      const res = await fetch(`/api/reservations/${reservation.id}/seat`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seat reservation");
      return { data, reservation };
    },
    onSuccess: ({ data, reservation }) => {
      toast.success(data.message || `Guest ${reservation.guestName} is now seated!`, {
        action: reservation.tableId
          ? {
              label: "Open POS Order",
              onClick: () => {
                setTable(reservation.tableId!, reservation.tableLabel || null);
                setCustomerCount(reservation.guestCount);
                router.push("/pos");
              },
            }
          : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["reservations-list"] });
      queryClient.invalidateQueries({ queryKey: ["tables-floorplan"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update reservation status");
      return data;
    },
    onSuccess: (_, vars) => {
      toast.success(`Booking status changed to ${vars.status}`);
      queryClient.invalidateQueries({ queryKey: ["reservations-list"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const resetForm = () => {
    setFormData({
      guestName: "",
      guestPhone: "",
      guestEmail: "",
      guestCount: 2,
      date: todayStr,
      time: "19:00",
      durationMinutes: 90,
      tableId: "",
      note: "",
      specialRequests: "",
    });
  };

  // KPIs
  const totalBookings = reservations.length;
  const confirmedCount = reservations.filter((r) => r.status === "CONFIRMED").length;
  const seatedCount = reservations.filter((r) => r.status === "SEATED").length;
  const totalGuests = reservations.reduce((sum, r) => sum + r.guestCount, 0);

  const getStatusBadge = (status: Reservation["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "PENDING":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "SEATED":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "COMPLETED":
        return "bg-slate-800 text-slate-300 border-slate-700";
      case "CANCELLED":
      case "NO_SHOW":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Host & Reception Concierge</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Table Reservations & Guest Bookings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage floor pacing, VIP arrival preferences, and seamless 1-click table seating.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tables"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all flex items-center gap-2"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Floor Plan</span>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Scheduled</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
            {isLoading ? "..." : totalBookings}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Covering <span className="text-amber-400 font-semibold">{totalGuests} total guests</span>
          </p>
        </div>

        {/* Confirmed Arrivals */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Confirmed Arrivals</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
            {isLoading ? "..." : confirmedCount}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">Ready for immediate seating</p>
        </div>

        {/* Currently Seated */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Currently Seated</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
            {isLoading ? "..." : seatedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dining on active service floor</p>
        </div>

        {/* Peak Rush Slot */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Prime Dinner Pacing</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-100 tracking-tight">
            19:00 — 21:00
          </div>
          <p className="text-[11px] text-purple-400/90 mt-1">Highest table occupancy window</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["ALL", "CONFIRMED", "PENDING", "SEATED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                statusFilter === status
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {status === "ALL" ? "All Bookings" : status}
            </button>
          ))}
        </div>

        {/* Search & Date Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guest or table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-56 pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none [color-scheme:dark]"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="text-[10px] text-slate-500 hover:text-slate-300 ml-1"
                title="Show all dates"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reservations List */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-500 text-xs">
          Loading reservations and concierge log...
        </div>
      ) : reservations.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No reservations found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No bookings match the selected filters or date. Click &quot;New Reservation&quot; to book a table for arriving guests.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold border border-amber-500/20 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book New Reservation</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservations.map((res) => {
            const isVIP =
              res.specialRequests?.toLowerCase().includes("vip") ||
              res.note?.toLowerCase().includes("vip") ||
              res.specialRequests?.toLowerCase().includes("champagne") ||
              res.specialRequests?.toLowerCase().includes("dom pérignon");

            return (
              <div
                key={res.id}
                className={cn(
                  "p-5 rounded-2xl bg-slate-900/90 border shadow-lg transition-all flex flex-col justify-between group",
                  res.status === "SEATED"
                    ? "border-blue-500/30 bg-blue-950/10"
                    : isVIP
                    ? "border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-transparent"
                    : "border-slate-800 hover:border-slate-700"
                )}
              >
                <div>
                  {/* Card Header: Time, Status, VIP tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{res.time}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {res.durationMinutes} min
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isVIP && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>VIP</span>
                        </span>
                      )}
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          getStatusBadge(res.status)
                        )}
                      >
                        {res.status}
                      </span>
                    </div>
                  </div>

                  {/* Guest Name & Party Details */}
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                      {res.guestName}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold text-slate-200">{res.guestCount} Guests</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold text-amber-400/90">
                          {res.tableLabel ? `Table ${res.tableLabel}` : "Unassigned"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 py-2 border-y border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-[11px]">{res.guestPhone}</span>
                    </div>
                    {res.guestEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-[11px] truncate text-slate-400">{res.guestEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes & Special Requests */}
                  {(res.specialRequests || res.note) && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs">
                      {res.specialRequests && (
                        <div className="flex items-start gap-1.5 text-amber-400/90">
                          <Wine className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-relaxed font-medium">
                            {res.specialRequests}
                          </span>
                        </div>
                      )}
                      {res.note && (
                        <p className="text-[11px] text-slate-400 leading-relaxed italic pl-5">
                          &ldquo;{res.note}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {res.status === "PENDING" && (
                    <button
                      onClick={() =>
                        updateStatusMutation.mutate({ id: res.id, status: "CONFIRMED" })
                      }
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </button>
                  )}

                  {res.status !== "SEATED" && res.status !== "CANCELLED" && (
                    <button
                      onClick={() => seatMutation.mutate(res)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Seat Guests</span>
                    </button>
                  )}

                  {res.status === "SEATED" && (
                    <button
                      onClick={() => {
                        if (res.tableId) {
                          setTable(res.tableId, res.tableLabel || null);
                          setCustomerCount(res.guestCount);
                          router.push("/pos");
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold border border-blue-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5 text-blue-400" />
                      <span>Open POS Terminal</span>
                    </button>
                  )}

                  {res.status !== "CANCELLED" && res.status !== "COMPLETED" && (
                    <button
                      onClick={() =>
                        updateStatusMutation.mutate({ id: res.id, status: "CANCELLED" })
                      }
                      title="Cancel reservation"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Reservation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Grand Dining Concierge</span>
                </div>
                <h2 className="text-lg font-bold text-slate-100">Create Table Reservation</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin"
            >
              {/* Guest Name & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lord Montgomery"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Guest Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="guest@luxury.com"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Guest Count & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Party Size (Guests) *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          guestCount: Math.max(1, formData.guestCount - 1),
                        })
                      }
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-center font-bold text-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={formData.guestCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          guestCount: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full text-center py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          guestCount: Math.min(30, formData.guestCount + 1),
                        })
                      }
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-center font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Seating Duration
                  </label>
                  <select
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value={60}>1 hour (Casual)</option>
                    <option value={90}>1.5 hours (Standard)</option>
                    <option value={120}>2 hours (Fine Dining)</option>
                    <option value={150}>2.5 hours (Tasting Menu)</option>
                    <option value={180}>3 hours (VIP Celebration)</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Reservation Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Arrival Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Assigned Table */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assigned Dining Table (Optional)
                </label>
                <select
                  value={formData.tableId}
                  onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Assign Later on Arrival --</option>
                  {tables.map((tbl) => (
                    <option key={tbl.id} value={tbl.id}>
                      Table {tbl.label} • {tbl.floorName} ({tbl.capacity} Seats) [{tbl.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Special Occasion & Requests
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10th Anniversary, champagne on ice, quiet booth"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Dietary / Internal Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Internal Concierge Note / Dietary Restrictions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Peanut allergy, regular guest preference"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {createMutation.isPending ? "Confirming..." : "Confirm Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
