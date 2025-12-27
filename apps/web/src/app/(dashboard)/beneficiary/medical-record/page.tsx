'use client';

import { motion } from 'framer-motion';
import {
  FileHeart,
  Pill,
  TestTube,
  Building2,
  Plus,
  LinkIcon,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const quickActions = [
  {
    title: '診療記録を追加',
    description: '病院の受診記録を手動で追加',
    icon: FileHeart,
    href: '/beneficiary/medical-record/add',
    color: 'text-health-green',
    bgColor: 'bg-health-green/10',
  },
  {
    title: '薬情報を追加',
    description: '処方された薬の情報を管理',
    icon: Pill,
    href: '/beneficiary/medical-record/medications',
    color: 'text-health-blue',
    bgColor: 'bg-health-blue/10',
  },
  {
    title: '検査結果を追加',
    description: '血液検査などの結果を記録',
    icon: TestTube,
    href: '/beneficiary/medical-record/tests',
    color: 'text-health-purple',
    bgColor: 'bg-health-purple/10',
  },
  {
    title: '外部カルテ連携',
    description: '医療機関のカルテと連携',
    icon: LinkIcon,
    href: '/beneficiary/my-page/ehr-settings',
    color: 'text-health-orange',
    bgColor: 'bg-health-orange/10',
  },
];

const recentRecords = [
  {
    id: '1',
    title: '定期健康診断',
    facility: '○○クリニック',
    date: '2024年12月15日',
    type: 'visit',
  },
  {
    id: '2',
    title: '血液検査結果',
    facility: '△△病院',
    date: '2024年12月10日',
    type: 'test',
  },
  {
    id: '3',
    title: '処方箋',
    facility: '○○クリニック',
    date: '2024年12月5日',
    type: 'medication',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function MedicalRecordPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">自分カルテ</h1>
        <p className="mt-2 text-muted-foreground">
          あなたの医療記録を一元管理。外部カルテとの連携も可能です。
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="mb-4 text-lg font-semibold">クイックアクション</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className={`mb-2 inline-flex rounded-lg p-2 ${action.bgColor}`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription className="text-xs">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  開く
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Recent Records */}
      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">最近の記録</h2>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            新規追加
          </Button>
        </div>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {recentRecords.length > 0 ? (
              recentRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      {record.type === 'visit' && <Building2 className="h-5 w-5 text-health-green" />}
                      {record.type === 'test' && <TestTube className="h-5 w-5 text-health-purple" />}
                      {record.type === 'medication' && <Pill className="h-5 w-5 text-health-blue" />}
                    </div>
                    <div>
                      <p className="font-medium">{record.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.facility} • {record.date}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileHeart className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">まだ記録がありません</p>
                <p className="text-sm text-muted-foreground">
                  上のクイックアクションから記録を追加しましょう
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* EHR Integration Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">外部カルテと連携</h3>
                <p className="text-sm text-muted-foreground">
                  医療機関の電子カルテと連携して、データを自動で取り込めます
                </p>
              </div>
            </div>
            <Button>
              連携設定へ
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

