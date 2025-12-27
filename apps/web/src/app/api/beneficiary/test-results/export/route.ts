import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testResult } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { logSuccess, logFailure } from '@/lib/services/audit-log';
import { headers } from 'next/headers';
import {
  convertToCSV,
  testResultColumns,
  generateFilename,
} from '@/lib/services/export';

// GET /api/beneficiary/test-results/export - 検査結果CSVエクスポート
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

    const csvContent = convertToCSV(testResults, testResultColumns);

    await logSuccess(session.user.id, 'export', 'test_result', undefined, {
      format: 'csv',
      count: testResults.length,
    });

    const filename = generateFilename('test-results');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Failed to export test results:', error);
    await logFailure(null, 'export', 'test_result', 'Failed to export test results');
    return NextResponse.json(
      { error: '検査結果のエクスポートに失敗しました' },
      { status: 500 }
    );
  }
}

