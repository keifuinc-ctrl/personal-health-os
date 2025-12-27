import { z } from 'zod';

export const createMedicationSchema = z.object({
  name: z.string().min(1, '薬品名は必須です'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  prescribedBy: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateMedicationSchema = createMedicationSchema.partial();

export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;

