import { prisma } from "@/lib/data/prisma";
import { INITIAL_ORDERS, MockOrder } from "./mock-data";
import { updateTableStatus } from "./table-service";

let localOrders: MockOrder[] = [...INITIAL_ORDERS];
let nextOrderNumber = 104;

export interface CreateOrderPayload {
  tableId?: string | null;
  tableLabel?: string | null;
  type: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  customerCount?: number;
  note?: string;
  items: {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    note?: string;
    modifiers?: { label: string; priceAdjust: number }[];
  }[];
  discount?: number;
  taxRate?: number;
}

export async function createOrder(payload: CreateOrderPayload, takenById: string = "system") {
  const subtotal = payload.items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const discount = payload.discount || 0;
  const taxable = Math.max(0, subtotal - discount);
  const taxRate = payload.taxRate || 0.08875;
  const taxAmount = Number((taxable * taxRate).toFixed(2));
  const totalAmount = Number((taxable + taxAmount).toFixed(2));

  const orderNum = nextOrderNumber++;
  const newOrder: MockOrder = {
    id: `ord-${orderNum}`,
    orderNumber: orderNum,
    status: "PREPARING",
    type: payload.type,
    tableId: payload.tableId || undefined,
    tableLabel: payload.tableLabel || undefined,
    customerCount: payload.customerCount || 2,
    subtotal,
    discount,
    taxAmount,
    totalAmount,
    note: payload.note,
    createdAt: new Date().toISOString(),
    items: payload.items.map((i, idx) => ({
      id: `oi-${orderNum}-${idx}`,
      menuItemId: i.menuItemId,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.unitPrice * i.quantity,
      note: i.note,
      modifiers: i.modifiers,
    })),
  };

  localOrders.unshift(newOrder);

  // If dine-in and table is assigned, mark table as OCCUPIED
  if (payload.tableId) {
    await updateTableStatus(payload.tableId, "OCCUPIED");
  }

  return newOrder;
}

export async function getOrders(status?: string) {
  if (status && status !== "ALL") {
    return localOrders.filter((o) => o.status === status);
  }
  return localOrders;
}

export async function getOrderById(orderId: string) {
  return localOrders.find((o) => o.id === orderId) || null;
}

export async function updateOrderStatus(orderId: string, status: MockOrder["status"]) {
  const idx = localOrders.findIndex((o) => o.id === orderId);
  if (idx > -1) {
    localOrders[idx].status = status;
    const order = localOrders[idx];

    // If completed or cancelled, free the table
    if ((status === "COMPLETED" || status === "CANCELLED") && order.tableId) {
      await updateTableStatus(order.tableId, "CLEANING");
    }

    return order;
  }
  return null;
}

export async function getActiveOrders() {
  return localOrders.filter((o) => ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.status));
}
