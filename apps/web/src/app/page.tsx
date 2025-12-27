'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileHeart,
  Activity,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: FileHeart,
    title: '自分カルテ',
    description: '薬情報、受診記録、検査データを一元管理。外部カルテとの連携も可能。',
    color: 'text-health-green',
    bgColor: 'bg-health-green/10',
  },
  {
    icon: Activity,
    title: '健康計画',
    description: 'AIによるリスク予測と予防計画で、あなたの健康をサポート。',
    color: 'text-health-blue',
    bgColor: 'bg-health-blue/10',
  },
  {
    icon: Users,
    title: 'チーム&地域包括ケア',
    description: '習慣化グループや支援事業所と連携し、継続的なケアを実現。',
    color: 'text-health-purple',
    bgColor: 'bg-health-purple/10',
  },
  {
    icon: Shield,
    title: 'セキュリティ',
    description: '電子保存の三原則に準拠。あなたのデータは暗号化され安全に保護。',
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
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.05),transparent_50%)]" />
        </div>

        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold">Personal Health OS</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
            >
              無料で始める
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </nav>

        <div className="container mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                自分の健康データは、
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                自分のもの。
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Personal Health OS は、個人主権型のヘルスケアプラットフォームです。
              医療記録、健康データ、予防計画を一元管理し、あなたの健康を支えます。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-lg font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25"
            >
              無料で始める
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-8 py-3 text-lg font-medium transition-all hover:bg-muted"
            >
              詳しく見る
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            4つのコア機能
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Beneficiary Platform があなたの健康管理をサポートします
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div
                className={`mb-4 inline-flex rounded-xl p-3 ${feature.bgColor}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-12 text-center text-primary-foreground"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
            今すぐ始めましょう
          </h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90">
            あなたの健康データを自分で管理し、より良い健康な未来へ。
          </p>
          <Link
            href="/signup"
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-lg font-medium text-primary transition-all hover:bg-white/90 hover:shadow-xl"
          >
            無料アカウントを作成
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold">Personal Health OS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Personal Health OS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

