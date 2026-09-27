import { z } from "zod";

export const reservationStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "SEATED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
]);

export const createReservationSchema = z.object({
  guestName: z.string().min(2, "Guest name must be at least 2 characters"),
  guestPhone: z.string().min(5, "Contact number is required"),
  guestEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  guestCount: z.coerce.number().int().min(1, "At least 1 guest required").max(30, "Max party size is 30"),
  date: z.string().min(1, "Date is required"), // YYYY-MM-DD
  time: z.string().min(1, "Time is required"), // HH:mm
  durationMinutes: z.coerce.number().int().min(30).max(360).default(90),
  tableId: z.string().optional().nullable(),
  tableLabel: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  specialRequests: z.string().optional().nullable(),
});

export const updateReservationSchema = z.object({
  status: reservationStatusSchema.optional(),
  tableId: z.string().optional().nullable(),
  tableLabel: z.string().optional().nullable(),
  guestCount: z.coerce.number().int().min(1).max(30).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  note: z.string().optional().nullable(),
  specialRequests: z.string().optional().nullable(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type ReservationStatusType = z.infer<typeof reservationStatusSchema>;
