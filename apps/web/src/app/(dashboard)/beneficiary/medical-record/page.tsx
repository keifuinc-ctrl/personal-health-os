'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileHeart,
  Pill,
  TestTube,
  Building2,
  Plus,
  LinkIcon,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentRecord {
  id: string;
  title: string;
  facility: string;
  date: string;
  type: 'visit' | 'test' | 'medication';
}

const quickActions = [
  {
    title: '診療記録を追加',
    description: '病院の受診記録を手動で追加',
    icon: FileHeart,
    href: '/beneficiary/medical-record/records',
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
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentRecords = useCallback(async () => {
    try {
      // 最近の記録を複数のエンドポイントから取得
      const [medicationsRes, testResultsRes, recordsRes] = await Promise.all([
        fetch('/api/beneficiary/medications'),
        fetch('/api/beneficiary/test-results'),
        fetch('/api/beneficiary/medical-records'),
      ]);

      const records: RecentRecord[] = [];

      if (medicationsRes.ok) {
        const data = await medicationsRes.json();
        data.medications?.slice(0, 3).forEach((med: { id: string; name: string; prescribedBy?: string; createdAt: string }) => {
          records.push({
            id: med.id,
            title: med.name,
            facility: med.prescribedBy || '未設定',
            date: new Date(med.createdAt).toLocaleDateString('ja-JP'),
            type: 'medication',
          });
        });
      }

      if (testResultsRes.ok) {
        const data = await testResultsRes.json();
        data.testResults?.slice(0, 3).forEach((test: { id: string; testName: string; facilityName?: string; testDate: string }) => {
          records.push({
            id: test.id,
            title: test.testName,
            facility: test.facilityName || '未設定',
            date: new Date(test.testDate).toLocaleDateString('ja-JP'),
            type: 'test',
          });
        });
      }

      if (recordsRes.ok) {
        const data = await recordsRes.json();
        data.medicalRecords?.slice(0, 3).forEach((rec: { id: string; title: string; facilityName?: string; recordDate: string }) => {
          records.push({
            id: rec.id,
            title: rec.title,
            facility: rec.facilityName || '未設定',
            date: new Date(rec.recordDate).toLocaleDateString('ja-JP'),
            type: 'visit',
          });
        });
      }

      // 日付でソート（新しい順）
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentRecords(records.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch recent records:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentRecords();
  }, [fetchRecentRecords]);

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
            <Link key={action.title} href={action.href}>
              <Card className="group h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
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
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Records */}
      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">最近の記録</h2>
          <Link href="/beneficiary/medical-record/records">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              新規追加
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recentRecords.length > 0 ? (
              recentRecords.map((record, index) => (
                <motion.div
                  key={`${record.type}-${record.id}`}
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

