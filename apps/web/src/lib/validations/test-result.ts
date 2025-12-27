// 検査結果のバリデーションスキーマ
// Zodを使用して検査結果の入力値検証を定義
import { z } from 'zod';

// 検査結果作成時のバリデーションスキーマ
export const createTestResultSchema = z.object({
  testName: z.string().min(1, '検査名は必須です'), // 検査名（必須）
  testDate: z.string().datetime({ message: '有効な日付を入力してください' }), // 検査日（必須、ISO 8601形式）
  result: z.string().optional(), // 結果値（任意）
  unit: z.string().optional(), // 単位（任意）
  referenceRange: z.string().optional(), // 基準範囲（任意）
  facilityName: z.string().optional(), // 検査施設名（任意）
  notes: z.string().optional(), // メモ（任意）
});

// 検査結果更新時のバリデーションスキーマ（すべてのフィールドが任意）
export const updateTestResultSchema = createTestResultSchema.partial();

// 型定義（TypeScriptの型推論用）
export type CreateTestResultInput = z.infer<typeof createTestResultSchema>;
export type UpdateTestResultInput = z.infer<typeof updateTestResultSchema>;

