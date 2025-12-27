import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function HealthPlanLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-5 w-72 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded bg-muted" />
                  <div className="h-4 w-48 rounded bg-muted" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Loading */}
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          健康データを分析中...
        </p>
      </div>
    </div>
  );
}

