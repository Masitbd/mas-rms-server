import { z } from "zod";

// Define the Zod validation schema for RawMaterials
export const RawMaterialsSchema = z.object({
  body: z.object({
    id: z.string().min(1).max(100, "ID must be less than 100 characters"),

    baseUnit: z.string().min(1, "Base Unit is required"),

    materialName: z.string().min(1, "Material Name is required"),

    superUnit: z.string().min(1, "Super Unit is required"),

    rate: z.number().nonnegative("Conversion must be a non-negative number"),
    conversion: z
      .number()
      .nonnegative("Conversion must be a non-negative number"),

    description: z.string().optional(),
  }),
});

// Define the Zod validation schema for updating RawMaterials
export const RawMaterialsUpdateSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    baseUnit: z.string().optional(),
    materialName: z.string().optional(),
    superUnit: z.string().optional(),
    rate: z.number().optional(),
    conversion: z.number().optional(),
    description: z.string().optional(),
  }),
});

// Type inference for the RawMaterials update schema
export type RawMaterialsUpdateType = z.infer<typeof RawMaterialsUpdateSchema>;

// Type inference for the RawMaterials schema
export type RawMaterialsType = z.infer<typeof RawMaterialsSchema>;
