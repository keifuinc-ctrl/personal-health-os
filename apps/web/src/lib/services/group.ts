/**
 * グループマッチングサービス
 * 
 * ユーザーとグループのマッチング機能を提供します。
 * AI Gateway連携が利用可能な場合はAIマッチングを実行し、
 * 利用不可の場合はルールベースのマッチングにフォールバックします。
 */

import { db } from '@/lib/db';
import { group, groupMember, healthData, medication, testResult } from '@/lib/db/schema';
import { eq, and, desc, inArray, sql, count } from 'drizzle-orm';
import { calculateMatchingScore, isAIGatewayConfigured, AIProvider } from './ai-gateway';
import { logSuccess, logFailure } from './audit-log';

// グループ情報の型定義
export interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  groupType: string;
  isPublic: boolean;
  maxMembers: number | null;
  memberCount: number;
  createdBy: string;
  createdAt: Date;
}

// マッチング結果の型定義
export interface GroupMatchResult {
  group: GroupInfo;
  score: number;
  reasons: string[];
  matchSource: 'ai' | 'rule-based';
}

// ユーザープロファイル（匿名化済み）
interface UserProfile {
  healthDataTypes: string[];
  medicationCount: number;
  hasTestResults: boolean;
  recentActivityLevel: 'high' | 'medium' | 'low';
}

// グループ条件
interface GroupCriteria {
  groupType: string;
  name: string;
  description: string | null;
  memberCount: number;
  maxMembers: number | null;
}

/**
 * ユーザーのプロファイルを取得（匿名化済み）
 */
async function getUserProfile(userId: string): Promise<UserProfile> {
  // 過去30日間のデータを取得
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 健康データのタイプを取得
  const healthDataResult = await db
    .selectDistinct({ dataType: healthData.dataType })
    .from(healthData)
    .where(eq(healthData.userId, userId));

  // 服用中の薬の数を取得
  const medicationResult = await db
    .select({ count: count() })
    .from(medication)
    .where(and(
      eq(medication.userId, userId),
      eq(medication.isActive, true)
    ));

  // 検査結果があるかどうかを確認
  const testResultResult = await db
    .select({ count: count() })
    .from(testResult)
    .where(eq(testResult.userId, userId));

  // 最近の活動レベルを計算
  const recentHealthData = await db
    .select({ count: count() })
    .from(healthData)
    .where(and(
      eq(healthData.userId, userId),
      sql`${healthData.recordedAt} >= ${thirtyDaysAgo}`
    ));

  const activityCount = recentHealthData[0]?.count || 0;
  let activityLevel: 'high' | 'medium' | 'low' = 'low';
  if (activityCount >= 20) {
    activityLevel = 'high';
  } else if (activityCount >= 5) {
    activityLevel = 'medium';
  }

  return {
    healthDataTypes: healthDataResult.map(r => r.dataType),
    medicationCount: medicationResult[0]?.count || 0,
    hasTestResults: (testResultResult[0]?.count || 0) > 0,
    recentActivityLevel: activityLevel,
  };
}

/**
 * ルールベースのマッチングスコアを計算
 */
function calculateRuleBasedScore(
  userProfile: UserProfile,
  groupCriteria: GroupCriteria
): { score: number; reasons: string[] } {
  let score = 50; // 基本スコア
  const reasons: string[] = [];

  // グループタイプによるマッチング
  if (groupCriteria.groupType === 'habit') {
    // 習慣改善グループは活動レベルが高いユーザーにマッチ
    if (userProfile.recentActivityLevel === 'high') {
      score += 20;
      reasons.push('健康データの記録が活発です');
    } else if (userProfile.recentActivityLevel === 'medium') {
      score += 10;
      reasons.push('健康データの記録を継続しています');
    }
  }

  if (groupCriteria.groupType === 'support') {
    // サポートグループは服用薬がある、または検査結果があるユーザーにマッチ
    if (userProfile.medicationCount > 0) {
      score += 15;
      reasons.push('服用中の薬があります');
    }
    if (userProfile.hasTestResults) {
      score += 15;
      reasons.push('検査結果の記録があります');
    }
  }

  if (groupCriteria.groupType === 'community') {
    // コミュニティグループは誰でも参加しやすい
    score += 10;
    reasons.push('コミュニティグループへの参加をお勧めします');
  }

  // 健康データのタイプ数による加点
  if (userProfile.healthDataTypes.length >= 3) {
    score += 10;
    reasons.push('複数の健康データを記録しています');
  }

  // メンバー数による調整
  if (groupCriteria.maxMembers && groupCriteria.memberCount >= groupCriteria.maxMembers * 0.8) {
    score -= 10;
    reasons.push('グループがほぼ満員です');
  }

  // スコアを0-100の範囲に制限
  score = Math.min(100, Math.max(0, score));

  return { score, reasons };
}

