import { NextRequest, NextResponse } from "next/server";
import { getReservations, createReservation } from "@/lib/services/reservation-service";
import { createReservationSchema } from "@/lib/data/validators/reservation-schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const reservations = await getReservations({ date, status, search });
    return NextResponse.json({ success: true, data: reservations });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createReservationSchema.parse(body);
    const reservation = await createReservation(validatedData);
    return NextResponse.json({ success: true, data: reservation }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
