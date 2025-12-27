// ルートレイアウトコンポーネント
// アプリケーション全体の基本レイアウトとメタデータを定義
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

// ページのメタデータ（SEO用）
// タイトル、説明、キーワードを設定
export const metadata: Metadata = {
  title: 'Personal Health OS',
  description: '個人主権型ヘルスケアプラットフォーム - 自分の健康データは、自分のもの。',
  keywords: ['health', 'healthcare', 'personal health', 'medical records', 'wellness'],
};

// ルートレイアウトコンポーネント
// HTMLの基本構造とフォント設定を定義
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      {/* フォント変数を適用し、アンチエイリアスを有効化 */}
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

