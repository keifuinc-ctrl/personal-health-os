// ユーティリティ関数
// Tailwind CSSのクラス名をマージするためのヘルパー関数
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// クラス名をマージする関数
// clsxで条件付きクラスを処理し、twMergeでTailwindのクラスを適切にマージ
// 例: cn('px-4', condition && 'py-2', 'bg-blue-500')
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

