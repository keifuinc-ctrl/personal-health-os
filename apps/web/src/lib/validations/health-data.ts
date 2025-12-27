// 健康データのバリデーションスキーマ
// Zodを使用して健康データの入力値検証を定義
import { z } from 'zod';

// データタイプの定義（定数配列）
export const dataTypes = ['weight', 'blood_pressure', 'exercise', 'sleep', 'steps', 'heart_rate'] as const;
export type DataType = typeof dataTypes[number];

// データタイプの日本語ラベル
export const dataTypeLabels: Record<DataType, string> = {
  weight: '体重',
  blood_pressure: '血圧',
  exercise: '運動',
  sleep: '睡眠',
  steps: '歩数',
  heart_rate: '心拍数',
};

// データタイプごとの単位
export const dataTypeUnits: Record<DataType, string> = {
  weight: 'kg',
  blood_pressure: 'mmHg',
  exercise: '分',
  sleep: '時間',
  steps: '歩',
  heart_rate: 'bpm',
};

// 健康データ作成時のバリデーションスキーマ
export const createHealthDataSchema = z.object({
  dataType: z.enum(dataTypes), // データタイプ（必須、定義された値のみ許可）
  value: z.string().min(1, '値は必須です'), // 値（必須）
  unit: z.string().optional(), // 単位（任意）
  recordedAt: z.string().datetime({ message: '有効な日時を入力してください' }), // 記録日時（必須、ISO 8601形式）
  source: z.enum(['manual', 'device', 'ehr']).default('manual'), // データソース（デフォルト: manual）
  metadata: z.record(z.unknown()).optional(), // メタデータ（任意、JSON形式）
});

// 型定義（TypeScriptの型推論用）
export type CreateHealthDataInput = z.infer<typeof createHealthDataSchema>;

