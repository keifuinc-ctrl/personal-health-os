'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileHeart,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowLeft,
  Building2,
  Stethoscope,
  ClipboardList,
  MessageSquare,
  MoreHorizontal,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MedicalRecord {
  id: string;
  recordType: string;
  title: string;
  content: string | null;
  recordDate: string;
  facilityName: string | null;
  doctorName: string | null;
  createdAt: string;
  updatedAt: string;
}

const recordTypes = [
  { value: 'visit', label: '外来受診', icon: Building2, color: 'text-health-green', bgColor: 'bg-health-green/10' },
  { value: 'diagnosis', label: '診断', icon: Stethoscope, color: 'text-health-blue', bgColor: 'bg-health-blue/10' },
  { value: 'procedure', label: '処置・手術', icon: ClipboardList, color: 'text-health-purple', bgColor: 'bg-health-purple/10' },
  { value: 'consultation', label: '相談', icon: MessageSquare, color: 'text-health-orange', bgColor: 'bg-health-orange/10' },
  { value: 'other', label: 'その他', icon: MoreHorizontal, color: 'text-muted-foreground', bgColor: 'bg-muted' },
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

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    recordType: 'visit',
    title: '',
    content: '',
    recordDate: '',
    facilityName: '',
    doctorName: '',
  });

  const fetchRecords = useCallback(async () => {
    try {
      const response = await fetch('/api/beneficiary/medical-records');
      const data = await response.json();
      if (response.ok) {
        setRecords(data.medicalRecords);
      }
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const resetForm = () => {
    setFormData({
      recordType: 'visit',
      title: '',
      content: '',
      recordDate: '',
      facilityName: '',
      doctorName: '',
    });
    setEditingRecord(null);
  };

  const handleOpenDialog = (record?: MedicalRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        recordType: record.recordType,
        title: record.title,
        content: record.content || '',
        recordDate: record.recordDate.split('T')[0],
        facilityName: record.facilityName || '',
        doctorName: record.doctorName || '',
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
        recordDate: new Date(formData.recordDate).toISOString(),
      };

      const url = editingRecord
        ? `/api/beneficiary/medical-records/${editingRecord.id}`
        : '/api/beneficiary/medical-records';

      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchRecords();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save medical record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/beneficiary/medical-records/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRecords();
      }
    } catch (error) {
      console.error('Failed to delete medical record:', error);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getRecordTypeInfo = (type: string) => {
    return recordTypes.find((t) => t.value === type) || recordTypes[4];
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
            <h1 className="text-3xl font-bold tracking-tight">診療記録</h1>
            <p className="mt-1 text-muted-foreground">
              病院の受診記録や診断情報を記録・管理します
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              診療記録を追加
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? '診療記録を編集' : '新しい診療記録を追加'}
                </DialogTitle>
                <DialogDescription>
                  診療記録の情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="recordType">記録タイプ *</Label>
                  <Select
                    value={formData.recordType}
                    onValueChange={(value) => setFormData({ ...formData, recordType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="記録タイプを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">タイトル *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例: 定期健康診断"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recordDate">受診日 *</Label>
                  <Input
                    id="recordDate"
                    type="date"
                    value={formData.recordDate}
                    onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facilityName">医療機関</Label>
                    <Input
                      id="facilityName"
                      value={formData.facilityName}
                      onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                      placeholder="例: ○○クリニック"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="doctorName">担当医</Label>
                    <Input
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      placeholder="例: △△ 医師"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">詳細・メモ</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="診察内容や所見、注意事項などを記入"
                    rows={5}
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
      </motion.div>

      {/* Records List */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileHeart className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">診療記録がありません</p>
              <p className="text-sm text-muted-foreground">
                「診療記録を追加」ボタンから記録を登録しましょう
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record, index) => {
              const typeInfo = getRecordTypeInfo(record.recordType);
              const TypeIcon = typeInfo.icon;
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-lg p-2 ${typeInfo.bgColor}`}>
                          <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base font-semibold">
                              {record.title}
                            </CardTitle>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                              {typeInfo.label}
                            </span>
                          </div>
                          <CardDescription className="mt-1">
                            {formatDate(record.recordDate)}
                            {record.facilityName && ` • ${record.facilityName}`}
                            {record.doctorName && ` • ${record.doctorName}`}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {record.content && (
                        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                          {record.content}
                        </p>
                      )}
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(record)}
                        >
                          <Pencil className="mr-1 h-4 w-4" />
                          編集
                        </Button>
                        {deleteConfirmId === record.id ? (
                          <div className="flex gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
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
                            onClick={() => setDeleteConfirmId(record.id)}
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

