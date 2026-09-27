import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  branchId: z.string().min(1, "Branch is required"),
  parentId: z.string().optional().nullable(),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  cost: z.number().nonnegative().optional(),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  prepTime: z.number().int().optional(),
  categoryId: z.string().min(1, "Category is required"),
});

export const modifierOptionSchema = z.object({
  label: z.string().min(1, "Label is required"),
  priceAdjust: z.number().default(0),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const menuItemModifierSchema = z.object({
  name: z.string().min(1, "Modifier name is required"),
  type: z.enum(["SELECT", "MULTI", "TEXT", "QUANTITY"]).default("SELECT"),
  isRequired: z.boolean().default(false),
  minSelect: z.number().int().default(0),
  maxSelect: z.number().int().default(1),
  sortOrder: z.number().int().default(0),
  options: z.array(modifierOptionSchema).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type MenuItemModifierInput = z.infer<typeof menuItemModifierSchema>;
