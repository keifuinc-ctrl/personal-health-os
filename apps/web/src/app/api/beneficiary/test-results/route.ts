import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testResult } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { logSuccess, logFailure } from '@/lib/services/audit-log';
import { createTestResultSchema } from '@/lib/validations/test-result';
import { headers } from 'next/headers';

// GET /api/beneficiary/test-results - 検査結果一覧取得
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

    const testResults = await db
      .select()
      .from(testResult)
      .where(eq(testResult.userId, session.user.id))
      .orderBy(desc(testResult.testDate));

    await logSuccess(session.user.id, 'read', 'test_result', undefined, {
      count: testResults.length,
    });

    return NextResponse.json({ testResults });
  } catch (error) {
    console.error('Failed to fetch test results:', error);
    await logFailure(null, 'read', 'test_result', 'Failed to fetch test results');
    return NextResponse.json(
      { error: '検査結果の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST /api/beneficiary/test-results - 検査結果追加
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
    const validatedData = createTestResultSchema.parse(body);

    const [newTestResult] = await db
      .insert(testResult)
      .values({
        userId: session.user.id,
        testName: validatedData.testName,
        testDate: new Date(validatedData.testDate),
        result: validatedData.result,
        unit: validatedData.unit,
        referenceRange: validatedData.referenceRange,
        facilityName: validatedData.facilityName,
        notes: validatedData.notes,
      })
      .returning();

    await logSuccess(session.user.id, 'create', 'test_result', newTestResult.id, {
      testName: validatedData.testName,
    });

    return NextResponse.json({ testResult: newTestResult }, { status: 201 });
  } catch (error) {
    console.error('Failed to create test result:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: '入力データが無効です', details: error },
        { status: 400 }
      );
    }

    await logFailure(null, 'create', 'test_result', 'Failed to create test result');
    return NextResponse.json(
      { error: '検査結果の追加に失敗しました' },
      { status: 500 }
    );
  }
}

