import { NextRequest, NextResponse } from "next/server";
import { adjustStock, getStockMovements } from "@/lib/services/inventory-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId") || undefined;
    const movements = await getStockMovements(itemId);
    return NextResponse.json({ success: true, data: movements });
  } catch (error) {
    console.error("Failed to fetch stock movements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, changeQuantity, type, reason, performedBy } = body;

    if (!itemId || !changeQuantity || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (itemId, changeQuantity, type)" },
        { status: 400 }
      );
    }

    const result = await adjustStock({
      itemId,
      changeQuantity: Number(changeQuantity),
      type,
      reason,
      performedBy,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Failed to adjust stock:", error);
    const msg = error instanceof Error ? error.message : "Failed to adjust stock";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
