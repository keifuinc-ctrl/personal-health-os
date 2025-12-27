// 診療記録APIルート
// 診療記録のCRUD操作を提供するAPIエンドポイント
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medicalRecord } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc, and, ilike, or } from 'drizzle-orm';
import { logSuccess, logFailure } from '@/lib/services/audit-log';
import { createMedicalRecordSchema } from '@/lib/validations/medical-record';
import { headers } from 'next/headers';

// GET /api/beneficiary/medical-records - 診療記録一覧取得（検索・フィルター対応）
// クエリパラメータ: search（検索文字列）、recordType（記録タイプ）
export async function GET(request: NextRequest) {
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

    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const recordType = searchParams.get('recordType');

    // 条件を構築
    const conditions = [eq(medicalRecord.userId, session.user.id)];

    // 検索条件（タイトルまたは内容）
    if (search) {
      conditions.push(
        or(
          ilike(medicalRecord.title, `%${search}%`),
          ilike(medicalRecord.content, `%${search}%`)
        )!
      );
    }

    // 種類フィルター
    if (recordType) {
      conditions.push(eq(medicalRecord.recordType, recordType));
    }

    const medicalRecords = await db
      .select()
      .from(medicalRecord)
      .where(and(...conditions))
      .orderBy(desc(medicalRecord.recordDate));

    await logSuccess(session.user.id, 'read', 'medical_record', undefined, {
      count: medicalRecords.length,
      search,
      recordType,
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

