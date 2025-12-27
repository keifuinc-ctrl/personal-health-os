import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testResult } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { logSuccess, logFailure } from '@/lib/services/audit-log';
import { updateTestResultSchema } from '@/lib/validations/test-result';
import { headers } from 'next/headers';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/beneficiary/test-results/[id] - 検査結果詳細取得
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

    const [result] = await db
      .select()
      .from(testResult)
      .where(
        and(
          eq(testResult.id, id),
          eq(testResult.userId, session.user.id)
        )
      )
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { error: '検査結果が見つかりません' },
        { status: 404 }
      );
    }

    await logSuccess(session.user.id, 'read', 'test_result', id);

    return NextResponse.json({ testResult: result });
  } catch (error) {
    console.error('Failed to fetch test result:', error);
    await logFailure(null, 'read', 'test_result', 'Failed to fetch test result');
    return NextResponse.json(
      { error: '検査結果の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT /api/beneficiary/test-results/[id] - 検査結果更新
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
      .from(testResult)
      .where(
        and(
          eq(testResult.id, id),
          eq(testResult.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '検査結果が見つかりません' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateTestResultSchema.parse(body);

    const [updated] = await db
      .update(testResult)
      .set({
        ...validatedData,
        testDate: validatedData.testDate ? new Date(validatedData.testDate) : existing.testDate,
        updatedAt: new Date(),
      })
      .where(eq(testResult.id, id))
      .returning();

    await logSuccess(session.user.id, 'update', 'test_result', id, {
      updatedFields: Object.keys(validatedData),
    });

    return NextResponse.json({ testResult: updated });
  } catch (error) {
    console.error('Failed to update test result:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: '入力データが無効です', details: error },
        { status: 400 }
      );
    }

    await logFailure(null, 'update', 'test_result', 'Failed to update test result');
    return NextResponse.json(
      { error: '検査結果の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE /api/beneficiary/test-results/[id] - 検査結果削除
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
      .from(testResult)
      .where(
        and(
          eq(testResult.id, id),
          eq(testResult.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '検査結果が見つかりません' },
        { status: 404 }
      );
    }

    await db.delete(testResult).where(eq(testResult.id, id));

    await logSuccess(session.user.id, 'delete', 'test_result', id, {
      testName: existing.testName,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete test result:', error);
    await logFailure(null, 'delete', 'test_result', 'Failed to delete test result');
    return NextResponse.json(
      { error: '検査結果の削除に失敗しました' },
      { status: 500 }
    );
  }
}

