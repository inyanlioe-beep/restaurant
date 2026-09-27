export interface MockCategory {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface MockModifierOption {
  id: string;
  label: string;
  priceAdjust: number;
  isDefault: boolean;
}

export interface MockModifier {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  options: MockModifierOption[];
}

export interface MockMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  cost?: number;
  imageUrl: string;
  isAvailable: boolean;
  isPopular: boolean;
  categoryId: string;
  categoryName: string;
  prepTime: number;
  modifiers?: MockModifier[];
}

export interface MockTable {
  id: string;
  label: string;
  capacity: number;
  shape: "rectangle" | "circle" | "square";
  posX: number;
  posY: number;
  floorId: string;
  floorName: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING";
  currentOrderId?: string;
  currentBill?: number;
}

export interface MockOrder {
  id: string;
  orderNumber: number;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
  type: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableId?: string;
  tableLabel?: string;
  customerCount?: number;
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  note?: string;
  createdAt: string;
  items: {
    id: string;
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    note?: string;
    modifiers?: { label: string; priceAdjust: number }[];
  }[];
}

export const INITIAL_CATEGORIES: MockCategory[] = [
  { id: "cat-1", name: "Signature Starters", description: "Artisan appetizers & tapas", sortOrder: 1 },
  { id: "cat-2", name: "Artisan Steaks & Mains", description: "Prime cuts and chef specials", sortOrder: 2 },
  { id: "cat-3", name: "Woodfired Pizza & Pasta", description: "Handmade sourdough and fresh pasta", sortOrder: 3 },
  { id: "cat-4", name: "Decadent Desserts", description: "Sweet master creations", sortOrder: 4 },
  { id: "cat-5", name: "Craft Cocktails & Wines", description: "Mixology & curated vintages", sortOrder: 5 },
];

export const INITIAL_MENU_ITEMS: MockMenuItem[] = [
  {
    id: "item-1",
    name: "Truffle Burrata Crostini",
    description: "Creamy pugliese burrata, black truffle glaze, heirloom tomatoes, toasted sourdough",
    price: 18.5,
    cost: 5.2,
    imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6ef231f6?w=600&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: true,
    categoryId: "cat-1",
    categoryName: "Signature Starters",
    prepTime: 10,
  },
  {
    id: "item-2",
    name: "Crispy Calamari Fritti",
    description: "Wild-caught squid with lemon pepper seasoning, preserved lemon aioli and marinara",
    price: 16.0,
    cost: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: false,
    categoryId: "cat-1",
    categoryName: "Signature Starters",
    prepTime: 12,
  },
  {
    id: "item-3",
    name: "Prime Dry-Aged Ribeye (12oz)",
    description: "45-day aged Black Angus, rosemary bone marrow butter, roasted garlic head",
    price: 54.0,
    cost: 19.5,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: true,
    categoryId: "cat-2",
    categoryName: "Artisan Steaks & Mains",
    prepTime: 22,
    modifiers: [
      {
        id: "mod-1",
        name: "Meat Temperature",
        type: "SELECT",
        isRequired: true,
        options: [
          { id: "opt-1", label: "Rare (Cool red center)", priceAdjust: 0, isDefault: false },
          { id: "opt-2", label: "Medium Rare (Warm red center)", priceAdjust: 0, isDefault: true },
          { id: "opt-3", label: "Medium (Warm pink center)", priceAdjust: 0, isDefault: false },
          { id: "opt-4", label: "Medium Well (Slight pink)", priceAdjust: 0, isDefault: false },
        ],
      },
      {
        id: "mod-2",
        name: "Add-Ons & Crust",
        type: "MULTI",
        isRequired: false,
        options: [
          { id: "opt-5", label: "Truffle Butter Crust", priceAdjust: 4.5, isDefault: false },
          { id: "opt-6", label: "Grilled Tiger Prawns (2pc)", priceAdjust: 9.0, isDefault: false },
        ],
      },
    ],
  },
  {
    id: "item-4",
    name: "Pan-Seared Chilean Sea Bass",
    description: "Miso-glazed sea bass, shiitake dashi broth, baby bok choy, crisp lotus root",
    price: 46.0,
    cost: 14.8,
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: true,
    categoryId: "cat-2",
    categoryName: "Artisan Steaks & Mains",
    prepTime: 18,
  },
  {
    id: "item-5",
    name: "Black Truffle Pappardelle",
    description: "Handmade ribbons, foraged wild mushrooms, 24-month parmigiano reggiano",
    price: 28.0,
    cost: 7.0,
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281051?w=600&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: true,
    categoryId: "cat-3",
    categoryName: "Woodfired Pizza & Pasta",
    prepTime: 15,
  },
  {
    id: "item-6",
    name: "Diavola Sourdough Pizza",
    description: "San Marzano tomatoes, fior di latte, spicy artisanal soppressata, chili honey drizzle",
    price: 23.0,
    cost: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: false,
    categoryId: "cat-3",
    categoryName: "Woodfired Pizza & Pasta",
    prepTime: 14,
  },
  {
    id: "item-7",
    name: "Classic Valrhona Lava Cake",
    description: "Warm molten center, Madagascar bourbon vanilla gelato, 24k gold leaf flakes",
    price: 14.0,
    cost: 3.2,
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: true,
    categoryId: "cat-4",
    categoryName: "Decadent Desserts",
    prepTime: 12,
  },
  {
    id: "item-8",
    name: "Smoked Old Fashioned",
    description: "Woodford Reserve bourbon, raw demerara syrup, aromatic bitters, applewood smoke",
    price: 17.0,
    cost: 3.5,
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80",
    isAvailable: true,
    isPopular: true,
    categoryId: "cat-5",
    categoryName: "Craft Cocktails & Wines",
    prepTime: 5,
  },
];

