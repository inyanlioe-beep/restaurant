import { NextRequest, NextResponse } from "next/server";
import { getStaffShifts, addStaffShift } from "@/lib/services/staff-service";

export async function GET() {
  try {
    const shifts = await getStaffShifts();
    return NextResponse.json({ success: true, data: shifts });
  } catch (error) {
    console.error("Failed to fetch staff shifts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff shifts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, date, startTime, endTime, notes } = body;

    if (!userId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Missing required shift fields" },
        { status: 400 }
      );
    }

    const shift = await addStaffShift({ userId, date, startTime, endTime, notes });
    return NextResponse.json({ success: true, data: shift });
  } catch (error: unknown) {
    console.error("Failed to add staff shift:", error);
    const msg = error instanceof Error ? error.message : "Failed to add shift";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
