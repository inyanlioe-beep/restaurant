import { NextRequest, NextResponse } from "next/server";
import { getStaffMembers, updateStaffAttendance } from "@/lib/services/staff-service";

export async function GET() {
  try {
    const staff = await getStaffMembers();
    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error("Failed to fetch staff members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff members" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (userId, status)" },
        { status: 400 }
      );
    }

    const updated = await updateStaffAttendance(userId, status);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error("Failed to update staff attendance:", error);
    const msg = error instanceof Error ? error.message : "Failed to update attendance";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