/**
 * 公開グループを取得
 */
export async function getPublicGroups(): Promise<GroupInfo[]> {
  const groups = await db
    .select({
      id: group.id,
      name: group.name,
      description: group.description,
      groupType: group.groupType,
      isPublic: group.isPublic,
      maxMembers: group.maxMembers,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
    })
    .from(group)
    .where(eq(group.isPublic, true))
    .orderBy(desc(group.createdAt));

  // 各グループのメンバー数を取得
  const groupIds = groups.map(g => g.id);
  
  if (groupIds.length === 0) {
    return [];
  }

  const memberCounts = await db
    .select({
      groupId: groupMember.groupId,
      count: count(),
    })
    .from(groupMember)
    .where(inArray(groupMember.groupId, groupIds))
    .groupBy(groupMember.groupId);

  const memberCountMap = new Map(memberCounts.map(m => [m.groupId, m.count]));

  return groups.map(g => ({
    ...g,
    memberCount: memberCountMap.get(g.id) || 0,
  }));
}

/**
 * ユーザーが参加していないグループを取得
 */
export async function getAvailableGroupsForUser(userId: string): Promise<GroupInfo[]> {
  // ユーザーが既に参加しているグループを取得
  const userMemberships = await db
    .select({ groupId: groupMember.groupId })
    .from(groupMember)
    .where(eq(groupMember.userId, userId));

  const joinedGroupIds = userMemberships.map(m => m.groupId);

  // 公開グループを取得
  const groupQuery = db
    .select({
      id: group.id,
      name: group.name,
      description: group.description,
      groupType: group.groupType,
      isPublic: group.isPublic,
      maxMembers: group.maxMembers,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
    })
    .from(group)
    .where(eq(group.isPublic, true));

  const groups = await groupQuery.orderBy(desc(group.createdAt));

  // ユーザーが参加していないグループのみをフィルタリング
  const availableGroups = groups.filter(g => !joinedGroupIds.includes(g.id));

  // 各グループのメンバー数を取得
  const groupIds = availableGroups.map(g => g.id);
  
  if (groupIds.length === 0) {
    return [];
  }

  const memberCounts = await db
    .select({
      groupId: groupMember.groupId,
      count: count(),
    })
    .from(groupMember)
    .where(inArray(groupMember.groupId, groupIds))
    .groupBy(groupMember.groupId);

  const memberCountMap = new Map(memberCounts.map(m => [m.groupId, m.count]));

  return availableGroups.map(g => ({
    ...g,
    memberCount: memberCountMap.get(g.id) || 0,
  }));
}

/**
 * マッチングするグループを検索
 * 
 * AI Gatewayが利用可能な場合はAIマッチングを実行し、
 * 利用不可の場合はルールベースのマッチングにフォールバックします。
 * 
 * @param userId - ユーザーID
 * @param limit - 返すグループの最大数
 * @param provider - 使用するAIプロバイダー
 * @returns マッチしたグループのリスト
 */
export async function findMatchingGroups(
  userId: string,
  limit: number = 10,
  provider: AIProvider = 'openai'
): Promise<GroupMatchResult[]> {
  try {
    // 利用可能なグループを取得
    const availableGroups = await getAvailableGroupsForUser(userId);
    
    if (availableGroups.length === 0) {
      return [];
    }

    // ユーザープロファイルを取得
    const userProfile = await getUserProfile(userId);

    const results: GroupMatchResult[] = [];

    // AI Gatewayが設定されている場合はAIマッチングを試行
    const useAI = isAIGatewayConfigured();

    for (const groupInfo of availableGroups) {
      const groupCriteria: GroupCriteria = {
        groupType: groupInfo.groupType,
        name: groupInfo.name,
        description: groupInfo.description,
        memberCount: groupInfo.memberCount,
        maxMembers: groupInfo.maxMembers,
      };

      let matchResult: { score: number; reasons: string[] };
      let matchSource: 'ai' | 'rule-based' = 'rule-based';

      if (useAI) {
        try {
          const aiResult = await calculateMatchingScore(
            userProfile as unknown as Record<string, unknown>,
            groupCriteria as unknown as Record<string, unknown>,
            provider
          );

          if (aiResult) {
            matchResult = {
              score: aiResult.score,
              reasons: aiResult.reasons,
            };
            matchSource = 'ai';
          } else {
            // AI結果がnullの場合はルールベースにフォールバック
            matchResult = calculateRuleBasedScore(userProfile, groupCriteria);
          }
        } catch {
          // AIエラーの場合はルールベースにフォールバック
          matchResult = calculateRuleBasedScore(userProfile, groupCriteria);
        }
      } else {
        matchResult = calculateRuleBasedScore(userProfile, groupCriteria);
      }

      results.push({
        group: groupInfo,
        score: matchResult.score,
        reasons: matchResult.reasons,
        matchSource,
      });
    }

    // スコアでソートして上位を返す
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, limit);

    await logSuccess(userId, 'read', 'group', undefined, {
      matchedGroups: topResults.length,
      useAI,
    });

    return topResults;
  } catch (error) {
    console.error('Group matching error:', error);
    
    await logFailure(userId, 'read', 'group',
      error instanceof Error ? error.message : 'Unknown error');
    
    return [];
  }
}

