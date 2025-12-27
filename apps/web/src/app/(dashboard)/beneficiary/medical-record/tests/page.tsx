'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TestTube,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  X,
  Calendar,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface TestResult {
  id: string;
  testName: string;
  testDate: string;
  result: string | null;
  unit: string | null;
  referenceRange: string | null;
  facilityName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

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

// 結果が基準範囲内かどうかを判定
function getResultStatus(result: string | null, referenceRange: string | null): 'normal' | 'high' | 'low' | 'unknown' {
  if (!result || !referenceRange) return 'unknown';
  
  const numResult = parseFloat(result);
  if (isNaN(numResult)) return 'unknown';

  // 基準範囲のパース（例: "70-100", "< 100", "> 50"）
  const rangeMatch = referenceRange.match(/(\d+\.?\d*)\s*[-~]\s*(\d+\.?\d*)/);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    if (numResult < low) return 'low';
    if (numResult > high) return 'high';
    return 'normal';
  }

  return 'unknown';
}

export default function TestResultsPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingResult, setEditingResult] = useState<TestResult | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 検索・フィルターの状態
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState({
    testName: '',
    testDate: '',
    result: '',
    unit: '',
    referenceRange: '',
    facilityName: '',
    notes: '',
  });

  const fetchTestResults = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);
      
      const url = `/api/beneficiary/test-results${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setTestResults(data.testResults);
      }
    } catch (error) {
      console.error('Failed to fetch test results:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    fetchTestResults();
  }, [fetchTestResults]);

  const resetForm = () => {
    setFormData({
      testName: '',
      testDate: '',
      result: '',
      unit: '',
      referenceRange: '',
      facilityName: '',
      notes: '',
    });
    setEditingResult(null);
  };

  const handleOpenDialog = (result?: TestResult) => {
    if (result) {
      setEditingResult(result);
      setFormData({
        testName: result.testName,
        testDate: result.testDate.split('T')[0],
        result: result.result || '',
        unit: result.unit || '',
        referenceRange: result.referenceRange || '',
        facilityName: result.facilityName || '',
        notes: result.notes || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        testDate: new Date(formData.testDate).toISOString(),
      };

      const url = editingResult
        ? `/api/beneficiary/test-results/${editingResult.id}`
        : '/api/beneficiary/test-results';

      const method = editingResult ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchTestResults();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save test result:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/beneficiary/test-results/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTestResults();
      }
    } catch (error) {
      console.error('Failed to delete test result:', error);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/beneficiary/test-results/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'test-results.csv';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export test results:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const StatusIcon = ({ status }: { status: 'normal' | 'high' | 'low' | 'unknown' }) => {
    switch (status) {
      case 'high':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'low':
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      case 'normal':
        return <Minus className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/beneficiary/medical-record">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">検査結果</h1>
            <p className="mt-1 text-muted-foreground">
              血液検査などの検査結果を記録・管理します
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || testResults.length === 0}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            CSVエクスポート
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                検査結果を追加
              </Button>
            </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingResult ? '検査結果を編集' : '新しい検査結果を追加'}
                </DialogTitle>
                <DialogDescription>
                  検査結果の情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="testName">検査項目名 *</Label>
                  <Input
                    id="testName"
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    placeholder="例: 空腹時血糖"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="testDate">検査日 *</Label>
                  <Input
                    id="testDate"
                    type="date"
                    value={formData.testDate}
                    onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="result">結果値</Label>
                    <Input
                      id="result"
                      value={formData.result}
                      onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                      placeholder="例: 95"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">単位</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="例: mg/dL"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="referenceRange">基準範囲</Label>
                  <Input
                    id="referenceRange"
                    value={formData.referenceRange}
                    onChange={(e) => setFormData({ ...formData, referenceRange: e.target.value })}
                    placeholder="例: 70-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="facilityName">検査施設</Label>
                  <Input
                    id="facilityName"
                    value={formData.facilityName}
                    onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                    placeholder="例: ○○クリニック"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">メモ</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="注意事項や特記事項があれば記入"
                    rows={3}
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
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="検査項目名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">開始日</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[140px]"
            />
          </div>
          <span className="mt-5 text-muted-foreground">〜</span>
          <div className="grid gap-1.5">
            <Label htmlFor="dateTo" className="text-xs text-muted-foreground">終了日</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[140px]"
            />
          </div>
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-5"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
            >
              <X className="mr-1 h-4 w-4" />
              クリア
            </Button>
          )}
        </div>
      </motion.div>

      {/* Test Results List */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : testResults.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <TestTube className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">検査結果がありません</p>
              <p className="text-sm text-muted-foreground">
                「検査結果を追加」ボタンから検査結果を登録しましょう
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {testResults.map((result, index) => {
              const status = getResultStatus(result.result, result.referenceRange);
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-health-purple/10 p-2">
                          <TestTube className="h-5 w-5 text-health-purple" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {result.testName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {formatDate(result.testDate)}
                            {result.facilityName && ` • ${result.facilityName}`}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.result && (
                          <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1">
                            <StatusIcon status={status} />
                            <span className="text-lg font-bold">{result.result}</span>
                            {result.unit && (
                              <span className="text-sm text-muted-foreground">{result.unit}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                        {result.referenceRange && (
                          <p>基準範囲: {result.referenceRange} {result.unit}</p>
                        )}
                        {result.notes && (
                          <p className="line-clamp-2">メモ: {result.notes}</p>
                        )}
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(result)}
                        >
                          <Pencil className="mr-1 h-4 w-4" />
                          編集
                        </Button>
                        {deleteConfirmId === result.id ? (
                          <div className="flex gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(result.id)}
                            >
                              削除する
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              キャンセル
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirmId(result.id)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            削除
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

