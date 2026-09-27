import { z } from "zod";

export const tableSchema = z.object({
  label: z.string().min(1, "Table label is required"),
  capacity: z.number().int().positive().default(2),
  shape: z.enum(["rectangle", "circle", "square"]).default("rectangle"),
  posX: z.number().default(0),
  posY: z.number().default(0),
  width: z.number().default(80),
  height: z.number().default(80),
  rotation: z.number().default(0),
  floorId: z.string().min(1, "Floor is required"),
  isActive: z.boolean().default(true),
});

export const floorSchema = z.object({
  name: z.string().min(1, "Floor name is required"),
  sortOrder: z.number().int().default(0),
  branchId: z.string().min(1, "Branch is required"),
  isActive: z.boolean().default(true),
});

export type TableInput = z.infer<typeof tableSchema>;
export type FloorInput = z.infer<typeof floorSchema>;
