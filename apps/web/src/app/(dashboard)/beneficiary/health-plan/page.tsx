'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  Target,
  Brain,
  Heart,
  Zap,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const healthMetrics = [
  {
    label: '体重',
    value: '-- kg',
    change: null,
    icon: Activity,
    color: 'text-health-blue',
  },
  {
    label: '血圧',
    value: '--/-- mmHg',
    change: null,
    icon: Heart,
    color: 'text-health-green',
  },
  {
    label: '歩数',
    value: '-- 歩',
    change: null,
    icon: Zap,
    color: 'text-health-orange',
  },
  {
    label: '睡眠',
    value: '-- 時間',
    change: null,
    icon: Brain,
    color: 'text-health-purple',
  },
];

const riskCategories = [
  {
    name: '循環器系',
    description: '心臓・血管の健康',
    score: null,
    recommendations: ['定期的な血圧測定', '適度な運動'],
  },
  {
    name: '代謝系',
    description: '血糖・脂質の管理',
    score: null,
    recommendations: ['バランスの良い食事', '体重管理'],
  },
  {
    name: 'メンタルヘルス',
    description: '心の健康',
    score: null,
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
        <h2 className="mb-4 text-lg font-semibold">健康指標</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {healthMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.change && (
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="mr-1 inline h-3 w-3" />
                    {metric.change}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 p-4">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            健康データを記録すると、ここに最新の数値が表示されます。
          </p>
          <Button variant="link" size="sm" className="ml-auto">
            データを記録
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
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

