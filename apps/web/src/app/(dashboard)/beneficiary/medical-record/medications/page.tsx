'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Search,
  X,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  startDate: string | null;
  endDate: string | null;
  prescribedBy: string | null;
  notes: string | null;
  isActive: boolean;
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

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 検索・フィルターの状態
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // フォームの状態
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    notes: '',
    isActive: true,
  });

  const fetchMedications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (activeFilter !== 'all') params.append('isActive', activeFilter);
      
      const url = `/api/beneficiary/medications${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setMedications(data.medications);
      }
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      prescribedBy: '',
      notes: '',
      isActive: true,
    });
    setEditingMedication(null);
  };

  const handleOpenDialog = (medication?: Medication) => {
    if (medication) {
      setEditingMedication(medication);
      setFormData({
        name: medication.name,
        dosage: medication.dosage || '',
        frequency: medication.frequency || '',
        startDate: medication.startDate ? medication.startDate.split('T')[0] : '',
        endDate: medication.endDate ? medication.endDate.split('T')[0] : '',
        prescribedBy: medication.prescribedBy || '',
        notes: medication.notes || '',
        isActive: medication.isActive,
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
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      const url = editingMedication
        ? `/api/beneficiary/medications/${editingMedication.id}`
        : '/api/beneficiary/medications';
      
      const method = editingMedication ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchMedications();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save medication:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/beneficiary/medications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMedications();
      }
    } catch (error) {
      console.error('Failed to delete medication:', error);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/beneficiary/medications/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'medications.csv';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export medications:', error);
    } finally {
      setIsExporting(false);
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
            <h1 className="text-3xl font-bold tracking-tight">薬情報</h1>
            <p className="mt-1 text-muted-foreground">
              処方された薬の情報を管理します
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || medications.length === 0}
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
                薬を追加
              </Button>
            </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingMedication ? '薬情報を編集' : '新しい薬を追加'}
                </DialogTitle>
                <DialogDescription>
                  処方された薬の情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">薬品名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例: アムロジピン錠5mg"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dosage">用量</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="例: 1錠"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="frequency">服用頻度</Label>
                    <Input
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      placeholder="例: 1日1回"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">開始日</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">終了日</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prescribedBy">処方元</Label>
                  <Input
                    id="prescribedBy"
                    value={formData.prescribedBy}
                    onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                    placeholder="例: ○○クリニック / △△医師"
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">現在服用中</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
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
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="薬品名で検索..."
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
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="状態でフィルター" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="true">服用中のみ</SelectItem>
            <SelectItem value="false">終了のみ</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Medications List */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : medications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Pill className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">薬情報がありません</p>
              <p className="text-sm text-muted-foreground">
                「薬を追加」ボタンから薬情報を登録しましょう
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {medications.map((med, index) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={!med.isActive ? 'opacity-60' : ''}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${med.isActive ? 'bg-health-blue/10' : 'bg-muted'}`}>
                        <Pill className={`h-5 w-5 ${med.isActive ? 'text-health-blue' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {med.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {med.dosage && med.frequency
                            ? `${med.dosage} / ${med.frequency}`
                            : med.dosage || med.frequency || '用量未設定'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {med.isActive ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          服用中
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          <XCircle className="h-3 w-3" />
                          終了
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                      {med.prescribedBy && (
                        <p>処方元: {med.prescribedBy}</p>
                      )}
                      <p>
                        期間: {formatDate(med.startDate)} 〜 {formatDate(med.endDate)}
                      </p>
                      {med.notes && (
                        <p className="line-clamp-2">メモ: {med.notes}</p>
                      )}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(med)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        編集
                      </Button>
                      {deleteConfirmId === med.id ? (
                        <div className="flex gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(med.id)}
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
                          onClick={() => setDeleteConfirmId(med.id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          削除
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

