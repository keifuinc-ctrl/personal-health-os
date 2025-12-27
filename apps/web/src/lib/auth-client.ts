// クライアントサイド認証クライアント
// Reactコンポーネントから認証機能を使用するためのクライアント
import { createAuthClient } from 'better-auth/react';

// 認証クライアントの作成
// ベースURLを環境変数から取得（本番環境と開発環境で切り替え）
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
});

// 認証関連の関数とフックをエクスポート
// signIn: ログイン関数
// signUp: サインアップ関数
// signOut: ログアウト関数
// useSession: セッション情報を取得するReactフック
export const { signIn, signUp, signOut, useSession } = authClient;

