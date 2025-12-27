// 薬情報のバリデーションスキーマ
// Zodを使用して薬情報の入力値検証を定義
import { z } from 'zod';

// 薬情報作成時のバリデーションスキーマ
export const createMedicationSchema = z.object({
  name: z.string().min(1, '薬品名は必須です'), // 薬品名（必須）
  dosage: z.string().optional(), // 用量（任意）
  frequency: z.string().optional(), // 服用頻度（任意）
  startDate: z.string().datetime().optional(), // 開始日（任意、ISO 8601形式）
  endDate: z.string().datetime().optional(), // 終了日（任意、ISO 8601形式）
  prescribedBy: z.string().optional(), // 処方元（任意）
  notes: z.string().optional(), // メモ（任意）
  isActive: z.boolean().default(true), // 服用中フラグ（デフォルト: true）
});

// 薬情報更新時のバリデーションスキーマ（すべてのフィールドが任意）
export const updateMedicationSchema = createMedicationSchema.partial();

// 型定義（TypeScriptの型推論用）
export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;

