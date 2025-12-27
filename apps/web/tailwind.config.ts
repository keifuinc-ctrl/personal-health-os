// Tailwind CSS設定ファイル
// Tailwind CSSのカスタマイズ設定を定義
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'], // クラスベースのダークモード（手動切り替え）
  // Tailwindがクラスを検索するパス
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // カスタムカラーパレット（shadcn/ui + ヘルスケア専用カラー）
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ヘルスケア専用カラー（自分カルテ、健康計画、チーム&地域包括ケア、マイページ用）
        health: {
          green: 'hsl(142 76% 36%)', // 自分カルテ用（緑）
          blue: 'hsl(199 89% 48%)', // 健康計画用（青）
          orange: 'hsl(25 95% 53%)', // マイページ用（オレンジ）
          purple: 'hsl(262 83% 58%)', // チーム&地域包括ケア用（紫）
        },
      },
      // 角丸の設定（CSS変数から取得）
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // フォントファミリーの設定（Geistフォントを使用）
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      // カスタムアニメーションのキーフレーム定義
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      // アニメーションの設定
      animation: {
        'fade-in': 'fade-in 0.5s ease-out', // フェードインアニメーション
        'slide-in': 'slide-in-from-right 0.3s ease-out', // 右からスライドイン
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', // パルスアニメーション
      },
    },
  },
  // Tailwind CSSプラグイン（アニメーション機能を追加）
  plugins: [require('tailwindcss-animate')],
};

export default config;

