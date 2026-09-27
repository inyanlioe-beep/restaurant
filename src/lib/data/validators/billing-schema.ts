import { z } from "zod";

export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amount: z.number().positive("Payment amount must be greater than 0"),
  method: z.enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "UPI", "MOBILE_WALLET", "OTHER"]).default("CASH"),
  referenceNo: z.string().optional().nullable(),
  tipAmount: z.number().nonnegative().default(0),
});

export const generateInvoiceSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  discount: z.number().nonnegative().default(0),
  serviceCharge: z.number().nonnegative().default(0),
  note: z.string().optional().nullable(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
