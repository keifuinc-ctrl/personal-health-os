// 診療記録のバリデーションスキーマ
// Zodを使用して診療記録の入力値検証を定義
import { z } from 'zod';

// 記録タイプの定義（定数配列）
export const recordTypes = ['visit', 'diagnosis', 'procedure', 'consultation', 'other'] as const;
export type RecordType = typeof recordTypes[number];

// 記録タイプの日本語ラベル
export const recordTypeLabels: Record<RecordType, string> = {
  visit: '外来受診',
  diagnosis: '診断',
  procedure: '処置・手術',
  consultation: '相談',
  other: 'その他',
};

// 診療記録作成時のバリデーションスキーマ
export const createMedicalRecordSchema = z.object({
  recordType: z.enum(recordTypes), // 記録タイプ（必須、定義された値のみ許可）
  title: z.string().min(1, 'タイトルは必須です'), // タイトル（必須）
  content: z.string().optional(), // 内容・メモ（任意）
  recordDate: z.string().datetime({ message: '有効な日付を入力してください' }), // 記録日（必須、ISO 8601形式）
  facilityName: z.string().optional(), // 医療機関名（任意）
  doctorName: z.string().optional(), // 担当医名（任意）
});

// 診療記録更新時のバリデーションスキーマ（すべてのフィールドが任意）
export const updateMedicalRecordSchema = createMedicalRecordSchema.partial();

// 型定義（TypeScriptの型推論用）
export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>;
export type UpdateMedicalRecordInput = z.infer<typeof updateMedicalRecordSchema>;

