'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Target,
  Brain,
  Heart,
  ChevronRight,
  AlertCircle,
  Plus,
  Loader2,
  Scale,
  Moon,
  Footprints,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HealthData {
  id: string;
  dataType: string;
  value: string;
  unit: string | null;
  recordedAt: string;
  source: string;
}

interface LatestMetrics {
  weight: HealthData | null;
  blood_pressure: HealthData | null;
  steps: HealthData | null;
  sleep: HealthData | null;
}

const dataTypes = [
  { value: 'weight', label: '体重', icon: Scale, color: 'text-health-blue', unit: 'kg' },
  { value: 'blood_pressure', label: '血圧', icon: Heart, color: 'text-health-green', unit: 'mmHg' },
  { value: 'steps', label: '歩数', icon: Footprints, color: 'text-health-orange', unit: '歩' },
  { value: 'sleep', label: '睡眠', icon: Moon, color: 'text-health-purple', unit: '時間' },
  { value: 'exercise', label: '運動', icon: Activity, color: 'text-blue-500', unit: '分' },
  { value: 'heart_rate', label: '心拍数', icon: Heart, color: 'text-red-500', unit: 'bpm' },
];

const riskCategories = [
  {
    name: '循環器系',
    description: '心臓・血管の健康',
    score: null as number | null,
    recommendations: ['定期的な血圧測定', '適度な運動'],
  },
  {
    name: '代謝系',
    description: '血糖・脂質の管理',
    score: null as number | null,
    recommendations: ['バランスの良い食事', '体重管理'],
  },
  {
    name: 'メンタルヘルス',
    description: '心の健康',
    score: null as number | null,
    recommendations: ['十分な睡眠', 'ストレス管理'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HealthPlanPage() {
  const [latestMetrics, setLatestMetrics] = useState<LatestMetrics>({
    weight: null,
    blood_pressure: null,
    steps: null,
    sleep: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    dataType: 'weight',
    value: '',
    recordedAt: new Date().toISOString().slice(0, 16),
  });

  const fetchLatestMetrics = useCallback(async () => {
    try {
      // 各データタイプの最新データを取得
      const types = ['weight', 'blood_pressure', 'steps', 'sleep'];
      const metrics: LatestMetrics = {
        weight: null,
        blood_pressure: null,
        steps: null,
        sleep: null,
      };

      for (const type of types) {
        const response = await fetch(`/api/beneficiary/health-data?dataType=${type}`);
        if (response.ok) {
          const data = await response.json();
          if (data.healthData && data.healthData.length > 0) {
            metrics[type as keyof LatestMetrics] = data.healthData[0];
          }
        }
      }

      setLatestMetrics(metrics);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestMetrics();
  }, [fetchLatestMetrics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedType = dataTypes.find((t) => t.value === formData.dataType);
      const payload = {
        dataType: formData.dataType,
        value: formData.value,
        unit: selectedType?.unit,
        recordedAt: new Date(formData.recordedAt).toISOString(),
        source: 'manual',
      };

      const response = await fetch('/api/beneficiary/health-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchLatestMetrics();
        setIsDialogOpen(false);
        setFormData({
          dataType: 'weight',
          value: '',
          recordedAt: new Date().toISOString().slice(0, 16),
        });
      }
    } catch (error) {
      console.error('Failed to save health data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatValue = (data: HealthData | null, type: string): string => {
    if (!data) return '-- ';
    if (type === 'blood_pressure') return data.value;
    return data.value;
  };

  const formatUnit = (type: string): string => {
    const dataType = dataTypes.find((t) => t.value === type);
    return dataType?.unit || '';
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  const healthMetrics = [
    {
      key: 'weight',
      label: '体重',
      data: latestMetrics.weight,
      icon: Scale,
      color: 'text-health-blue',
    },
    {
      key: 'blood_pressure',
      label: '血圧',
      data: latestMetrics.blood_pressure,
      icon: Heart,
      color: 'text-health-green',
    },
    {
      key: 'steps',
      label: '歩数',
      data: latestMetrics.steps,
      icon: Footprints,
      color: 'text-health-orange',
    },
    {
      key: 'sleep',
      label: '睡眠',
      data: latestMetrics.sleep,
      icon: Moon,
      color: 'text-health-purple',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">健康計画</h1>
        <p className="mt-2 text-muted-foreground">
          AIがあなたの健康リスクを予測し、最適な予防計画を提案します。
        </p>
      </motion.div>

      {/* Health Metrics */}
      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">健康指標</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                データを記録
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>健康データを記録</DialogTitle>
                  <DialogDescription>
                    測定した健康データを入力してください
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dataType">データ種類</Label>
                    <Select
                      value={formData.dataType}
                      onValueChange={(value) => setFormData({ ...formData, dataType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="データ種類を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}（{type.unit}）
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="value">
                      測定値 *
                      {formData.dataType === 'blood_pressure' && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          例: 120/80
                        </span>
                      )}
                    </Label>
                    <Input
                      id="value"
                      type={formData.dataType === 'blood_pressure' ? 'text' : 'number'}
                      step="0.1"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder={
                        formData.dataType === 'blood_pressure'
                          ? '120/80'
                          : dataTypes.find((t) => t.value === formData.dataType)?.unit || ''
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="recordedAt">測定日時</Label>
                    <Input
                      id="recordedAt"
                      type="datetime-local"
                      value={formData.recordedAt}
                      onChange={(e) => setFormData({ ...formData, recordedAt: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      '保存'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))
          ) : (
            healthMetrics.map((metric) => {
              const MetricIcon = metric.icon;
              return (
                <Card key={metric.key}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </CardTitle>
                    <MetricIcon className={`h-4 w-4 ${metric.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatValue(metric.data, metric.key)}{' '}
                      <span className="text-sm font-normal text-muted-foreground">
                        {formatUnit(metric.key)}
                      </span>
                    </div>
                    {metric.data && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(metric.data.recordedAt)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        {!isLoading && !Object.values(latestMetrics).some(Boolean) && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 p-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              健康データを記録すると、ここに最新の数値が表示されます。
            </p>
            <Button
              variant="link"
              size="sm"
              className="ml-auto"
              onClick={() => setIsDialogOpen(true)}
            >
              データを記録
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.div>

      {/* Risk Prediction */}
      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">リスク予測</h2>
            <p className="text-sm text-muted-foreground">
              AIが1〜10年後の健康リスクを予測します
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Brain className="mr-2 h-4 w-4" />
            分析を実行
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {riskCategories.map((category) => (
            <Card key={category.name} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {category.score !== null ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">リスクスコア</span>
                      <span className="text-2xl font-bold">{category.score}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex h-20 items-center justify-center rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">データが必要です</p>
                  </div>
                )}
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">推奨アクション</p>
                  <ul className="space-y-1">
                    {category.recommendations.map((rec) => (
                      <li key={rec} className="flex items-center gap-2 text-sm">
                        <Target className="h-3 w-3 text-primary" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Prevention Plans */}
      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">予防計画</h2>
          <Button variant="outline" size="sm">
            <Target className="mr-2 h-4 w-4" />
            計画を作成
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">予防計画がありません</p>
            <p className="text-sm text-muted-foreground">
              AIが分析したリスクに基づいて、最適な予防計画を作成しましょう
            </p>
            <Button className="mt-4">
              最初の計画を作成
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
