import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medication } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { logSuccess, logFailure } from '@/lib/services/audit-log';
import { headers } from 'next/headers';
import {
  convertToCSV,
  medicationColumns,
  generateFilename,
} from '@/lib/services/export';

// GET /api/beneficiary/medications/export - 薬情報CSVエクスポート
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

    const medications = await db
      .select()
      .from(medication)
      .where(eq(medication.userId, session.user.id))
      .orderBy(desc(medication.createdAt));

    const csvContent = convertToCSV(medications, medicationColumns);

    await logSuccess(session.user.id, 'export', 'medication', undefined, {
      format: 'csv',
      count: medications.length,
    });

    const filename = generateFilename('medications');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Failed to export medications:', error);
    await logFailure(null, 'export', 'medication', 'Failed to export medications');
    return NextResponse.json(
      { error: '薬情報のエクスポートに失敗しました' },
      { status: 500 }
    );
  }
}

