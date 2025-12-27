import { z } from 'zod';

export const recordTypes = ['visit', 'diagnosis', 'procedure', 'consultation', 'other'] as const;
export type RecordType = typeof recordTypes[number];

export const recordTypeLabels: Record<RecordType, string> = {
  visit: '外来受診',
  diagnosis: '診断',
  procedure: '処置・手術',
  consultation: '相談',
  other: 'その他',
};

export const createMedicalRecordSchema = z.object({
  recordType: z.enum(recordTypes),
  title: z.string().min(1, 'タイトルは必須です'),
  content: z.string().optional(),
  recordDate: z.string().datetime({ message: '有効な日付を入力してください' }),
  facilityName: z.string().optional(),
  doctorName: z.string().optional(),
});

export const updateMedicalRecordSchema = createMedicalRecordSchema.partial();

export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>;
export type UpdateMedicalRecordInput = z.infer<typeof updateMedicalRecordSchema>;

