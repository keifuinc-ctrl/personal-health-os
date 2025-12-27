// Cloudflare AI Gateway クライアント
// AI Gateway経由で複数のAIプロバイダー（OpenAI、Anthropic、Google AI Studio）に
// 統一されたインターフェースでアクセスします
// @see https://developers.cloudflare.com/ai-gateway/
import OpenAI from 'openai';

// 環境変数から設定を取得
// Cloudflare AI Gatewayの設定に必要な環境変数
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID; // CloudflareアカウントID
const gatewayName = process.env.CLOUDFLARE_GATEWAY_NAME; // AI Gateway名
const apiToken = process.env.CLOUDFLARE_API_TOKEN; // 認証付きゲートウェイの場合のみ必要
const providerApiKey = process.env.OPENAI_API_KEY; // Request Headers方式の場合のみ必要（プロバイダーのAPIキー）

// サポートするAIプロバイダー
export type AIProvider = 'openai' | 'anthropic' | 'google';

// プロバイダーごとのモデルマッピング
// AI Gatewayで使用するモデル名を定義
const MODEL_MAP: Record<AIProvider, string> = {
  openai: 'openai/gpt-4o-mini',
  anthropic: 'anthropic/claude-sonnet-4-5',
  google: 'google-ai-studio/gemini-2.5-flash',
};

// AI Gatewayが利用可能かどうかをチェック
export function isAIGatewayConfigured(): boolean {
  return !!(accountId && gatewayName);
}

// エンドポイントURLを構築
function getBaseURL(): string | null {
  if (!accountId || !gatewayName) {
    return null;
  }
  return `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/compat`;
}

// OpenAIクライアントを作成
function createClient(): OpenAI | null {
  const baseURL = getBaseURL();
  
  if (!baseURL) {
    console.warn('AI Gateway is not configured. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_GATEWAY_NAME.');
    return null;
  }

  if (!providerApiKey) {
    console.warn('Provider API key is not configured. Please set OPENAI_API_KEY for Request Headers method.');
    return null;
  }

  return new OpenAI({
    apiKey: providerApiKey,
    defaultHeaders: apiToken ? {
      'cf-aig-authorization': `Bearer ${apiToken}`,
    } : {},
    baseURL,
  });
}

// シングルトンクライアント
let clientInstance: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

/**
 * AI Gateway経由でチャットコンプリーションを実行
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  provider?: AIProvider;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatCompletionResult {
  content: string | null;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * AI Gatewayを使用してチャットコンプリーションを実行
 * 
 * @param options - チャットコンプリーションのオプション
 * @returns チャットコンプリーションの結果、またはAI Gateway利用不可の場合はnull
 */
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult | null> {
  const { messages, provider = 'openai', maxTokens = 1000, temperature = 0.7 } = options;
  
  const client = getClient();
  
  if (!client) {
    return null;
  }

  const model = MODEL_MAP[provider];

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    });

    return {
      content: response.choices[0]?.message?.content || null,
      provider,
      model,
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    console.error('AI Gateway chat completion error:', error);
    throw error;
  }
}

/**
 * 健康データ分析用のAI呼び出し
 * 
 * @param prompt - 分析用のプロンプト
 * @param provider - 使用するAIプロバイダー
 * @returns 分析結果のテキスト、またはnull
 */
export async function analyzeHealthData(
  prompt: string,
  provider: AIProvider = 'openai'
): Promise<string | null> {
  try {
    const result = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: `あなたは医療・健康データ分析の専門家です。
提供されたデータに基づいて、客観的かつ正確な分析を行ってください。
重要: あなたの分析は参考情報であり、医療アドバイスではありません。
具体的な医療判断は必ず医療専門家に相談するよう促してください。`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      provider,
      maxTokens: 2000,
      temperature: 0.3, // 分析には低めの温度を使用
    });

    return result?.content || null;
  } catch (error) {
    console.error('Health data analysis error:', error);
    return null;
  }
}

/**
 * グループマッチングスコア計算用のAI呼び出し
 * 
 * @param userProfile - ユーザーのプロファイル情報（匿名化済み）
 * @param groupCriteria - グループの条件
 * @param provider - 使用するAIプロバイダー
 * @returns マッチングスコア（0-100）と理由、またはnull
 */
export interface MatchingResult {
  score: number;
  reasons: string[];
  confidence: number;
}

export async function calculateMatchingScore(
  userProfile: Record<string, unknown>,
  groupCriteria: Record<string, unknown>,
  provider: AIProvider = 'openai'
): Promise<MatchingResult | null> {
  const prompt = `
以下のユーザープロファイルとグループ条件を比較し、マッチング度を評価してください。

## ユーザープロファイル（匿名化済み）:
${JSON.stringify(userProfile, null, 2)}

## グループ条件:
${JSON.stringify(groupCriteria, null, 2)}

## 出力形式（JSONのみ、他のテキストは含めないでください）:
{
  "score": 0-100の数値,
  "reasons": ["マッチング理由1", "マッチング理由2", ...],
  "confidence": 0-1の数値（この評価への信頼度）
}
`;

  try {
    const result = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: `あなたはヘルスケアグループマッチングの専門家です。
ユーザーとグループの適合度を客観的に評価してください。
出力は必ず指定されたJSON形式のみで返してください。`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      provider,
      maxTokens: 500,
      temperature: 0.2, // マッチングには低めの温度を使用
    });

    if (!result?.content) {
      return null;
    }

    // JSONをパース
    const parsed = JSON.parse(result.content);
    return {
      score: Math.min(100, Math.max(0, parsed.score)),
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
    };
  } catch (error) {
    console.error('Matching score calculation error:', error);
    return null;
  }
}

/**
 * AI Gateway設定情報を取得（デバッグ用）
 */
export function getAIGatewayInfo(): {
  configured: boolean;
  endpoint: string | null;
  hasApiToken: boolean;
  hasProviderKey: boolean;
} {
  return {
    configured: isAIGatewayConfigured(),
    endpoint: getBaseURL(),
    hasApiToken: !!apiToken,
    hasProviderKey: !!providerApiKey,
  };
}


