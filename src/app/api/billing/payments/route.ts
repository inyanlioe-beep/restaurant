import { NextRequest, NextResponse } from "next/server";
import { processPayment } from "@/lib/services/billing-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await processPayment(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
