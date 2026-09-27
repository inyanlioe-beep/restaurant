import { NextResponse } from "next/server";
import { getActiveOrders } from "@/lib/services/order-service";

export async function GET() {
  try {
    const orders = await getActiveOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
