import { prisma } from "@/lib/data/prisma";

export interface MockInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: "MEAT" | "SEAFOOD" | "DAIRY" | "PRODUCE" | "DRY_GOODS" | "BEVERAGE";
  unit: string;
  quantity: number;
  minQuantity: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export interface MockStockMovement {
  id: string;
  inventoryItemId: string;
  itemName: string;
  type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "WASTE";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  performedBy: string;
  createdAt: string;
}

const INITIAL_INVENTORY: MockInventoryItem[] = [
  {
    id: "inv-1",
    name: "Prime Dry-Aged Angus Ribeye",
    sku: "ING-BEEF-001",
    category: "MEAT",
    unit: "KG",
    quantity: 18.5,
    minQuantity: 10.0,
    costPerUnit: 24.5,
    supplier: "Hudson Valley Meats",
    lastRestocked: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: "IN_STOCK",
  },
  {
    id: "inv-2",
    name: "Pugliese Artisan Burrata",
    sku: "ING-DAIRY-002",
    category: "DAIRY",
    unit: "BOX",
    quantity: 4.0,
    minQuantity: 8.0,
    costPerUnit: 16.0,
    supplier: "Bella Formaggio Import",
    lastRestocked: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    status: "LOW_STOCK",
  },
  {
    id: "inv-3",
    name: "Chilean Sea Bass Fillets",
    sku: "ING-FISH-003",
    category: "SEAFOOD",
    unit: "KG",
    quantity: 7.2,
    minQuantity: 10.0,
    costPerUnit: 34.0,
    supplier: "Ocean Prime Fishery",
    lastRestocked: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: "LOW_STOCK",
  },
  {
    id: "inv-4",
    name: "San Marzano D.O.P. Tomatoes",
    sku: "ING-DRY-004",
    category: "PRODUCE",
    unit: "CAN",
    quantity: 36.0,
    minQuantity: 15.0,
    costPerUnit: 4.2,
    supplier: "Napoli Provisions",
    lastRestocked: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    status: "IN_STOCK",
  },
  {
    id: "inv-5",
    name: "Black Truffle Glaze & Infusion",
    sku: "ING-SPEC-005",
    category: "PRODUCE",
    unit: "L",
    quantity: 1.8,
    minQuantity: 4.0,
    costPerUnit: 58.0,
    supplier: "Umbria Truffle Co.",
    lastRestocked: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    status: "LOW_STOCK",
  },
  {
    id: "inv-6",
    name: "Wild-Caught Calamari Squid",
    sku: "ING-FISH-006",
    category: "SEAFOOD",
    unit: "KG",
    quantity: 16.0,
    minQuantity: 10.0,
    costPerUnit: 13.5,
    supplier: "Ocean Prime Fishery",
    lastRestocked: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    status: "IN_STOCK",
  },
  {
    id: "inv-7",
    name: "Tipo 00 Sourdough Flour",
    sku: "ING-DRY-007",
    category: "DRY_GOODS",
    unit: "KG",
    quantity: 65.0,
    minQuantity: 25.0,
    costPerUnit: 2.1,
    supplier: "Caputo Molino",
    lastRestocked: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    status: "IN_STOCK",
  },
  {
    id: "inv-8",
    name: "Woodford Reserve Bourbon",
    sku: "ING-BEV-008",
    category: "BEVERAGE",
    unit: "BOTTLE",
    quantity: 12.0,
    minQuantity: 5.0,
    costPerUnit: 38.0,
    supplier: "Southern Glazer's Wine & Spirits",
    lastRestocked: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    status: "IN_STOCK",
  },
  {
    id: "inv-9",
    name: "Valrhona Guanaja 70% Dark Chocolate",
    sku: "ING-DRY-009",
    category: "DRY_GOODS",
    unit: "KG",
    quantity: 14.0,
    minQuantity: 6.0,
    costPerUnit: 22.0,
    supplier: "Gourmet Chocolatier NY",
    lastRestocked: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    status: "IN_STOCK",
  },
];

