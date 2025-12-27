import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medicalRecord } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { logSuccess, logFailure } from '@/lib/services/audit-log';
import { updateMedicalRecordSchema } from '@/lib/validations/medical-record';
import { headers } from 'next/headers';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/beneficiary/medical-records/[id] - 診療記録詳細取得
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const [record] = await db
      .select()
      .from(medicalRecord)
      .where(
        and(
          eq(medicalRecord.id, id),
          eq(medicalRecord.userId, session.user.id)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: '診療記録が見つかりません' },
        { status: 404 }
      );
    }

    await logSuccess(session.user.id, 'read', 'medical_record', id);

    return NextResponse.json({ medicalRecord: record });
  } catch (error) {
    console.error('Failed to fetch medical record:', error);
    await logFailure(null, 'read', 'medical_record', 'Failed to fetch medical record');
    return NextResponse.json(
      { error: '診療記録の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT /api/beneficiary/medical-records/[id] - 診療記録更新
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 所有者確認
    const [existing] = await db
      .select()
      .from(medicalRecord)
      .where(
        and(
          eq(medicalRecord.id, id),
          eq(medicalRecord.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '診療記録が見つかりません' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateMedicalRecordSchema.parse(body);

    const [updated] = await db
      .update(medicalRecord)
      .set({
        ...validatedData,
        recordDate: validatedData.recordDate ? new Date(validatedData.recordDate) : existing.recordDate,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecord.id, id))
      .returning();

    await logSuccess(session.user.id, 'update', 'medical_record', id, {
      updatedFields: Object.keys(validatedData),
    });

    return NextResponse.json({ medicalRecord: updated });
  } catch (error) {
    console.error('Failed to update medical record:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: '入力データが無効です', details: error },
        { status: 400 }
      );
    }

    await logFailure(null, 'update', 'medical_record', 'Failed to update medical record');
    return NextResponse.json(
      { error: '診療記録の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE /api/beneficiary/medical-records/[id] - 診療記録削除
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 所有者確認
    const [existing] = await db
      .select()
      .from(medicalRecord)
      .where(
        and(
          eq(medicalRecord.id, id),
          eq(medicalRecord.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '診療記録が見つかりません' },
        { status: 404 }
      );
    }

    await db.delete(medicalRecord).where(eq(medicalRecord.id, id));

    await logSuccess(session.user.id, 'delete', 'medical_record', id, {
      title: existing.title,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete medical record:', error);
    await logFailure(null, 'delete', 'medical_record', 'Failed to delete medical record');
    return NextResponse.json(
      { error: '診療記録の削除に失敗しました' },
      { status: 500 }
    );
  }
}

