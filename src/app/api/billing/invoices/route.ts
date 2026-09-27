import { NextRequest, NextResponse } from "next/server";
import { generateInvoice } from "@/lib/services/billing-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoice = await generateInvoice(body.orderId, body.discount, body.serviceCharge);
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
