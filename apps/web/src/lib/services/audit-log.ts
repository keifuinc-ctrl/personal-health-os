import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';
import { headers } from 'next/headers';

export type AuditAction = 'create' | 'read' | 'update' | 'delete';

export type AuditResourceType = 
  | 'medication'
  | 'test_result'
  | 'medical_record'
  | 'health_data'
  | 'group'
  | 'group_member'
  | 'ehr_connection'
  | 'ehr_consent'
  | 'prevention_plan'
  | 'risk_prediction'
  | 'user';

interface LogActionParams {
  userId: string | null;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  details?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
}

/**
 * 監査ログを記録する
 * すべてのデータ操作で使用する
 */
export async function logAction({
  userId,
  action,
  resourceType,
  resourceId,
  details,
  success = true,
  errorMessage,
}: LogActionParams): Promise<void> {
  try {
    // リクエストヘッダーから情報を取得
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await db.insert(auditLog).values({
      userId,
      action,
      resourceType,
      resourceId,
      details: details ? details : null,
      ipAddress,
      userAgent,
      success,
      errorMessage,
    });
  } catch (error) {
    // 監査ログの記録失敗はアプリケーションを止めない
    // ただしコンソールには出力
    console.error('Failed to write audit log:', error);
  }
}

/**
 * 成功した操作のログを記録するヘルパー
 */
export async function logSuccess(
  userId: string,
  action: AuditAction,
  resourceType: AuditResourceType,
  resourceId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAction({
    userId,
    action,
    resourceType,
    resourceId,
    details,
    success: true,
  });
}

/**
 * 失敗した操作のログを記録するヘルパー
 */
export async function logFailure(
  userId: string | null,
  action: AuditAction,
  resourceType: AuditResourceType,
  errorMessage: string,
  resourceId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAction({
    userId,
    action,
    resourceType,
    resourceId,
    details,
    success: false,
    errorMessage,
  });
}

