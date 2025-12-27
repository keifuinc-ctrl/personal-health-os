// チーム&地域包括ケアページコンポーネント
// Beneficiary Platform - チーム&地域包括ケア機能のメインページ（グループ、支援事業所）
'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Search,
  Plus,
  ChevronRight,
  Globe,
  Lock,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// 参加中のグループ（プレースホルダーデータ）
const myGroups = [
  {
    id: '1',
    name: '朝のウォーキング会',
    members: 12,
    type: 'habit',
    isPublic: true,
    lastActivity: '今日',
  },
  {
    id: '2',
    name: '糖尿病予防グループ',
    members: 8,
    type: 'support',
    isPublic: false,
    lastActivity: '2日前',
  },
];

// おすすめグループ（プレースホルダーデータ）
// AIマッチング機能で推奨されるグループ
const recommendedGroups = [
  {
    id: '3',
    name: '週末ランニングクラブ',
    members: 45,
    type: 'habit',
    description: '週末に一緒にランニングを楽しむグループです',
  },
  {
    id: '4',
    name: '睡眠改善サポート',
    members: 23,
    type: 'support',
    description: '良質な睡眠のためのヒントを共有しましょう',
  },
  {
    id: '5',
    name: 'ヘルシー料理部',
    members: 67,
    type: 'habit',
    description: '健康的な食事のレシピを共有するグループ',
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

export default function GroupsPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">チーム&地域包括ケア</h1>
        <p className="mt-2 text-muted-foreground">
          仲間と一緒に健康習慣を続けましょう。支援事業所との連携も可能です。
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          グループを作成
        </Button>
        <Button variant="outline">
          <Building2 className="mr-2 h-4 w-4" />
          支援事業所を探す
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="グループを検索..."
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* My Groups */}
      <motion.div variants={itemVariants}>
        <h2 className="mb-4 text-lg font-semibold">参加中のグループ</h2>
        {myGroups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {myGroups.map((group) => (
              <Card
                key={group.id}
                className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{group.name}</CardTitle>
                    <CardDescription>
                      {group.members}人のメンバー • 最終活動: {group.lastActivity}
                    </CardDescription>
                  </div>
                  {group.isPublic ? (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                      {group.type === 'habit' ? '習慣化' : 'サポート'}
                    </span>
                    <Button variant="ghost" size="sm">
                      開く
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">まだグループに参加していません</p>
              <p className="text-sm text-muted-foreground">
                おすすめのグループに参加するか、新しいグループを作成しましょう
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Recommended Groups */}
      <motion.div variants={itemVariants}>
        <h2 className="mb-4 text-lg font-semibold">おすすめのグループ</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedGroups.map((group) => (
            <Card key={group.id} className="transition-all hover:border-primary/50 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{group.name}</CardTitle>
                <CardDescription>{group.members}人のメンバー</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{group.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  参加する
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Support Facilities */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">地域の支援事業所</h3>
                <p className="text-sm text-muted-foreground">
                  介護・福祉・医療の支援事業所を検索して連携できます
                </p>
              </div>
            </div>
            <Button>
              事業所を探す
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

