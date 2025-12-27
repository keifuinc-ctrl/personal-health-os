// AI分析サービス
// 健康データの分析機能を提供します
// AI Gateway連携が利用可能な場合はAI分析を実行し、
// 利用不可の場合はルールベースの分析にフォールバックします
// @see AGENTS.md - AI原則に従い、PIIを含まない集計データのみを送信
import { db } from '@/lib/db';
import { healthData, testResult, medication, medicalRecord, riskPrediction } from '@/lib/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { analyzeHealthData, isAIGatewayConfigured, AIProvider } from './ai-gateway';
import { logSuccess, logFailure } from './audit-log';

// 分析結果の型定義
// AI分析またはルールベース分析の結果を格納
export interface HealthAnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  analysisSource: 'ai' | 'rule-based';
  generatedAt: Date;
}

// 集計データの型定義（PIIを含まない）
// 個人を特定できる情報（PII）を除外し、匿名化された集計データのみをAIに送信
export interface AggregatedHealthData {
  healthMetrics: {
    dataType: string;
    latestValue: string;
    unit: string | null;
    recordedAt: Date;
    trend?: 'increasing' | 'decreasing' | 'stable';
  }[];
  recentTestResults: {
    testName: string;
    result: string | null;
    testDate: Date;
    isNormal: boolean | null;
  }[];
  activeMedications: {
    name: string;
    dosage: string | null;
    frequency: string | null;
  }[];
  medicalHistory: {
    recordType: string;
    count: number;
  }[];
}

/**
 * ユーザーの健康データを集計する（匿名化済み）
 * 
 * @param userId - ユーザーID
 * @returns 集計された健康データ
 */
export async function aggregateHealthData(userId: string): Promise<AggregatedHealthData> {
  // 過去30日間のデータを取得
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 健康メトリクスを取得
  const healthMetrics = await db
    .select({
      dataType: healthData.dataType,
      value: healthData.value,
      unit: healthData.unit,
      recordedAt: healthData.recordedAt,
    })
    .from(healthData)
    .where(and(
      eq(healthData.userId, userId),
      gte(healthData.recordedAt, thirtyDaysAgo)
    ))
    .orderBy(desc(healthData.recordedAt))
    .limit(50);

  // 検査結果を取得
  const recentTests = await db
    .select({
      testName: testResult.testName,
      result: testResult.result,
      testDate: testResult.testDate,
      referenceRange: testResult.referenceRange,
    })
    .from(testResult)
    .where(and(
      eq(testResult.userId, userId),
      gte(testResult.testDate, thirtyDaysAgo)
    ))
    .orderBy(desc(testResult.testDate))
    .limit(20);

  // 服用中の薬を取得
  const activeMeds = await db
    .select({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
    })
    .from(medication)
    .where(and(
      eq(medication.userId, userId),
      eq(medication.isActive, true)
    ))
    .limit(20);

  // 診療記録のサマリを取得
  const records = await db
    .select({
      recordType: medicalRecord.recordType,
    })
    .from(medicalRecord)
    .where(eq(medicalRecord.userId, userId));

  // 記録タイプごとにカウント
  const recordTypeCounts = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.recordType] = (acc[record.recordType] || 0) + 1;
    return acc;
  }, {});

  return {
    healthMetrics: healthMetrics.map(m => ({
      dataType: m.dataType,
      latestValue: m.value,
      unit: m.unit,
      recordedAt: m.recordedAt,
    })),
    recentTestResults: recentTests.map(t => ({
      testName: t.testName,
      result: t.result,
      testDate: t.testDate,
      isNormal: t.referenceRange ? isResultNormal(t.result, t.referenceRange) : null,
    })),
    activeMedications: activeMeds,
    medicalHistory: Object.entries(recordTypeCounts).map(([recordType, count]) => ({
      recordType,
      count,
    })),
  };
}

/**
 * 検査結果が正常範囲内かどうかを判定
 */