export const INITIAL_TABLES: MockTable[] = [
  { id: "tbl-1", label: "T1", capacity: 2, shape: "square", posX: 40, posY: 40, floorId: "fl-1", floorName: "Main Dining Hall", status: "OCCUPIED", currentOrderId: "ord-101", currentBill: 82.5 },
  { id: "tbl-2", label: "T2", capacity: 4, shape: "rectangle", posX: 160, posY: 40, floorId: "fl-1", floorName: "Main Dining Hall", status: "AVAILABLE" },
  { id: "tbl-3", label: "T3", capacity: 4, shape: "rectangle", posX: 280, posY: 40, floorId: "fl-1", floorName: "Main Dining Hall", status: "OCCUPIED", currentOrderId: "ord-102", currentBill: 142.0 },
  { id: "tbl-4", label: "T4", capacity: 6, shape: "circle", posX: 40, posY: 160, floorId: "fl-1", floorName: "Main Dining Hall", status: "RESERVED" },
  { id: "tbl-5", label: "T5", capacity: 2, shape: "square", posX: 160, posY: 160, floorId: "fl-1", floorName: "Main Dining Hall", status: "AVAILABLE" },
  { id: "tbl-6", label: "T6", capacity: 8, shape: "rectangle", posX: 280, posY: 160, floorId: "fl-1", floorName: "Main Dining Hall", status: "CLEANING" },
  { id: "tbl-7", label: "TG1", capacity: 2, shape: "circle", posX: 50, posY: 50, floorId: "fl-2", floorName: "Terrace Garden", status: "AVAILABLE" },
  { id: "tbl-8", label: "TG2", capacity: 4, shape: "rectangle", posX: 180, posY: 50, floorId: "fl-2", floorName: "Terrace Garden", status: "OCCUPIED", currentOrderId: "ord-103", currentBill: 58.0 },
  { id: "tbl-9", label: "TG3", capacity: 4, shape: "rectangle", posX: 310, posY: 50, floorId: "fl-2", floorName: "Terrace Garden", status: "AVAILABLE" },
];

export const INITIAL_ORDERS: MockOrder[] = [
  {
    id: "ord-101",
    orderNumber: 101,
    status: "PREPARING",
    type: "DINE_IN",
    tableId: "tbl-1",
    tableLabel: "T1",
    customerCount: 2,
    subtotal: 72.5,
    taxAmount: 6.43,
    discount: 0,
    totalAmount: 78.93,
    note: "Allergies: shellfish",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    items: [
      { id: "oi-1", menuItemId: "item-3", name: "Prime Dry-Aged Ribeye (12oz)", quantity: 1, unitPrice: 54.0, totalPrice: 54.0, modifiers: [{ label: "Medium Rare", priceAdjust: 0 }] },
      { id: "oi-2", menuItemId: "item-1", name: "Truffle Burrata Crostini", quantity: 1, unitPrice: 18.5, totalPrice: 18.5 },
    ],
  },
  {
    id: "ord-102",
    orderNumber: 102,
    status: "READY",
    type: "DINE_IN",
    tableId: "tbl-3",
    tableLabel: "T3",
    customerCount: 4,
    subtotal: 132.0,
    taxAmount: 11.71,
    discount: 10.0,
    totalAmount: 133.71,
    note: "Anniversary celebration",
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    items: [
      { id: "oi-3", menuItemId: "item-4", name: "Pan-Seared Chilean Sea Bass", quantity: 2, unitPrice: 46.0, totalPrice: 92.0 },
      { id: "oi-4", menuItemId: "item-5", name: "Black Truffle Pappardelle", quantity: 1, unitPrice: 28.0, totalPrice: 28.0 },
      { id: "oi-5", menuItemId: "item-8", name: "Smoked Old Fashioned", quantity: 2, unitPrice: 17.0, totalPrice: 34.0 },
    ],
  },
  {
    id: "ord-103",
    orderNumber: 103,
    status: "SERVED",
    type: "DINE_IN",
    tableId: "tbl-8",
    tableLabel: "TG2",
    customerCount: 2,
    subtotal: 51.0,
    taxAmount: 4.53,
    discount: 0,
    totalAmount: 55.53,
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    items: [
      { id: "oi-6", menuItemId: "item-6", name: "Diavola Sourdough Pizza", quantity: 1, unitPrice: 23.0, totalPrice: 23.0 },
      { id: "oi-7", menuItemId: "item-7", name: "Classic Valrhona Lava Cake", quantity: 2, unitPrice: 14.0, totalPrice: 28.0 },
    ],
  },
];
