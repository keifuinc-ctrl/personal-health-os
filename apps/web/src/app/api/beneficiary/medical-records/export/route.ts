import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medicalRecord } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { logSuccess, logFailure } from '@/lib/services/audit-log';
import { headers } from 'next/headers';
import {
  convertToCSV,
  medicalRecordColumns,
  generateFilename,
} from '@/lib/services/export';

// GET /api/beneficiary/medical-records/export - 診療記録CSVエクスポート
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

    const csvContent = convertToCSV(medicalRecords, medicalRecordColumns);

    await logSuccess(session.user.id, 'export', 'medical_record', undefined, {
      format: 'csv',
      count: medicalRecords.length,
    });

    const filename = generateFilename('medical-records');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Failed to export medical records:', error);
    await logFailure(null, 'export', 'medical_record', 'Failed to export medical records');
    return NextResponse.json(
      { error: '診療記録のエクスポートに失敗しました' },
      { status: 500 }
    );
  }
}