function isResultNormal(result: string | null, referenceRange: string): boolean | null {
  if (!result) return null;
  
  const numResult = parseFloat(result);
  if (isNaN(numResult)) return null;

  // 参照範囲をパース（例: "10-20", "<100", ">5"）
  const rangeMatch = referenceRange.match(/^(\d+\.?\d*)\s*-\s*(\d+\.?\d*)$/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    return numResult >= min && numResult <= max;
  }

  const lessThanMatch = referenceRange.match(/^<\s*(\d+\.?\d*)$/);
  if (lessThanMatch) {
    return numResult < parseFloat(lessThanMatch[1]);
  }

  const greaterThanMatch = referenceRange.match(/^>\s*(\d+\.?\d*)$/);
  if (greaterThanMatch) {
    return numResult > parseFloat(greaterThanMatch[1]);
  }

  return null;
}

/**
 * ルールベースの健康分析を実行
 */
function performRuleBasedAnalysis(data: AggregatedHealthData): HealthAnalysisResult {
  const insights: string[] = [];
  const recommendations: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';

  // 健康メトリクスの分析
  if (data.healthMetrics.length > 0) {
    insights.push(`過去30日間で${data.healthMetrics.length}件の健康データが記録されています。`);
    
    const dataTypes = [...new Set(data.healthMetrics.map(m => m.dataType))];
    insights.push(`記録されているデータタイプ: ${dataTypes.join(', ')}`);
  } else {
    recommendations.push('健康データの定期的な記録をお勧めします。');
  }

  // 検査結果の分析
  const abnormalTests = data.recentTestResults.filter(t => t.isNormal === false);
  if (abnormalTests.length > 0) {
    insights.push(`${abnormalTests.length}件の検査結果が基準値外です。`);
    recommendations.push('基準値外の検査結果について、医療専門家への相談をお勧めします。');
    riskLevel = abnormalTests.length >= 3 ? 'high' : 'medium';
  } else if (data.recentTestResults.length > 0) {
    insights.push('最近の検査結果はすべて正常範囲内です。');
    riskLevel = 'low';
  }

  // 服用薬の分析
  if (data.activeMedications.length > 0) {
    insights.push(`現在${data.activeMedications.length}種類の薬を服用中です。`);
    if (data.activeMedications.length >= 5) {
      recommendations.push('複数の薬を服用中の場合、薬剤師への相談をお勧めします。');
    }
  }

  // サマリ生成
  const summary = generateRuleBasedSummary(data, insights, riskLevel);

  return {
    summary,
    insights,
    recommendations,
    riskLevel,
    analysisSource: 'rule-based',
    generatedAt: new Date(),
  };
}

/**
 * ルールベースのサマリを生成
 */
function generateRuleBasedSummary(
  data: AggregatedHealthData,
  insights: string[],
  riskLevel: string
): string {
  const parts: string[] = [];

  if (data.healthMetrics.length > 0 || data.recentTestResults.length > 0) {
    parts.push('健康データの分析が完了しました。');
  }

  if (riskLevel === 'low') {
    parts.push('全体的に良好な健康状態です。');
  } else if (riskLevel === 'medium') {
    parts.push('いくつかの項目で注意が必要です。');
  } else if (riskLevel === 'high') {
    parts.push('医療専門家への相談をお勧めします。');
  }

  return parts.join(' ') || '健康データの分析を行いました。';
}

/**
 * AI を使用した健康分析を実行
 */
