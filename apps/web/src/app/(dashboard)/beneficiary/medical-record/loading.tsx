// 自分カルテページのローディングコンポーネント
// データ読み込み中に表示されるスケルトンUI
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function MedicalRecordLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-5 w-72 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-20 rounded bg-muted" />
                  <div className="h-6 w-8 rounded bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Loading */}
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          データを読み込み中...
        </p>
      </div>
    </div>
  );
}

