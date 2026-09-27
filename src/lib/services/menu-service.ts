import { prisma } from "@/lib/data/prisma";
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS, MockMenuItem, MockCategory } from "./mock-data";

let localCategories: MockCategory[] = [...INITIAL_CATEGORIES];
let localMenuItems: MockMenuItem[] = [...INITIAL_MENU_ITEMS];

export async function getMenuCategories() {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
    if (categories.length > 0) return categories;
  } catch {
    // fallback
  }
  return localCategories;
}

export async function getMenuItems(categoryId?: string, search?: string) {
  try {
    const whereClause: Record<string, unknown> = { isActive: true };
    if (categoryId && categoryId !== "ALL") {
      whereClause.categoryId = categoryId;
    }
    if (search) {
      whereClause.name = { contains: search, mode: "insensitive" };
    }

    const items = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        category: true,
        modifiers: {
          include: {
            options: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    if (items.length > 0) return items;
  } catch {
    // fallback
  }

  let filtered = [...localMenuItems];
  if (categoryId && categoryId !== "ALL") {
    filtered = filtered.filter((i) => i.categoryId === categoryId);
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((i) => i.name.toLowerCase().includes(s) || i.description.toLowerCase().includes(s));
  }
  return filtered;
}

export async function toggleMenuItemAvailability(itemId: string) {
  try {
    const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
    if (item) {
      const updated = await prisma.menuItem.update({
        where: { id: itemId },
        data: { isAvailable: !item.isAvailable },
      });
      return updated;
    }
  } catch {
    // fallback
  }

  const idx = localMenuItems.findIndex((i) => i.id === itemId);
  if (idx > -1) {
    localMenuItems[idx].isAvailable = !localMenuItems[idx].isAvailable;
    return localMenuItems[idx];
  }
  return null;
}
