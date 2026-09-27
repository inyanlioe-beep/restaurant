import { NextResponse } from "next/server";
import { getMenuCategories } from "@/lib/services/menu-service";

export async function GET() {
  try {
    const categories = await getMenuCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
