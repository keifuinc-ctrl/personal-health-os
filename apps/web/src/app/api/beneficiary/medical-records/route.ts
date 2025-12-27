import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medicalRecord } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { logSuccess, logFailure } from '@/lib/services/audit-log';
import { createMedicalRecordSchema } from '@/lib/validations/medical-record';
import { headers } from 'next/headers';

// GET /api/beneficiary/medical-records - 診療記録一覧取得
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const medicalRecords = await db
      .select()
      .from(medicalRecord)
      .where(eq(medicalRecord.userId, session.user.id))
      .orderBy(desc(medicalRecord.recordDate));

    await logSuccess(session.user.id, 'read', 'medical_record', undefined, {
      count: medicalRecords.length,
    });

    return NextResponse.json({ medicalRecords });
  } catch (error) {
    console.error('Failed to fetch medical records:', error);
    await logFailure(null, 'read', 'medical_record', 'Failed to fetch medical records');
    return NextResponse.json(
      { error: '診療記録の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST /api/beneficiary/medical-records - 診療記録追加
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createMedicalRecordSchema.parse(body);

    const [newRecord] = await db
      .insert(medicalRecord)
      .values({
        userId: session.user.id,
        recordType: validatedData.recordType,
        title: validatedData.title,
        content: validatedData.content,
        recordDate: new Date(validatedData.recordDate),
        facilityName: validatedData.facilityName,
        doctorName: validatedData.doctorName,
      })
      .returning();

    await logSuccess(session.user.id, 'create', 'medical_record', newRecord.id, {
      recordType: validatedData.recordType,
      title: validatedData.title,
    });

    return NextResponse.json({ medicalRecord: newRecord }, { status: 201 });
  } catch (error) {
    console.error('Failed to create medical record:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: '入力データが無効です', details: error },
        { status: 400 }
      );
    }

    await logFailure(null, 'create', 'medical_record', 'Failed to create medical record');
    return NextResponse.json(
      { error: '診療記録の追加に失敗しました' },
      { status: 500 }
    );
  }
}

