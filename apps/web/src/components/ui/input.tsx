// 入力フィールドコンポーネント
// shadcn/uiベースの再利用可能なinputコンポーネント
import * as React from 'react';

import { cn } from '@/lib/utils';

// 入力フィールドコンポーネント
// forwardRefを使用してrefを転送可能に
// HTMLのinput要素のすべての属性をサポート
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        // Tailwind CSSクラスを適用
        // フォーカス時のリング、無効化時のスタイル、ファイル入力のスタイルなども含む
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input'; // React DevToolsで表示される名前

export { Input };

