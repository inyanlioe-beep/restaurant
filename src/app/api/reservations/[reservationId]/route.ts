import { NextRequest, NextResponse } from "next/server";
import {
  getReservationById,
  updateReservation,
  deleteReservation,
} from "@/lib/services/reservation-service";
import { updateReservationSchema } from "@/lib/data/validators/reservation-schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const { reservationId } = await params;
    const reservation = await getReservationById(reservationId);
    if (!reservation) {
      return NextResponse.json({ success: false, error: "Reservation not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const { reservationId } = await params;
    const body = await req.json();
    const validatedData = updateReservationSchema.parse(body);
    const updated = await updateReservation(reservationId, validatedData);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Reservation not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const { reservationId } = await params;
    const deleted = await deleteReservation(reservationId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Reservation not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Reservation cancelled successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
