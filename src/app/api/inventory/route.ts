import { NextRequest, NextResponse } from "next/server";
import { getInventoryItems } from "@/lib/services/inventory-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const items = await getInventoryItems(category, search);
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("Failed to fetch inventory items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory items" },
      { status: 500 }
    );
  }
}
