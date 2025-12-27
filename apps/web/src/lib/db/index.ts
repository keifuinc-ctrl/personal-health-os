// データベース接続設定
// Drizzle ORMを使用してPostgreSQLデータベースに接続
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 環境変数からデータベース接続文字列を取得
const connectionString = process.env.DATABASE_URL!;

// PostgreSQLクライアントの作成
// prefetchを無効化（"Transaction"プールモードではサポートされていないため）
const client = postgres(connectionString, { prepare: false });

// Drizzle ORMインスタンスの作成
// スキーマを適用して型安全なデータベースアクセスを提供
export const db = drizzle(client, { schema });

