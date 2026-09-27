import { NextRequest, NextResponse } from "next/server";
import { toggleMenuItemAvailability } from "@/lib/services/menu-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const updated = await toggleMenuItemAvailability(itemId);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
