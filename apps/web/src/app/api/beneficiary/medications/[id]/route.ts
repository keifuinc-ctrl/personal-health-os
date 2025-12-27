import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medication } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { logSuccess, logFailure } from '@/lib/services/audit-log';
import { updateMedicationSchema } from '@/lib/validations/medication';
import { headers } from 'next/headers';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/beneficiary/medications/[id] - 薬情報詳細取得
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

    const [med] = await db
      .select()
      .from(medication)
      .where(
        and(
          eq(medication.id, id),
          eq(medication.userId, session.user.id)
        )
      )
      .limit(1);

    if (!med) {
      return NextResponse.json(
        { error: '薬情報が見つかりません' },
        { status: 404 }
      );
    }

    await logSuccess(session.user.id, 'read', 'medication', id);

    return NextResponse.json({ medication: med });
  } catch (error) {
    console.error('Failed to fetch medication:', error);
    await logFailure(null, 'read', 'medication', 'Failed to fetch medication');
    return NextResponse.json(
      { error: '薬情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT /api/beneficiary/medications/[id] - 薬情報更新
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
      .from(medication)
      .where(
        and(
          eq(medication.id, id),
          eq(medication.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '薬情報が見つかりません' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateMedicationSchema.parse(body);

    const [updated] = await db
      .update(medication)
      .set({
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : existing.startDate,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : existing.endDate,
        updatedAt: new Date(),
      })
      .where(eq(medication.id, id))
      .returning();

    await logSuccess(session.user.id, 'update', 'medication', id, {
      updatedFields: Object.keys(validatedData),
    });

    return NextResponse.json({ medication: updated });
  } catch (error) {
    console.error('Failed to update medication:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: '入力データが無効です', details: error },
        { status: 400 }
      );
    }

    await logFailure(null, 'update', 'medication', 'Failed to update medication');
    return NextResponse.json(
      { error: '薬情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE /api/beneficiary/medications/[id] - 薬情報削除
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
      .from(medication)
      .where(
        and(
          eq(medication.id, id),
          eq(medication.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '薬情報が見つかりません' },
        { status: 404 }
      );
    }

    await db.delete(medication).where(eq(medication.id, id));

    await logSuccess(session.user.id, 'delete', 'medication', id, {
      name: existing.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete medication:', error);
    await logFailure(null, 'delete', 'medication', 'Failed to delete medication');
    return NextResponse.json(
      { error: '薬情報の削除に失敗しました' },
      { status: 500 }
    );
  }
}

