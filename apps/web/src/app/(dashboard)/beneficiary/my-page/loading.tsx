import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function MyPageLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Profile Header Skeleton */}
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-6 w-40 rounded bg-muted" />
              <div className="h-4 w-56 rounded bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-5 w-24 rounded bg-muted" />
                  <div className="h-4 w-40 rounded bg-muted" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Loading Indicator */}
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          読み込み中...
        </p>
      </div>
    </div>
  );
}

