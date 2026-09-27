import { create } from "zustand";

export interface CartModifier {
  modifierId: string;
  modifierName: string;
  optionId?: string;
  optionLabel: string;
  priceAdjust: number;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  imageUrl?: string | null;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  note?: string;
  modifiers: CartModifier[];
}

interface PosState {
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  selectedTableId: string | null;
  selectedTableLabel: string | null;
  customerCount: number;
  orderNote: string;
  discountPercentage: number;
  taxRate: number; // e.g. 0.08 for 8%
  items: CartItem[];

  // Actions
  setOrderType: (type: "DINE_IN" | "TAKEAWAY" | "DELIVERY") => void;
  setTable: (tableId: string | null, label: string | null) => void;
  setCustomerCount: (count: number) => void;
  setOrderNote: (note: string) => void;
  setDiscountPercentage: (discount: number) => void;
  setTaxRate: (rate: number) => void;
  addItem: (item: {
    menuItemId: string;
    name: string;
    imageUrl?: string | null;
    price: number;
    modifiers?: CartModifier[];
    note?: string;
  }) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  updateItemNote: (cartItemId: string, note: string) => void;
  clearCart: () => void;

  // Computed getters
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTaxAmount: () => number;
  getTotalAmount: () => number;
  getItemCount: () => number;
}

export const usePosStore = create<PosState>((set, get) => ({
  orderType: "DINE_IN",
  selectedTableId: null,
  selectedTableLabel: null,
  customerCount: 2,
  orderNote: "",
  discountPercentage: 0,
  taxRate: 0.08, // 8% default tax
  items: [],

  setOrderType: (type) => set({ orderType: type }),
  setTable: (tableId, label) => set({ selectedTableId: tableId, selectedTableLabel: label }),
  setCustomerCount: (count) => set({ customerCount: count }),
  setOrderNote: (note) => set({ orderNote: note }),
  setDiscountPercentage: (discount) => set({ discountPercentage: discount }),
  setTaxRate: (rate) => set({ taxRate: rate }),

  addItem: (product) => {
    const modifierTotal = (product.modifiers || []).reduce((acc, m) => acc + m.priceAdjust, 0);
    const unitPrice = product.price + modifierTotal;
    const modifierKey = (product.modifiers || [])
      .map((m) => `${m.modifierId}:${m.optionId || m.optionLabel}`)
      .sort()
      .join("|");

    const existingIndex = get().items.findIndex(
      (item) =>
        item.menuItemId === product.menuItemId &&
        (item.modifiers || [])
          .map((m) => `${m.modifierId}:${m.optionId || m.optionLabel}`)
          .sort()
          .join("|") === modifierKey &&
        (item.note || "") === (product.note || "")
    );

    if (existingIndex > -1) {
      set((state) => {
        const updated = [...state.items];
        updated[existingIndex].quantity += 1;
        return { items: updated };
      });
    } else {
      const newItem: CartItem = {
        cartItemId: `${product.menuItemId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        menuItemId: product.menuItemId,
        name: product.name,
        imageUrl: product.imageUrl,
        basePrice: product.price,
        unitPrice,
        quantity: 1,
        note: product.note,
        modifiers: product.modifiers || [],
      };
      set((state) => ({ items: [...state.items, newItem] }));
    }
  },

  updateQuantity: (cartItemId, delta) => {
    set((state) => {
      const updated = state.items
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      return { items: updated };
    });
  },

  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.cartItemId !== cartItemId),
    }));
  },

  updateItemNote: (cartItemId, note) => {
    set((state) => ({
      items: state.items.map((item) => (item.cartItemId === cartItemId ? { ...item, note } : item)),
    }));
  },

  clearCart: () => {
    set({
      items: [],
      orderNote: "",
      discountPercentage: 0,
      selectedTableId: null,
      selectedTableLabel: null,
    });
  },

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  },

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    return (subtotal * get().discountPercentage) / 100;
  },

  getTaxAmount: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const taxable = Math.max(0, subtotal - discount);
    return taxable * get().taxRate;
  },

  getTotalAmount: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const tax = get().getTaxAmount();
    return Math.max(0, subtotal - discount + tax);
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },
}));