const INITIAL_MOVEMENTS: MockStockMovement[] = [
  {
    id: "mov-1",
    inventoryItemId: "inv-1",
    itemName: "Prime Dry-Aged Angus Ribeye",
    type: "STOCK_IN",
    quantity: 20.0,
    previousQuantity: 3.5,
    newQuantity: 23.5,
    reason: "Weekly shipment delivery from Hudson Valley Meats",
    performedBy: "Alexander Vance (Super Admin)",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "mov-2",
    inventoryItemId: "inv-1",
    itemName: "Prime Dry-Aged Angus Ribeye",
    type: "STOCK_OUT",
    quantity: 5.0,
    previousQuantity: 23.5,
    newQuantity: 18.5,
    reason: "Kitchen dinner service requisition",
    performedBy: "Chef Jean-Luc (Head Chef)",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: "mov-3",
    inventoryItemId: "inv-5",
    itemName: "Black Truffle Glaze & Infusion",
    type: "WASTE",
    quantity: 0.5,
    previousQuantity: 2.3,
    newQuantity: 1.8,
    reason: "Damaged container during prep shift",
    performedBy: "Elena Rostova (Manager)",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

let localInventory: MockInventoryItem[] = [...INITIAL_INVENTORY];
let localMovements: MockStockMovement[] = [...INITIAL_MOVEMENTS];

export async function getInventoryItems(category?: string, search?: string) {
  try {
    const where: Record<string, unknown> = { isActive: true };
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { name: "asc" },
    });
    if (items.length > 0) {
      return items.map((i) => ({
        id: i.id,
        name: i.name,
        sku: i.sku || "N/A",
        category: i.category as MockInventoryItem["category"],
        unit: i.unit,
        quantity: Number(i.quantity),
        minQuantity: Number(i.minQuantity),
        costPerUnit: Number(i.costPerUnit || 0),
        supplier: "Primary Supplier",
        lastRestocked: i.updatedAt.toISOString(),
        status:
          Number(i.quantity) <= 0
            ? ("OUT_OF_STOCK" as const)
            : Number(i.quantity) <= Number(i.minQuantity)
            ? ("LOW_STOCK" as const)
            : ("IN_STOCK" as const),
      }));
    }
  } catch {
    // fallback
  }

  let filtered = [...localInventory];
  if (category && category !== "ALL") {
    filtered = filtered.filter((i) => i.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
  }
  return filtered;
}

export async function adjustStock(params: {
  itemId: string;
  changeQuantity: number;
  type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "WASTE";
  reason: string;
  performedBy?: string;
}) {
  const itemIndex = localInventory.findIndex((i) => i.id === params.itemId);
  if (itemIndex === -1) {
    throw new Error("Inventory item not found");
  }

  const current = localInventory[itemIndex];
  const prevQty = current.quantity;
  let newQty = prevQty;

  if (params.type === "STOCK_IN") {
    newQty = prevQty + params.changeQuantity;
  } else if (params.type === "STOCK_OUT" || params.type === "WASTE") {
    newQty = Math.max(0, prevQty - params.changeQuantity);
  } else if (params.type === "ADJUSTMENT") {
    newQty = Math.max(0, params.changeQuantity);
  }

  const updatedStatus =
    newQty <= 0 ? "OUT_OF_STOCK" : newQty <= current.minQuantity ? "LOW_STOCK" : "IN_STOCK";

  const updatedItem: MockInventoryItem = {
    ...current,
    quantity: parseFloat(newQty.toFixed(2)),
    status: updatedStatus,
    lastRestocked: params.type === "STOCK_IN" ? new Date().toISOString() : current.lastRestocked,
  };

  localInventory[itemIndex] = updatedItem;

  const movement: MockStockMovement = {
    id: `mov-${Date.now()}`,
    inventoryItemId: current.id,
    itemName: current.name,
    type: params.type,
    quantity: params.changeQuantity,
    previousQuantity: prevQty,
    newQuantity: updatedItem.quantity,
    reason: params.reason || "Manual stock update via Management Console",
    performedBy: params.performedBy || "Authorized Staff",
    createdAt: new Date().toISOString(),
  };

  localMovements.unshift(movement);

  return { item: updatedItem, movement };
}

export async function getStockMovements(itemId?: string) {
  if (itemId) {
    return localMovements.filter((m) => m.inventoryItemId === itemId);
  }
  return localMovements;
}
