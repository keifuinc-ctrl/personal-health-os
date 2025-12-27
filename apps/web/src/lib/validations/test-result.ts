import { z } from 'zod';

export const createTestResultSchema = z.object({
  testName: z.string().min(1, '検査名は必須です'),
  testDate: z.string().datetime({ message: '有効な日付を入力してください' }),
  result: z.string().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  facilityName: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTestResultSchema = createTestResultSchema.partial();

export type CreateTestResultInput = z.infer<typeof createTestResultSchema>;
export type UpdateTestResultInput = z.infer<typeof updateTestResultSchema>;

