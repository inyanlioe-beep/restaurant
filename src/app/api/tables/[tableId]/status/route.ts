import { NextRequest, NextResponse } from "next/server";
import { updateTableStatus } from "@/lib/services/table-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId } = await params;
    const body = await req.json();
    const updated = await updateTableStatus(tableId, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Table not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
