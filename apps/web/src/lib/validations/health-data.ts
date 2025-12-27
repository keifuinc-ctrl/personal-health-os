import { z } from 'zod';

export const dataTypes = ['weight', 'blood_pressure', 'exercise', 'sleep', 'steps', 'heart_rate'] as const;
export type DataType = typeof dataTypes[number];

export const dataTypeLabels: Record<DataType, string> = {
  weight: '体重',
  blood_pressure: '血圧',
  exercise: '運動',
  sleep: '睡眠',
  steps: '歩数',
  heart_rate: '心拍数',
};

export const dataTypeUnits: Record<DataType, string> = {
  weight: 'kg',
  blood_pressure: 'mmHg',
  exercise: '分',
  sleep: '時間',
  steps: '歩',
  heart_rate: 'bpm',
};

export const createHealthDataSchema = z.object({
  dataType: z.enum(dataTypes),
  value: z.string().min(1, '値は必須です'),
  unit: z.string().optional(),
  recordedAt: z.string().datetime({ message: '有効な日時を入力してください' }),
  source: z.enum(['manual', 'device', 'ehr']).default('manual'),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateHealthDataInput = z.infer<typeof createHealthDataSchema>;

