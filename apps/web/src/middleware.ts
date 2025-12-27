// ミドルウェア設定
// リクエストごとに認証チェックを行い、適切なページにリダイレクト
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 認証が必要なルート（保護されたルート）
// これらのルートにアクセスするにはログインが必要
const protectedRoutes = ['/beneficiary'];

// 認証関連のルート（ログイン済みの場合はダッシュボードにリダイレクト）
// ログイン済みユーザーが再度ログインページにアクセスした場合の処理
const authRoutes = ['/login', '/signup'];

// ミドルウェア関数
// すべてのリクエストに対して実行され、認証チェックとリダイレクトを処理
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 現在のルートが保護されたルートかどうかをチェック
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  
  // 現在のルートが認証関連のルートかどうかをチェック
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );
  
  // クッキーからセッショントークンを取得
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;
  
  // 保護されたルートにセッションなしでアクセスした場合、ログインページにリダイレクト
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname); // ログイン後に元のページに戻るためのURLを保存
    return NextResponse.redirect(loginUrl);
  }
  
  // 認証関連のルートにセッションありでアクセスした場合、ダッシュボードにリダイレクト
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/beneficiary/medical-record', request.url));
  }
  
  // 上記の条件に該当しない場合は、そのままリクエストを通過
  return NextResponse.next();
}

// ミドルウェアの適用範囲を設定
// どのパスに対してミドルウェアを実行するかを指定
export const config = {
  matcher: [
    /*
     * すべてのリクエストパスに適用（以下のパスを除く）:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     * - public folder (パブリックフォルダ)
     * - api routes (APIルートは別途処理)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};

