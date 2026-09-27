import { prisma } from "@/lib/data/prisma";

export interface MockStaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "CHEF" | "WAITER" | "HOST" | "STAFF";
  attendanceStatus: "CLOCKED_IN" | "ON_BREAK" | "CLOCKED_OUT";
  clockInTime?: string;
  hoursToday: number;
  assignedShift: string;
  hourlyWage: number;
}

export interface MockShift {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

const INITIAL_STAFF: MockStaffMember[] = [
  {
    id: "usr-1",
    name: "Alexander Vance",
    email: "admin@restaurant.com",
    phone: "+1 (555) 111-2233",
    role: "SUPER_ADMIN",
    attendanceStatus: "CLOCKED_IN",
    clockInTime: "08:30 AM",
    hoursToday: 6.5,
    assignedShift: "08:00 - 16:30 (Day Service)",
    hourlyWage: 42.0,
  },
  {
    id: "usr-2",
    name: "Elena Rostova",
    email: "manager@restaurant.com",
    phone: "+1 (555) 222-3344",
    role: "MANAGER",
    attendanceStatus: "CLOCKED_IN",
    clockInTime: "10:00 AM",
    hoursToday: 5.0,
    assignedShift: "10:00 - 18:30 (Floor Supervisor)",
    hourlyWage: 32.0,
  },
  {
    id: "usr-3",
    name: "Chef Jean-Luc",
    email: "chef@restaurant.com",
    phone: "+1 (555) 444-5566",
    role: "CHEF",
    attendanceStatus: "CLOCKED_IN",
    clockInTime: "11:30 AM",
    hoursToday: 4.5,
    assignedShift: "11:30 - 21:00 (Dinner Line Lead)",
    hourlyWage: 38.0,
  },
  {
    id: "usr-4",
    name: "Marcus Cole",
    email: "waiter@restaurant.com",
    phone: "+1 (555) 333-4455",
    role: "WAITER",
    attendanceStatus: "ON_BREAK",
    clockInTime: "12:00 PM",
    hoursToday: 3.5,
    assignedShift: "12:00 - 20:30 (Dining Section A)",
    hourlyWage: 20.0,
  },
  {
    id: "usr-5",
    name: "Chloe Martin",
    email: "chloe@restaurant.com",
    phone: "+1 (555) 777-8899",
    role: "WAITER",
    attendanceStatus: "CLOCKED_OUT",
    hoursToday: 0.0,
    assignedShift: "16:00 - 23:30 (Evening Rush)",
    hourlyWage: 20.0,
  },
  {
    id: "usr-6",
    name: "David Silva",
    email: "david@restaurant.com",
    phone: "+1 (555) 888-9900",
    role: "STAFF",
    attendanceStatus: "CLOCKED_IN",
    clockInTime: "15:00 PM",
    hoursToday: 2.0,
    assignedShift: "15:00 - 23:00 (Bar & Mixology)",
    hourlyWage: 24.0,
  },
];

const INITIAL_SHIFTS: MockShift[] = [
  {
    id: "sh-1",
    userId: "usr-1",
    userName: "Alexander Vance",
    userRole: "SUPER_ADMIN",
    date: new Date().toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "16:30",
    status: "ACTIVE",
    notes: "Opening & morning financial reconciliation",
  },
  {
    id: "sh-2",
    userId: "usr-2",
    userName: "Elena Rostova",
    userRole: "MANAGER",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "18:30",
    status: "ACTIVE",
    notes: "Floor management & reservation greetings",
  },
  {
    id: "sh-3",
    userId: "usr-3",
    userName: "Chef Jean-Luc",
    userRole: "CHEF",
    date: new Date().toISOString().split("T")[0],
    startTime: "11:30",
    endTime: "21:00",
    status: "ACTIVE",
    notes: "Head of kitchen expeditor",
  },
  {
    id: "sh-4",
    userId: "usr-4",
    userName: "Marcus Cole",
    userRole: "WAITER",
    date: new Date().toISOString().split("T")[0],
    startTime: "12:00",
    endTime: "20:30",
    status: "ACTIVE",
    notes: "Section A (Tables T1 - T6)",
  },
  {
    id: "sh-5",
    userId: "usr-5",
    userName: "Chloe Martin",
    userRole: "WAITER",
    date: new Date().toISOString().split("T")[0],
    startTime: "16:00",
    endTime: "23:30",
    status: "PLANNED",
    notes: "Terrace Garden section evening rush",
  },
];

let localStaff: MockStaffMember[] = [...INITIAL_STAFF];
let localShifts: MockShift[] = [...INITIAL_SHIFTS];

export async function getStaffMembers() {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      include: {
        clockEntries: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    if (users.length > 0) {
      return users.map((u) => {
        const lastClock = u.clockEntries[0];
        const status =
          lastClock?.status === "CLOCKED_IN"
            ? ("CLOCKED_IN" as const)
            : lastClock?.status === "ON_BREAK"
            ? ("ON_BREAK" as const)
            : ("CLOCKED_OUT" as const);

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || "N/A",
          role: u.role as MockStaffMember["role"],
          attendanceStatus: status,
          clockInTime: lastClock?.clockIn ? new Date(lastClock.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          hoursToday: 4.0,
          assignedShift: "Standard Service Shift",
          hourlyWage: 25.0,
        };
      });
    }
  } catch {
    // fallback
  }

  return localStaff;
}

export async function updateStaffAttendance(
  userId: string,
  targetStatus: "CLOCKED_IN" | "ON_BREAK" | "CLOCKED_OUT"
) {
  const index = localStaff.findIndex((s) => s.id === userId);
  if (index === -1) throw new Error("Staff member not found");

  const staff = localStaff[index];
  const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  localStaff[index] = {
    ...staff,
    attendanceStatus: targetStatus,
    clockInTime: targetStatus === "CLOCKED_IN" ? nowStr : targetStatus === "CLOCKED_OUT" ? undefined : staff.clockInTime,
  };

  return localStaff[index];
}

export async function getStaffShifts() {
  return localShifts;
}

export async function addStaffShift(payload: {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  const member = localStaff.find((s) => s.id === payload.userId);
  if (!member) throw new Error("Staff member not found");

  const newShift: MockShift = {
    id: `sh-${Date.now()}`,
    userId: member.id,
    userName: member.name,
    userRole: member.role,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    status: "PLANNED",
    notes: payload.notes || "Assigned floor service shift",
  };

  localShifts.push(newShift);
  return newShift;
}
