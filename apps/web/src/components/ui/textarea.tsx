// テキストエリアコンポーネント
// shadcn/uiベースの再利用可能なテキストエリアコンポーネント
import * as React from 'react';

import { cn } from '@/lib/utils';

// テキストエリアのプロップ型定義
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

// テキストエリアコンポーネント
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };

