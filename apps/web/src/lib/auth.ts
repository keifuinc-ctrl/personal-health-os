// 認証設定ファイル
// Better Authを使用した認証システムの設定
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';

// Better Authの設定
// データベースアダプター、認証方式、セッション管理などを設定
export const auth = betterAuth({
  // データベースアダプター設定（PostgreSQL + Drizzle ORM）
  database: drizzleAdapter(db, {
    provider: 'pg', // PostgreSQLを使用
    schema: {
      user: schema.user, // ユーザーテーブル
      session: schema.session, // セッションテーブル
      account: schema.account, // アカウントテーブル
      verification: schema.verification, // 認証テーブル
    },
  }),
  // メール/パスワード認証の設定
  emailAndPassword: {
    enabled: true, // メール/パスワード認証を有効化
    requireEmailVerification: false, // MVP phase: disable for now（メール認証は後で実装）
  },
  // セッション管理の設定
  session: {
    expiresIn: 60 * 60 * 24 * 7, // セッション有効期限: 7日間
    updateAge: 60 * 60 * 24, // セッション更新間隔: 1日
    cookieCache: {
      enabled: true, // クッキーキャッシュを有効化
      maxAge: 60 * 5, // キャッシュ有効期限: 5分
    },
  },
  // 信頼できるオリジン（CORS設定）
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  ],
});

// セッション型のエクスポート（型安全性のため）
export type Session = typeof auth.$Infer.Session;

