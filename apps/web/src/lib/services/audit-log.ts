// 監査ログサービス
// すべてのデータ操作を記録し、セキュリティとコンプライアンスを確保
import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';
import { headers } from 'next/headers';

// 監査アクションの型定義
// 記録される操作の種類
export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'export';

// リソースタイプの型定義
// 監査ログが記録されるリソースの種類
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

// ログアクションのパラメータ型定義
interface LogActionParams {
  userId: string | null;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  details?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
}

// 監査ログを記録する
// すべてのデータ操作で使用する（作成、読み取り、更新、削除、エクスポート）
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

// 成功した操作のログを記録するヘルパー関数
// 成功時の監査ログを簡単に記録するためのラッパー
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

// 失敗した操作のログを記録するヘルパー関数
// エラー時の監査ログを簡単に記録するためのラッパー
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

