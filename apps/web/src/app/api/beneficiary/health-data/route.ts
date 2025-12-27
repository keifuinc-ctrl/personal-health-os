import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { healthData } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc, and, gte } from 'drizzle-orm';
import { logSuccess, logFailure } from '@/lib/services/audit-log';
import { createHealthDataSchema } from '@/lib/validations/health-data';
import { headers } from 'next/headers';

// GET /api/beneficiary/health-data - 健康データ一覧取得
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

    // クエリパラメータ取得
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('dataType');
    const days = searchParams.get('days');

    let query = db
      .select()
      .from(healthData)
      .where(eq(healthData.userId, session.user.id))
      .orderBy(desc(healthData.recordedAt))
      .$dynamic();

    // データタイプでフィルター
    if (dataType) {
      query = query.where(
        and(
          eq(healthData.userId, session.user.id),
          eq(healthData.dataType, dataType)
        )
      );
    }

    // 日数でフィルター
    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      query = query.where(
        and(
          eq(healthData.userId, session.user.id),
          gte(healthData.recordedAt, daysAgo)
        )
      );
    }

    const data = await query;

    await logSuccess(session.user.id, 'read', 'health_data', undefined, {
      count: data.length,
      dataType,
    });

    return NextResponse.json({ healthData: data });
  } catch (error) {
    console.error('Failed to fetch health data:', error);
    await logFailure(null, 'read', 'health_data', 'Failed to fetch health data');
    return NextResponse.json(
      { error: '健康データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST /api/beneficiary/health-data - 健康データ追加
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
    const validatedData = createHealthDataSchema.parse(body);

    const [newData] = await db
      .insert(healthData)
      .values({
        userId: session.user.id,
        dataType: validatedData.dataType,
        value: validatedData.value,
        unit: validatedData.unit,
        recordedAt: new Date(validatedData.recordedAt),
        source: validatedData.source,
        metadata: validatedData.metadata,
      })
      .returning();

    await logSuccess(session.user.id, 'create', 'health_data', newData.id, {
      dataType: validatedData.dataType,
      value: validatedData.value,
    });

    return NextResponse.json({ healthData: newData }, { status: 201 });
  } catch (error) {
    console.error('Failed to create health data:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: '入力データが無効です', details: error },
        { status: 400 }
      );
    }

    await logFailure(null, 'create', 'health_data', 'Failed to create health data');
    return NextResponse.json(
      { error: '健康データの追加に失敗しました' },
      { status: 500 }
    );
  }
}

