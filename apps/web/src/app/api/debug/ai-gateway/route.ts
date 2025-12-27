// AI Gateway設定確認用デバッグエンドポイント
// GET /api/debug/ai-gateway
// AI Gatewayの設定状態を確認するためのデバッグ用API
// 本番環境では無効化またはアクセス制限を設けてください
import { NextResponse } from 'next/server';
import { getAIGatewayInfo, isAIGatewayConfigured } from '@/lib/services/ai-gateway';

export async function GET() {
  // 本番環境では無効化（セキュリティ対策）
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  const info = getAIGatewayInfo();

  return NextResponse.json({
    status: isAIGatewayConfigured() ? '✅ 設定済み' : '❌ 未設定',
    details: {
      accountId: info.configured ? '✅ 設定済み' : '❌ 未設定（CLOUDFLARE_ACCOUNT_ID）',
      gatewayName: info.endpoint ? '✅ 設定済み' : '❌ 未設定（CLOUDFLARE_GATEWAY_NAME）',
      apiToken: info.hasApiToken ? '✅ 設定済み（認証付きゲートウェイ）' : '⚠️ 未設定（認証なしゲートウェイを使用）',
      providerApiKey: info.hasProviderKey ? '✅ 設定済み（OPENAI_API_KEY）' : '❌ 未設定（OPENAI_API_KEY）',
    },
    endpoint: info.endpoint || '（Account IDまたはGateway名が未設定）',
    message: info.configured && info.hasProviderKey
      ? 'AI Gateway連携の準備が完了しています'
      : 'いくつかの環境変数が未設定です',
  });
}


