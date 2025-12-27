// ダッシュボード用レイアウトコンポーネント
// Beneficiary Platformの共通レイアウト（サイドバー、ナビゲーション、ログアウト機能）
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileHeart,
  Activity,
  Users,
  User,
  Sparkles,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ナビゲーションメニューの定義
// 4つのコア機能へのリンク
const navigation = [
  {
    name: '自分カルテ',
    href: '/beneficiary/medical-record',
    icon: FileHeart,
    description: '診療記録・薬情報・検査データ',
  },
  {
    name: '健康計画',
    href: '/beneficiary/health-plan',
    icon: Activity,
    description: 'リスク予測・予防計画',
  },
  {
    name: 'チーム&地域ケア',
    href: '/beneficiary/groups',
    icon: Users,
    description: 'グループ・支援事業所',
  },
  {
    name: 'マイページ',
    href: '/beneficiary/my-page',
    icon: User,
    description: '設定・通知・連携',
  },
];

// ダッシュボードレイアウトのメインコンポーネント
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // 現在のパスを取得（アクティブなメニューを判定）
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // モバイルメニューの開閉状態

  // ログアウト処理
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/'; // ログアウト後、ホームページにリダイレクト
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">Personal Health OS</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span
                      className={cn(
                        'text-xs',
                        isActive
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground/70'
                      )}
                    >
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="border-t border-border p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              ログアウト
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link href="/beneficiary/medical-record" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold">Health OS</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed inset-x-0 top-16 z-30 border-b border-border bg-card p-4 shadow-lg lg:hidden"
        >
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              ログアウト
            </Button>
          </nav>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}