/**
 * グループに参加
 */
export async function joinGroup(
  userId: string,
  groupId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // グループが存在するか確認
    const targetGroup = await db
      .select()
      .from(group)
      .where(eq(group.id, groupId))
      .limit(1);

    if (targetGroup.length === 0) {
      return { success: false, message: 'グループが見つかりません' };
    }

    // 既に参加しているか確認
    const existingMembership = await db
      .select()
      .from(groupMember)
      .where(and(
        eq(groupMember.groupId, groupId),
        eq(groupMember.userId, userId)
      ))
      .limit(1);

    if (existingMembership.length > 0) {
      return { success: false, message: '既にこのグループに参加しています' };
    }

    // メンバー数の上限を確認
    if (targetGroup[0].maxMembers) {
      const currentCount = await db
        .select({ count: count() })
        .from(groupMember)
        .where(eq(groupMember.groupId, groupId));

      if (currentCount[0].count >= targetGroup[0].maxMembers) {
        return { success: false, message: 'グループの定員に達しています' };
      }
    }

    // グループに参加
    await db.insert(groupMember).values({
      groupId,
      userId,
      role: 'member',
    });

    await logSuccess(userId, 'create', 'group_member', groupId);

    return { success: true, message: 'グループに参加しました' };
  } catch (error) {
    console.error('Join group error:', error);
    
    await logFailure(userId, 'create', 'group_member',
      error instanceof Error ? error.message : 'Unknown error');
    
    return { success: false, message: 'グループへの参加に失敗しました' };
  }
}

/**
 * グループから退出
 */
export async function leaveGroup(
  userId: string,
  groupId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // メンバーシップを確認
    const membership = await db
      .select()
      .from(groupMember)
      .where(and(
        eq(groupMember.groupId, groupId),
        eq(groupMember.userId, userId)
      ))
      .limit(1);

    if (membership.length === 0) {
      return { success: false, message: 'このグループのメンバーではありません' };
    }

    // オーナーは退出できない（グループを削除する必要がある）
    if (membership[0].role === 'owner') {
      return { success: false, message: 'オーナーはグループから退出できません。グループを削除してください。' };
    }

    // グループから退出
    await db
      .delete(groupMember)
      .where(and(
        eq(groupMember.groupId, groupId),
        eq(groupMember.userId, userId)
      ));

    await logSuccess(userId, 'delete', 'group_member', groupId);

    return { success: true, message: 'グループから退出しました' };
  } catch (error) {
    console.error('Leave group error:', error);
    
    await logFailure(userId, 'delete', 'group_member',
      error instanceof Error ? error.message : 'Unknown error');
    
    return { success: false, message: 'グループからの退出に失敗しました' };
  }
}

/**
 * ユーザーが参加しているグループを取得
 */
export async function getUserGroups(userId: string): Promise<GroupInfo[]> {
  const memberships = await db
    .select({
      groupId: groupMember.groupId,
    })
    .from(groupMember)
    .where(eq(groupMember.userId, userId));

  const groupIds = memberships.map(m => m.groupId);

  if (groupIds.length === 0) {
    return [];
  }

  const groups = await db
    .select({
      id: group.id,
      name: group.name,
      description: group.description,
      groupType: group.groupType,
      isPublic: group.isPublic,
      maxMembers: group.maxMembers,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
    })
    .from(group)
    .where(inArray(group.id, groupIds))
    .orderBy(desc(group.createdAt));

  // 各グループのメンバー数を取得
  const memberCounts = await db
    .select({
      groupId: groupMember.groupId,
      count: count(),
    })
    .from(groupMember)
    .where(inArray(groupMember.groupId, groupIds))
    .groupBy(groupMember.groupId);

  const memberCountMap = new Map(memberCounts.map(m => [m.groupId, m.count]));

  return groups.map(g => ({
    ...g,
    memberCount: memberCountMap.get(g.id) || 0,
  }));
}


