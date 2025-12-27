import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function GroupsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-5 w-80 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Tab Skeleton */}
      <div className="flex gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>

      {/* Groups Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-muted" />
                  <div className="h-6 w-16 rounded-full bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading Indicator */}
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          グループを読み込み中...
        </p>
      </div>
    </div>
  );
}

