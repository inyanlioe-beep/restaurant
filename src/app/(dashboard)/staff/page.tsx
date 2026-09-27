"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Clock,
  Calendar,
  Plus,
  Coffee,
  CheckCircle2,
  XCircle,
  Shield,
  Phone,
  Mail,
  UserCheck,
  Search,
  Filter,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { MockStaffMember, MockShift } from "@/lib/services/staff-service";

export default function StaffPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"ATTENDANCE" | "SHIFTS">("ATTENDANCE");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [showShiftModal, setShowShiftModal] = useState<boolean>(false);

  // Shift Modal Form State
  const [shiftUserId, setShiftUserId] = useState<string>("");
  const [shiftDate, setShiftDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [shiftStart, setShiftStart] = useState<string>("11:00");
  const [shiftEnd, setShiftEnd] = useState<string>("19:30");
  const [shiftNotes, setShiftNotes] = useState<string>("");

  // Queries
  const { data: staffData, isLoading: staffLoading } = useQuery<{
    success: boolean;
    data: MockStaffMember[];
  }>({
    queryKey: ["staff-members"],
    queryFn: async () => {
      const res = await fetch("/api/staff");
      return res.json();
    },
    refetchInterval: 12000,
  });

  const { data: shiftsData, isLoading: shiftsLoading } = useQuery<{
    success: boolean;
    data: MockShift[];
  }>({
    queryKey: ["staff-shifts"],
    queryFn: async () => {
      const res = await fetch("/api/staff/shifts");
      return res.json();
    },
    enabled: activeTab === "SHIFTS",
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: "CLOCKED_IN" | "ON_BREAK" | "CLOCKED_OUT";
    }) => {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Attendance updated for ${data.data.name}`);
        queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      } else {
        toast.error(data.error || "Failed to update attendance");
      }
    },
    onError: () => toast.error("Error updating attendance"),
  });

  const createShiftMutation = useMutation({
    mutationFn: async (payload: {
      userId: string;
      date: string;
      startTime: string;
      endTime: string;
      notes?: string;
    }) => {
      const res = await fetch("/api/staff/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("New shift scheduled successfully");
        queryClient.invalidateQueries({ queryKey: ["staff-shifts"] });
        setShowShiftModal(false);
        setShiftNotes("");
      } else {
        toast.error(data.error || "Failed to schedule shift");
      }
    },
    onError: () => toast.error("Error scheduling shift"),
  });

  const staff = staffData?.data || [];
  const shifts = shiftsData?.data || [];

  // Metrics
  const clockedInCount = staff.filter((s) => s.attendanceStatus === "CLOCKED_IN").length;
  const onBreakCount = staff.filter((s) => s.attendanceStatus === "ON_BREAK").length;
  const offDutyCount = staff.filter((s) => s.attendanceStatus === "CLOCKED_OUT").length;

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "ALL" || s.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftUserId || !shiftDate || !shiftStart || !shiftEnd) {
      toast.error("Please fill in all required shift fields");
      return;
    }
    createShiftMutation.mutate({
      userId: shiftUserId,
      date: shiftDate,
      startTime: shiftStart,
      endTime: shiftEnd,
      notes: shiftNotes,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Human Capital & Shifts</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Staff Roster & Live Time Attendance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time floor presence, shift rosters, breaks, and section responsibilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (staff.length > 0 && !shiftUserId) {
                setShiftUserId(staff[0].id);
              }
              setShowShiftModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Shift</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Staff Roster</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {staffLoading ? "..." : staff.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">Across front & back of house</p>
        </div>

        {/* On Duty */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active On Duty</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {staffLoading ? "..." : clockedInCount} Staff
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1.5">Currently serving floor & kitchen</p>
        </div>

        {/* On Break */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Staff On Break</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {staffLoading ? "..." : onBreakCount} Staff
          </div>
          <p className="text-[11px] text-amber-400/80 mt-1.5">Meal or rest break in progress</p>
        </div>

        {/* Off Duty */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Off Duty</span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-300 font-mono">
            {staffLoading ? "..." : offDutyCount} Staff
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">Awaiting upcoming evening shift</p>
        </div>
      </div>

      {/* Main Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("ATTENDANCE")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "ATTENDANCE"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Live Attendance & Roster</span>
          </button>
          <button
            onClick={() => setActiveTab("SHIFTS")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "SHIFTS"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Shift Schedule</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Tab 1: Live Attendance & Team Roster */}
      {activeTab === "ATTENDANCE" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffLoading ? (
            <div className="col-span-full py-16 text-center text-slate-400 text-xs">
              Loading staff roster...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 text-xs">
              No staff members found matching your search.
            </div>
          ) : (
            filteredStaff.map((member) => {
              const roleColors: Record<string, string> = {
                SUPER_ADMIN: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                MANAGER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                CHEF: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                WAITER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                STAFF: "bg-slate-800 text-slate-300 border-slate-700",
              };

              return (
                <div
                  key={member.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div>
                    {/* Top Row: Avatar & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700/80 flex items-center justify-center font-bold text-amber-400 text-sm shadow-md">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm">{member.name}</h3>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${
                              roleColors[member.role] || "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {member.role.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {member.attendanceStatus === "CLOCKED_IN" && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          Clocked In
                        </span>
                      )}
                      {member.attendanceStatus === "ON_BREAK" && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Coffee className="w-3 h-3" />
                          On Break
                        </span>
                      )}
                      {member.attendanceStatus === "CLOCKED_OUT" && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Off Duty
                        </span>
                      )}
                    </div>

                    {/* Member Details */}
                    <div className="space-y-1.5 py-3 border-y border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px]">Shift Duty:</span>
                        <span className="font-semibold text-slate-200">{member.assignedShift}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px]">Clock-in Time:</span>
                        <span className="font-mono text-slate-300">{member.clockInTime || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px]">Hours Logged Today:</span>
                        <span className="font-mono font-bold text-amber-400">{member.hoursToday} hrs</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="pt-4 flex items-center gap-2">
                    {member.attendanceStatus !== "CLOCKED_IN" && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({ userId: member.id, status: "CLOCKED_IN" })
                        }
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-all"
                      >
                        Clock In
                      </button>
                    )}
                    {member.attendanceStatus === "CLOCKED_IN" && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({ userId: member.id, status: "ON_BREAK" })
                        }
                        className="flex-1 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold transition-all"
                      >
                        Start Break
                      </button>
                    )}
                    {member.attendanceStatus !== "CLOCKED_OUT" && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({ userId: member.id, status: "CLOCKED_OUT" })
                        }
                        className="flex-1 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all"
                      >
                        Clock Out
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Weekly Shift Schedule */}
      {activeTab === "SHIFTS" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Scheduled Shifts</h2>
              <p className="text-[11px] text-slate-400">Confirmed roster shifts for service periods</p>
            </div>
            <button
              onClick={() => {
                if (staff.length > 0 && !shiftUserId) setShiftUserId(staff[0].id);
                setShowShiftModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Shift</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 pl-5">Staff Member</th>
                  <th className="py-3.5">Role</th>
                  <th className="py-3.5">Date</th>
                  <th className="py-3.5">Shift Window</th>
                  <th className="py-3.5">Duty Notes</th>
                  <th className="py-3.5 pr-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shiftsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading scheduled shifts...
                    </td>
                  </tr>
                ) : shifts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No shifts scheduled yet.
                    </td>
                  </tr>
                ) : (
                  shifts.map((sh) => (
                    <tr key={sh.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 pl-5 font-semibold text-slate-200">{sh.userName}</td>
                      <td className="py-3.5 text-slate-400 font-mono text-[11px]">{sh.userRole}</td>
                      <td className="py-3.5 text-slate-300 font-mono">{sh.date}</td>
                      <td className="py-3.5 font-mono font-bold text-amber-400">
                        {sh.startTime} - {sh.endTime}
                      </td>
                      <td className="py-3.5 text-slate-400">{sh.notes || "—"}</td>
                      <td className="py-3.5 pr-5 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            sh.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {sh.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowShiftModal(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Schedule Staff Shift</h3>
                <p className="text-xs text-slate-400">Assign service hours and section responsibilities</p>
              </div>
            </div>

            <form onSubmit={handleShiftSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Team Member
                </label>
                <select
                  value={shiftUserId}
                  onChange={(e) => setShiftUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {staff.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Shift Date
                </label>
                <input
                  type="date"
                  required
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Duty / Section Notes
                </label>
                <input
                  type="text"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="e.g. Section B lead / Terrace rush"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createShiftMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {createShiftMutation.isPending ? "Assigning..." : "Assign Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
