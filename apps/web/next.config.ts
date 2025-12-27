// Next.js設定ファイル
// Next.jsアプリケーションの設定を定義
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // React Strict Modeを有効化（開発時の警告を強化）
  transpilePackages: ['@personal-health-os/ui'], // モノレポ内のパッケージをトランスパイル
};

export default nextConfig;