async function performAIAnalysis(
  data: AggregatedHealthData,
  provider: AIProvider = 'openai'
): Promise<HealthAnalysisResult | null> {
  const prompt = `
以下の健康データを分析し、健康状態の評価と推奨事項を提供してください。

## 健康メトリクス（過去30日間）:
${data.healthMetrics.length > 0 
  ? data.healthMetrics.map(m => `- ${m.dataType}: ${m.latestValue} ${m.unit || ''} (${m.recordedAt.toLocaleDateString('ja-JP')})`).join('\n')
  : '記録なし'}

## 最近の検査結果:
${data.recentTestResults.length > 0
  ? data.recentTestResults.map(t => `- ${t.testName}: ${t.result || 'N/A'} ${t.isNormal === false ? '(基準値外)' : t.isNormal === true ? '(正常)' : ''}`).join('\n')
  : '記録なし'}

## 服用中の薬:
${data.activeMedications.length > 0
  ? data.activeMedications.map(m => `- ${m.name} ${m.dosage || ''} ${m.frequency || ''}`).join('\n')
  : 'なし'}

## 診療記録:
${data.medicalHistory.length > 0
  ? data.medicalHistory.map(h => `- ${h.recordType}: ${h.count}件`).join('\n')
  : '記録なし'}

## 回答形式（JSONのみ、他のテキストは含めないでください）:
{
  "summary": "全体的な健康状態の要約（日本語、100文字以内）",
  "insights": ["洞察1", "洞察2", "洞察3"],
  "recommendations": ["推奨事項1", "推奨事項2"],
  "riskLevel": "low|medium|high|unknown"
}

重要: 具体的な医療アドバイスは避け、必要に応じて医療専門家への相談を促してください。
`;

  try {
    const response = await analyzeHealthData(prompt, provider);
    
    if (!response) {
      return null;
    }

    // JSONをパース
    const parsed = JSON.parse(response);
    
    return {
      summary: parsed.summary || '分析が完了しました。',
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      riskLevel: ['low', 'medium', 'high', 'unknown'].includes(parsed.riskLevel) 
        ? parsed.riskLevel 
        : 'unknown',
      analysisSource: 'ai',
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('AI analysis parsing error:', error);
    return null;
  }
}

/**
 * ユーザーの健康データを分析する
 * 
 * AI Gatewayが利用可能な場合はAI分析を実行し、
 * 利用不可の場合はルールベースの分析にフォールバックします。
 * 
 * @param userId - ユーザーID
 * @param provider - 使用するAIプロバイダー（オプション）
 * @returns 健康分析結果
 */
export async function analyzeUserHealth(
  userId: string,
  provider: AIProvider = 'openai'
): Promise<HealthAnalysisResult> {
  try {
    // 健康データを集計
    const aggregatedData = await aggregateHealthData(userId);
    
    // AI Gatewayが設定されている場合はAI分析を試行
    if (isAIGatewayConfigured()) {
      const aiResult = await performAIAnalysis(aggregatedData, provider);
      
      if (aiResult) {
        await logSuccess(userId, 'read', 'health_data', undefined, {
          analysisType: 'ai',
          provider,
        });
        return aiResult;
      }
    }
    
    // AI分析が利用できない場合はルールベース分析にフォールバック
    const ruleBasedResult = performRuleBasedAnalysis(aggregatedData);
    
    await logSuccess(userId, 'read', 'health_data', undefined, {
      analysisType: 'rule-based',
    });
    
    return ruleBasedResult;
  } catch (error) {
    console.error('Health analysis error:', error);
    
    await logFailure(userId, 'read', 'health_data', 
      error instanceof Error ? error.message : 'Unknown error');
    
    // エラー時はデフォルトの結果を返す
    return {
      summary: '分析中にエラーが発生しました。',
      insights: [],
      recommendations: ['しばらくしてから再度お試しください。'],
      riskLevel: 'unknown',
      analysisSource: 'rule-based',
      generatedAt: new Date(),
    };
  }
}

/**
 * リスク予測を保存する
 */
export async function saveRiskPrediction(
  userId: string,
  analysisResult: HealthAnalysisResult
): Promise<void> {
  try {
    await db.insert(riskPrediction).values({
      userId,
      riskType: 'general_health',
      riskScore: riskLevelToScore(analysisResult.riskLevel),
      timeframe: '30days',
      factors: {
        insights: analysisResult.insights,
        source: analysisResult.analysisSource,
      },
      recommendations: {
        items: analysisResult.recommendations,
      },
    });

    await logSuccess(userId, 'create', 'risk_prediction');
  } catch (error) {
    console.error('Failed to save risk prediction:', error);
    await logFailure(userId, 'create', 'risk_prediction',
      error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * リスクレベルをスコアに変換
 */
function riskLevelToScore(riskLevel: string): number {
  switch (riskLevel) {
    case 'low': return 25;
    case 'medium': return 50;
    case 'high': return 75;
    default: return 0;
  }
}


