// Drizzle ORM設定ファイル
// データベースマイグレーションとスキーマ管理の設定
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// .env.local を読み込む（環境変数を取得するため）
config({ path: '.env.local' });

export default defineConfig({
  schema: './src/lib/db/schema.ts', // スキーマファイルのパス
  out: './drizzle', // マイグレーションファイルの出力先
  dialect: 'postgresql', // データベースの種類（PostgreSQL）
  dbCredentials: {
    url: process.env.DATABASE_URL!, // データベース接続URL（環境変数から取得）
  },
});

