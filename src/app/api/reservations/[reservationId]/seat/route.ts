import { NextRequest, NextResponse } from "next/server";
import { seatReservation } from "@/lib/services/reservation-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const { reservationId } = await params;
    const result = await seatReservation(reservationId);
    return NextResponse.json({
      success: true,
      data: result.reservation,
      message: result.tableUpdated
        ? `Guest seated at Table ${result.reservation.tableLabel || "assigned table"}`
        : "Guest seated successfully",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
