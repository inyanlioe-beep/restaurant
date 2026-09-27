import { prisma } from "@/lib/data/prisma";
import { INITIAL_TABLES, MockTable } from "./mock-data";

let localTables: MockTable[] = [...INITIAL_TABLES];

export async function getTables(floorId?: string) {
  try {
    const tables = await prisma.table.findMany({
      where: floorId ? { floorId, isActive: true } : { isActive: true },
      include: {
        floor: true,
        orders: {
          where: {
            status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY", "SERVED"] },
          },
          take: 1,
        },
      },
      orderBy: { label: "asc" },
    });

    if (tables.length > 0) {
      return tables.map((t) => {
        const activeOrder = t.orders[0];
        return {
          id: t.id,
          label: t.label,
          capacity: t.capacity,
          shape: (t.shape || "rectangle") as "rectangle" | "circle" | "square",
          posX: t.posX,
          posY: t.posY,
          floorId: t.floorId,
          floorName: t.floor.name,
          status: activeOrder ? "OCCUPIED" : ("AVAILABLE" as const),
          currentOrderId: activeOrder?.id,
          currentBill: activeOrder ? Number(activeOrder.totalAmount) : undefined,
        };
      });
    }
  } catch {
    // fallback
  }

  if (floorId) {
    return localTables.filter((t) => t.floorId === floorId);
  }
  return localTables;
}

export async function updateTableStatus(tableId: string, status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING") {
  const idx = localTables.findIndex((t) => t.id === tableId);
  if (idx > -1) {
    localTables[idx].status = status;
    if (status === "AVAILABLE" || status === "CLEANING") {
      localTables[idx].currentOrderId = undefined;
      localTables[idx].currentBill = undefined;
    }
    return localTables[idx];
  }
  return null;
}

export async function updateTablePosition(tableId: string, posX: number, posY: number) {
  try {
    await prisma.table.update({
      where: { id: tableId },
      data: { posX, posY },
    });
  } catch {
    // fallback
  }

  const idx = localTables.findIndex((t) => t.id === tableId);
  if (idx > -1) {
    localTables[idx].posX = posX;
    localTables[idx].posY = posY;
    return localTables[idx];
  }
  return null;
}
