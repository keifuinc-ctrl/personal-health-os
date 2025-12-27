// データベーススキーマ定義
// Drizzle ORMを使用してPostgreSQLデータベースのテーブル構造を定義
import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ================================
// Better Auth Tables（認証関連テーブル）
// Better Authライブラリで使用する認証用のテーブル定義
// ================================

// ユーザーテーブル
// アプリケーションのユーザー情報を保存
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// セッションテーブル
// ユーザーのログインセッション情報を保存
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

// アカウントテーブル
// OAuth認証や外部認証プロバイダーとの連携情報を保存
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 認証テーブル
// メール認証などの認証トークンを保存
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

// ================================
// 自分カルテ機能（Beneficiary Platform - 自分カルテ）
// 薬情報、受診記録、疾患情報、検査データを管理するテーブル
// ================================

// 診療記録テーブル
// 病院受診情報、疾患情報、処置情報などを保存
export const medicalRecord = pgTable('medical_record', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  recordType: varchar('record_type', { length: 50 }).notNull(), // 'visit', 'diagnosis', 'procedure'
  title: text('title').notNull(),
  content: text('content'),
  recordDate: timestamp('record_date').notNull(),
  facilityName: text('facility_name'),
  doctorName: text('doctor_name'),
  // 電子保存の三原則: 真正性
  hash: text('hash'),
  digitalSignature: text('digital_signature'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 薬情報テーブル
// 服用中の薬や過去に服用していた薬の情報を保存
export const medication = pgTable('medication', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  dosage: text('dosage'),
  frequency: text('frequency'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  prescribedBy: text('prescribed_by'),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 検査結果テーブル
// 血液検査、尿検査などの検査結果を保存
export const testResult = pgTable('test_result', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  testName: text('test_name').notNull(),
  testDate: timestamp('test_date').notNull(),
  result: text('result'),
  unit: text('unit'),
  referenceRange: text('reference_range'),
  facilityName: text('facility_name'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 外部カルテ連携テーブル
// 外部の電子カルテシステム（FHIR、SS-MIX2、HL7等）との接続情報を保存
export const ehrConnection = pgTable('ehr_connection', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  providerName: text('provider_name').notNull(),
  providerType: varchar('provider_type', { length: 50 }).notNull(), // 'fhir', 'ssmix2', 'hl7'
  connectionStatus: varchar('connection_status', { length: 20 }).notNull().default('pending'),
  lastSyncAt: timestamp('last_sync_at'),
  config: jsonb('config'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 外部カルテ連携同意テーブル
// ユーザーが外部カルテシステムとのデータ連携に同意した情報を保存
export const ehrConsent = pgTable('ehr_consent', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  ehrConnectionId: uuid('ehr_connection_id')
    .notNull()
    .references(() => ehrConnection.id, { onDelete: 'cascade' }),
  consentType: varchar('consent_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  consentedAt: timestamp('consented_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ================================
// 健康計画機能（Beneficiary Platform - 健康計画）
// 健康データ、リスク予測、予防計画を管理するテーブル
// ================================

// 健康データテーブル
// 体重、血圧、運動量などの健康メトリクスを保存
export const healthData = pgTable('health_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  dataType: varchar('data_type', { length: 50 }).notNull(), // 'weight', 'blood_pressure', 'exercise', 'sleep', 'steps'
  value: text('value').notNull(),
  unit: text('unit'),
  recordedAt: timestamp('recorded_at').notNull(),
  source: varchar('source', { length: 50 }).default('manual'), // 'manual', 'device', 'ehr'
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// リスク予測テーブル
// AI分析による健康リスク予測結果を保存
export const riskPrediction = pgTable('risk_prediction', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  riskType: varchar('risk_type', { length: 100 }).notNull(),
  riskScore: integer('risk_score'), // 0-100
  timeframe: varchar('timeframe', { length: 20 }), // '1year', '5year', '10year'
  factors: jsonb('factors'),
  recommendations: jsonb('recommendations'),
  calculatedAt: timestamp('calculated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 予防計画テーブル
// 疾患別の予防計画や運動計画を保存
export const preventionPlan = pgTable('prevention_plan', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  planName: text('plan_name').notNull(),
  category: varchar('category', { length: 50 }).notNull(), // 'internal', 'mental', 'neurological', etc.
  description: text('description'),
  goals: jsonb('goals'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  progress: integer('progress').default(0), // 0-100
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ================================
// チーム&地域包括ケア機能（Beneficiary Platform - チーム&地域包括ケア）
// グループ、支援事業所を管理するテーブル
// ================================

// グループテーブル
// 習慣化グループやサポートグループの情報を保存
export const group = pgTable('group', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  groupType: varchar('group_type', { length: 50 }).notNull().default('habit'), // 'habit', 'support', 'community'
  isPublic: boolean('is_public').notNull().default(false),
  maxMembers: integer('max_members'),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// グループメンバーテーブル
// グループに参加しているユーザーの情報を保存
export const groupMember = pgTable('group_member', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => group.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('member'), // 'owner', 'admin', 'member'
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 支援事業所テーブル
// 介護施設、居宅介護支援、地域包括などの支援事業所情報を保存
export const supportFacility = pgTable('support_facility', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  facilityType: varchar('facility_type', { length: 50 }).notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  services: jsonb('services'),
  operatingHours: jsonb('operating_hours'),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ================================
// 監査ログ（セキュリティ）
// すべてのデータ操作を記録し、セキュリティとコンプライアンスを確保
// ================================

// 監査ログテーブル
// すべてのデータアクセス（作成、読み取り、更新、削除）を記録
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 50 }).notNull(), // 'create', 'read', 'update', 'delete'
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  resourceId: text('resource_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  success: boolean('success').notNull().default(true),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ================================
// Relations（リレーション定義）
// Drizzle ORMでテーブル間のリレーションを定義
// ================================

// ユーザーリレーション
// ユーザーに関連するすべてのテーブルとのリレーションを定義
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  medicalRecords: many(medicalRecord),
  medications: many(medication),
  testResults: many(testResult),
  ehrConnections: many(ehrConnection),
  healthData: many(healthData),
  riskPredictions: many(riskPrediction),
  preventionPlans: many(preventionPlan),
  groupMemberships: many(groupMember),
  createdGroups: many(group),
  auditLogs: many(auditLog),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const medicalRecordRelations = relations(medicalRecord, ({ one }) => ({
  user: one(user, {
    fields: [medicalRecord.userId],
    references: [user.id],
  }),
}));

export const medicationRelations = relations(medication, ({ one }) => ({
  user: one(user, {
    fields: [medication.userId],
    references: [user.id],
  }),
}));

export const testResultRelations = relations(testResult, ({ one }) => ({
  user: one(user, {
    fields: [testResult.userId],
    references: [user.id],
  }),
}));

export const ehrConnectionRelations = relations(ehrConnection, ({ one, many }) => ({
  user: one(user, {
    fields: [ehrConnection.userId],
    references: [user.id],
  }),
  consents: many(ehrConsent),
}));

export const ehrConsentRelations = relations(ehrConsent, ({ one }) => ({
  user: one(user, {
    fields: [ehrConsent.userId],
    references: [user.id],
  }),
  ehrConnection: one(ehrConnection, {
    fields: [ehrConsent.ehrConnectionId],
    references: [ehrConnection.id],
  }),
}));

export const healthDataRelations = relations(healthData, ({ one }) => ({
  user: one(user, {
    fields: [healthData.userId],
    references: [user.id],
  }),
}));

export const riskPredictionRelations = relations(riskPrediction, ({ one }) => ({
  user: one(user, {
    fields: [riskPrediction.userId],
    references: [user.id],
  }),
}));

export const preventionPlanRelations = relations(preventionPlan, ({ one }) => ({
  user: one(user, {
    fields: [preventionPlan.userId],
    references: [user.id],
  }),
}));

export const groupRelations = relations(group, ({ one, many }) => ({
  creator: one(user, {
    fields: [group.createdBy],
    references: [user.id],
  }),
  members: many(groupMember),
}));

export const groupMemberRelations = relations(groupMember, ({ one }) => ({
  group: one(group, {
    fields: [groupMember.groupId],
    references: [group.id],
  }),
  user: one(user, {
    fields: [groupMember.userId],
    references: [user.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(user, {
    fields: [auditLog.userId],
    references: [user.id],
  }),
}));

