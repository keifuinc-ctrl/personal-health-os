// 認証APIルート
// Better Authのすべての認証エンドポイントを処理（ログイン、サインアップ、ログアウトなど）
// [...all]はNext.jsのキャッチオールルートで、すべてのパスにマッチ
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Better AuthのハンドラーをNext.jsのAPIルートに変換
// POST: ログイン、サインアップなどの認証アクション
// GET: セッション情報の取得など
export const { POST, GET } = toNextJsHandler(auth);

