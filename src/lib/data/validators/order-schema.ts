import { z } from "zod";

export const orderItemModifierInputSchema = z.object({
  modifierId: z.string().min(1),
  optionId: z.string().optional().nullable(),
  quantity: z.number().int().positive().default(1),
  priceAdjust: z.number().default(0),
  customValue: z.string().optional().nullable(),
});

export const orderItemInputSchema = z.object({
  menuItemId: z.string().min(1, "Menu item ID is required"),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().positive(),
  note: z.string().optional().nullable(),
  modifiers: z.array(orderItemModifierInputSchema).optional(),
});

export const createOrderSchema = z.object({
  tableId: z.string().optional().nullable(),
  type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]).default("DINE_IN"),
  note: z.string().optional().nullable(),
  customerCount: z.number().int().positive().optional().nullable(),
  items: z.array(orderItemInputSchema).min(1, "Order must have at least one item"),
  discount: z.number().nonnegative().default(0),
  reservationId: z.string().optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "READY", "SERVED", "COMPLETED", "CANCELLED", "REFUNDED"]),
});

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
