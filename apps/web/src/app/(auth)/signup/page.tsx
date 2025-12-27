'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowRight, Check } from 'lucide-react';
import { signUp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const benefits = [
  '健康データを一元管理',
  'AIによるリスク予測',
  '外部カルテとの連携',
  'チームでの健康習慣化',
];

export default function SignUpPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || '登録に失敗しました');
        return;
      }

      router.push('/beneficiary/medical-record');
      router.refresh();
    } catch (err) {
      setError('登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">アカウントを作成</CardTitle>
          <CardDescription>
            無料で始めて、健康データを自分で管理しましょう
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}
            
            {/* Benefits */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Personal Health OS でできること
              </p>
              <ul className="space-y-1">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm">
                    <Check className="h-3 w-3 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="山田 太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="8文字以上"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                8文字以上で設定してください
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  登録中...
                </>
              ) : (
                <>
                  無料で始める
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
              登録することで、
              <Link href="/terms" className="text-primary hover:underline">
                利用規約
              </Link>
              と
              <Link href="/privacy" className="text-primary hover:underline">
                プライバシーポリシー
              </Link>
              に同意したことになります。
            </p>
            
            <p className="text-center text-sm text-muted-foreground">
              すでにアカウントをお持ちですか？{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                ログイン
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}

