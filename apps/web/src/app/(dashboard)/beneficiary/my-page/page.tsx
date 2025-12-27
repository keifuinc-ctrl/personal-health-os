// マイページコンポーネント
// Beneficiary Platform - マイページ機能のメインページ（設定、通知、プラン管理）
'use client';

import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Settings,
  LinkIcon,
  Shield,
  Download,
  ChevronRight,
  Mail,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// メニュー項目の定義
// マイページで表示する各種設定へのリンク
const menuItems = [
  {
    title: '通知設定',
    description: 'メール通知やプッシュ通知の設定',
    icon: Bell,
    href: '/beneficiary/my-page/notifications',
  },
  {
    title: '外部カルテ連携',
    description: '医療機関のカルテとの連携設定',
    icon: LinkIcon,
    href: '/beneficiary/my-page/ehr-settings',
  },
  {
    title: 'プライバシー設定',
    description: 'データの共有設定や同意管理',
    icon: Shield,
    href: '/beneficiary/my-page/privacy',
  },
  {
    title: 'データエクスポート',
    description: '健康データをダウンロード',
    icon: Download,
    href: '/beneficiary/my-page/export',
  },
  {
    title: 'プラン管理',
    description: 'サブスクリプションの確認・変更',
    icon: CreditCard,
    href: '/beneficiary/my-page/plan',
  },
  {
    title: 'アカウント設定',
    description: 'メールアドレス・パスワードの変更',
    icon: Settings,
    href: '/beneficiary/my-page/account',
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

export default function MyPagePage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">マイページ</h1>
        <p className="mt-2 text-muted-foreground">
          アカウント設定、通知、外部カルテ連携を管理します。
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">ユーザー名</h2>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                user@example.com
              </p>
            </div>
            <Button variant="outline">
              プロフィール編集
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu Items */}
      <motion.div variants={itemVariants}>
        <h2 className="mb-4 text-lg font-semibold">設定</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {menuItems.map((item) => (
            <Card
              key={item.title}
              className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Data Sovereignty Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-health-green/20 bg-gradient-to-r from-health-green/5 to-health-green/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-health-green/20">
                <Shield className="h-6 w-6 text-health-green" />
              </div>
              <div>
                <h3 className="font-semibold">あなたのデータは、あなたのもの</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Personal Health OS では、あなたの健康データの所有権は常にあなたにあります。
                  いつでもデータをエクスポートしたり、アカウントを削除したりできます。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    データをエクスポート
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    プライバシーポリシー
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Info */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">セキュリティ情報</CardTitle>
            <CardDescription>
              あなたのデータは暗号化され、安全に保護されています
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">電子保存の三原則</span>
                <span className="flex items-center gap-1 text-health-green">
                  <Shield className="h-4 w-4" />
                  準拠
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">データ暗号化</span>
                <span className="flex items-center gap-1 text-health-green">
                  <Shield className="h-4 w-4" />
                  有効
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">二要素認証</span>
                <Button variant="link" size="sm" className="h-auto p-0">
                  設定する
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

