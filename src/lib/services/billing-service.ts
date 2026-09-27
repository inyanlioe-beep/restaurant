import { getOrderById, updateOrderStatus } from "./order-service";

export interface MockInvoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  serviceCharge: number;
  totalAmount: number;
  status: "PENDING" | "PAID";
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: string;
  createdAt: string;
}

const localInvoices: MockInvoice[] = [];
let nextInvoiceNumber = 1001;

export async function generateInvoice(orderId: string, discount: number = 0, serviceCharge: number = 0) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const existing = localInvoices.find((inv) => inv.orderId === orderId);
  if (existing) return existing;

  const subtotal = order.subtotal;
  const taxable = Math.max(0, subtotal - discount);
  const taxAmount = order.taxAmount;
  const totalAmount = Number((taxable + taxAmount + serviceCharge).toFixed(2));

  const invoice: MockInvoice = {
    id: `inv-${nextInvoiceNumber}`,
    invoiceNumber: `INV-${nextInvoiceNumber++}`,
    orderId,
    subtotal,
    taxAmount,
    discount,
    serviceCharge,
    totalAmount,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  localInvoices.push(invoice);
  return invoice;
}

export async function processPayment(payload: {
  invoiceId?: string;
  orderId?: string;
  amount: number;
  method: "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "UPI" | "MOBILE_WALLET" | "OTHER";
  referenceNo?: string;
  tipAmount?: number;
}) {
  let invoice: MockInvoice | undefined;

  if (payload.invoiceId) {
    invoice = localInvoices.find((i) => i.id === payload.invoiceId);
  } else if (payload.orderId) {
    invoice = await generateInvoice(payload.orderId);
  }

  if (!invoice) throw new Error("Invoice not found or could not be generated");

  invoice.status = "PAID";
  invoice.paymentMethod = payload.method;
  invoice.paymentReference = payload.referenceNo || `REF-${Date.now().toString(36).toUpperCase()}`;
  invoice.paidAt = new Date().toISOString();

  // Complete the order
  await updateOrderStatus(invoice.orderId, "COMPLETED");

  return {
    success: true,
    invoice,
    payment: {
      id: `pay-${Date.now()}`,
      invoiceId: invoice.id,
      amount: payload.amount,
      method: payload.method,
      referenceNo: invoice.paymentReference,
      tipAmount: payload.tipAmount || 0,
      processedAt: invoice.paidAt,
    },
  };
}
