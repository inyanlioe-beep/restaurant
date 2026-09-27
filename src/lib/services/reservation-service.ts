import { prisma } from "@/lib/data/prisma";
import { updateTableStatus } from "./table-service";
import { CreateReservationInput, UpdateReservationInput, ReservationStatusType } from "../data/validators/reservation-schema";

export interface MockReservation {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  guestCount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: ReservationStatusType;
  tableId?: string;
  tableLabel?: string;
  floorName?: string;
  note?: string;
  specialRequests?: string;
  createdAt: string;
}

const todayStr = new Date().toISOString().split("T")[0];

export const INITIAL_RESERVATIONS: MockReservation[] = [
  {
    id: "res-101",
    guestName: "Lady Genevieve Sterling",
    guestPhone: "+1 (555) 234-8901",
    guestEmail: "genevieve.sterling@luxury.io",
    guestCount: 2,
    date: todayStr,
    time: "19:00",
    durationMinutes: 120,
    status: "CONFIRMED",
    tableId: "tbl-4",
    tableLabel: "T4",
    floorName: "Main Dining Hall",
    note: "VIP guest - prefers quiet corner",
    specialRequests: "Chilled Dom Pérignon ready on table upon arrival",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: "res-102",
    guestName: "Lord Arthur Pendelton",
    guestPhone: "+1 (555) 876-5432",
    guestEmail: "arthur.pendelton@heritage.uk",
    guestCount: 4,
    date: todayStr,
    time: "20:00",
    durationMinutes: 90,
    status: "PENDING",
    tableId: "tbl-2",
    tableLabel: "T2",
    floorName: "Main Dining Hall",
    note: "Anniversary celebration",
    specialRequests: "Gluten-free menu items for 1 guest",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "res-103",
    guestName: "Dr. Evelyn Zhang",
    guestPhone: "+1 (555) 432-1098",
    guestEmail: "e.zhang@biotech.org",
    guestCount: 6,
    date: todayStr,
    time: "18:30",
    durationMinutes: 120,
    status: "SEATED",
    tableId: "tbl-1",
    tableLabel: "T1",
    floorName: "Main Dining Hall",
    note: "Business executive dinner",
    specialRequests: "Sommelier wine pairing recommendation",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: "res-104",
    guestName: "Maximilian Dubois",
    guestPhone: "+1 (555) 654-3210",
    guestEmail: "m.dubois@atelier.fr",
    guestCount: 2,
    date: todayStr,
    time: "21:15",
    durationMinutes: 90,
    status: "CONFIRMED",
    tableId: "tbl-7",
    tableLabel: "TG1",
    floorName: "Terrace Garden",
    note: "Window / Terrace view requested",
    specialRequests: "Candlelight setup with fresh floral centerpiece",
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: "res-105",
    guestName: "Camilla Rodriguez",
    guestPhone: "+1 (555) 987-1234",
    guestEmail: "camilla.r@media.net",
    guestCount: 8,
    date: todayStr,
    time: "20:30",
    durationMinutes: 150,
    status: "CONFIRMED",
    tableId: "tbl-6",
    tableLabel: "T6",
    floorName: "Main Dining Hall",
    note: "Birthday party celebration",
    specialRequests: "Custom pastry dessert presentation with sparklers",
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
];

let localReservations: MockReservation[] = [...INITIAL_RESERVATIONS];
let nextResNumber = 106;

export async function getReservations(filter?: { date?: string; status?: string; search?: string }) {
  try {
    // If PostgreSQL database has reservations, try querying Prisma
    const dbReservations = await prisma.reservation.findMany({
      include: {
        tables: {
          include: {
            table: {
              include: { floor: true },
            },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    if (dbReservations.length > 0) {
      return dbReservations.map((r) => {
        const primaryTable = r.tables[0]?.table;
        return {
          id: r.id,
          guestName: r.guestName,
          guestPhone: r.guestPhone || "",
          guestEmail: r.guestEmail || undefined,
          guestCount: r.guestCount,
          date: r.startTime.toISOString().split("T")[0],
          time: r.startTime.toTimeString().slice(0, 5),
          durationMinutes: Math.round((r.endTime.getTime() - r.startTime.getTime()) / 60000) || 90,
          status: r.status as ReservationStatusType,
          tableId: primaryTable?.id,
          tableLabel: primaryTable?.label,
          floorName: primaryTable?.floor?.name,
          note: r.note || undefined,
          specialRequests: r.specialRequests || undefined,
          createdAt: r.createdAt.toISOString(),
        };
      });
    }
  } catch {
    // fallback to local memory state
  }

  let list = [...localReservations];

  if (filter?.date && filter.date !== "ALL") {
    list = list.filter((r) => r.date === filter.date);
  }

  if (filter?.status && filter.status !== "ALL") {
    list = list.filter((r) => r.status === filter.status);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.guestName.toLowerCase().includes(q) ||
        r.guestPhone.includes(q) ||
        (r.tableLabel && r.tableLabel.toLowerCase().includes(q))
    );
  }

  return list.sort((a, b) => (a.time > b.time ? 1 : -1));
}

export async function getReservationById(id: string) {
  return localReservations.find((r) => r.id === id) || null;
}

export async function createReservation(payload: CreateReservationInput): Promise<MockReservation> {
  const newId = `res-${nextResNumber++}`;
  const newReservation: MockReservation = {
    id: newId,
    guestName: payload.guestName,
    guestPhone: payload.guestPhone,
    guestEmail: payload.guestEmail || undefined,
    guestCount: payload.guestCount,
    date: payload.date,
    time: payload.time,
    durationMinutes: payload.durationMinutes || 90,
    status: "CONFIRMED",
    tableId: payload.tableId || undefined,
    tableLabel: payload.tableLabel || undefined,
    note: payload.note || undefined,
    specialRequests: payload.specialRequests || undefined,
    createdAt: new Date().toISOString(),
  };

  // If table is assigned, mark table as RESERVED if today
  if (payload.tableId && payload.date === todayStr) {
    await updateTableStatus(payload.tableId, "RESERVED");
  }

  localReservations.unshift(newReservation);
  return newReservation;
}

export async function updateReservation(
  id: string,
  payload: UpdateReservationInput
): Promise<MockReservation | null> {
  const idx = localReservations.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const current = localReservations[idx];
  const updated: MockReservation = {
    ...current,
    ...payload,
    status: payload.status || current.status,
    tableId: payload.tableId !== undefined ? payload.tableId || undefined : current.tableId,
    tableLabel: payload.tableLabel !== undefined ? payload.tableLabel || undefined : current.tableLabel,
    guestCount: payload.guestCount !== undefined ? payload.guestCount : current.guestCount,
    date: payload.date || current.date,
    time: payload.time || current.time,
    note: payload.note !== undefined ? payload.note || undefined : current.note,
    specialRequests: payload.specialRequests !== undefined ? payload.specialRequests || undefined : current.specialRequests,
  };

  localReservations[idx] = updated;
  return updated;
}

export async function seatReservation(id: string): Promise<{ reservation: MockReservation; tableUpdated: boolean }> {
  const idx = localReservations.findIndex((r) => r.id === id);
  if (idx === -1) {
    throw new Error("Reservation not found");
  }

  const reservation = localReservations[idx];
  reservation.status = "SEATED";
  localReservations[idx] = reservation;

  let tableUpdated = false;
  if (reservation.tableId) {
    await updateTableStatus(reservation.tableId, "OCCUPIED");
    tableUpdated = true;
  }

  return { reservation, tableUpdated };
}

export async function cancelReservation(id: string): Promise<MockReservation | null> {
  const idx = localReservations.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const res = localReservations[idx];
  res.status = "CANCELLED";
  localReservations[idx] = res;

  if (res.tableId) {
    await updateTableStatus(res.tableId, "AVAILABLE");
  }

  return res;
}

export async function deleteReservation(id: string): Promise<boolean> {
  const idx = localReservations.findIndex((r) => r.id === id);
  if (idx === -1) return false;

  const res = localReservations[idx];
  if (res.tableId && (res.status === "CONFIRMED" || res.status === "PENDING")) {
    await updateTableStatus(res.tableId, "AVAILABLE");
  }

  localReservations.splice(idx, 1);
  return true;
}
