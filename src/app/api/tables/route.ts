import { NextRequest, NextResponse } from "next/server";
import { getTables } from "@/lib/services/table-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const floorId = searchParams.get("floorId") || undefined;
    const tables = await getTables(floorId);
    return NextResponse.json({ success: true, data: tables });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
