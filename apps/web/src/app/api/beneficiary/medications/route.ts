import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medication } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { logSuccess, logFailure } from '@/lib/services/audit-log';
import { createMedicationSchema } from '@/lib/validations/medication';
import { headers } from 'next/headers';

// GET /api/beneficiary/medications - 薬情報一覧取得
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

    await logSuccess(session.user.id, 'read', 'medication', undefined, {
      count: medications.length,
    });

    return NextResponse.json({ medications });
  } catch (error) {
    console.error('Failed to fetch medications:', error);
    await logFailure(null, 'read', 'medication', 'Failed to fetch medications');
    return NextResponse.json(
      { error: '薬情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST /api/beneficiary/medications - 薬情報追加
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
    const validatedData = createMedicationSchema.parse(body);

    const [newMedication] = await db
      .insert(medication)
      .values({
        userId: session.user.id,
        name: validatedData.name,
        dosage: validatedData.dosage,
        frequency: validatedData.frequency,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        prescribedBy: validatedData.prescribedBy,
        notes: validatedData.notes,
        isActive: validatedData.isActive,
      })
      .returning();

    await logSuccess(session.user.id, 'create', 'medication', newMedication.id, {
      name: validatedData.name,
    });

    return NextResponse.json({ medication: newMedication }, { status: 201 });
  } catch (error) {
    console.error('Failed to create medication:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: '入力データが無効です', details: error },
        { status: 400 }
      );
    }

    await logFailure(null, 'create', 'medication', 'Failed to create medication');
    return NextResponse.json(
      { error: '薬情報の追加に失敗しました' },
      { status: 500 }
    );
  }
}

