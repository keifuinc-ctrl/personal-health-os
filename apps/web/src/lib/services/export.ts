/**
 * エクスポート機能のサービス
 * CSV形式でのデータエクスポートをサポート
 */

export interface CsvColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number | null | undefined);
}

/**
 * データをCSV形式の文字列に変換
 */
export function convertToCSV<T>(
  data: T[],
  columns: CsvColumn<T>[]
): string {
  // BOMを追加（Excelでの文字化け対策）
  const BOM = '\uFEFF';
  
  // ヘッダー行
  const headerRow = columns.map((col) => escapeCSVField(col.header)).join(',');
  
  // データ行
  const dataRows = data.map((item) => {
    return columns
      .map((col) => {
        let value: string | number | null | undefined;
        
        if (typeof col.accessor === 'function') {
          value = col.accessor(item);
        } else {
          value = item[col.accessor] as string | number | null | undefined;
        }
        
        return escapeCSVField(formatValue(value));
      })
      .join(',');
  });
  
  return BOM + [headerRow, ...dataRows].join('\n');
}

/**
 * CSVフィールドをエスケープ
 */
function escapeCSVField(value: string): string {
  // ダブルクォート、カンマ、改行を含む場合はダブルクォートで囲む
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 値を文字列にフォーマット
 */
function formatValue(value: string | number | null | undefined | Date | boolean): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (value instanceof Date) {
    return formatDate(value);
  }
  
  if (typeof value === 'boolean') {
    return value ? 'はい' : 'いいえ';
  }
  
  return String(value);
}

/**
 * 日付をフォーマット
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 日時をフォーマット
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * CSVファイルをダウンロード（クライアントサイド用）
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * ファイル名を生成（タイムスタンプ付き）
 */
export function generateFilename(prefix: string, extension: string = 'csv'): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}_${timestamp}.${extension}`;
}

// ========================================
// 各データタイプ用のエクスポート関数
// ========================================

/**
 * 薬情報のCSVカラム定義
 */
export const medicationColumns: CsvColumn<{
  name: string;
  dosage: string | null;
  frequency: string | null;
  startDate: string | null;
  endDate: string | null;
  prescribedBy: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}>[] = [
  { header: '薬品名', accessor: 'name' },
  { header: '用量', accessor: 'dosage' },
  { header: '服用頻度', accessor: 'frequency' },
  { header: '開始日', accessor: (item) => formatDate(item.startDate) },
  { header: '終了日', accessor: (item) => formatDate(item.endDate) },
  { header: '処方元', accessor: 'prescribedBy' },
  { header: 'メモ', accessor: 'notes' },
  { header: '服用中', accessor: (item) => (item.isActive ? 'はい' : 'いいえ') },
  { header: '登録日', accessor: (item) => formatDateTime(item.createdAt) },
];

/**
 * 検査結果のCSVカラム定義
 */
export const testResultColumns: CsvColumn<{
  testName: string;
  testDate: string;
  result: string | null;
  unit: string | null;
  referenceRange: string | null;
  facilityName: string | null;
  notes: string | null;
  createdAt: string;
}>[] = [
  { header: '検査項目名', accessor: 'testName' },
  { header: '検査日', accessor: (item) => formatDate(item.testDate) },
  { header: '結果値', accessor: 'result' },
  { header: '単位', accessor: 'unit' },
  { header: '基準範囲', accessor: 'referenceRange' },
  { header: '検査施設', accessor: 'facilityName' },
  { header: 'メモ', accessor: 'notes' },
  { header: '登録日', accessor: (item) => formatDateTime(item.createdAt) },
];

/**
 * 診療記録のCSVカラム定義
 */
export const medicalRecordColumns: CsvColumn<{
  recordType: string;
  title: string;
  content: string | null;
  recordDate: string;
  facilityName: string | null;
  doctorName: string | null;
  createdAt: string;
}>[] = [
  { header: '記録タイプ', accessor: (item) => getRecordTypeLabel(item.recordType) },
  { header: 'タイトル', accessor: 'title' },
  { header: '受診日', accessor: (item) => formatDate(item.recordDate) },
  { header: '医療機関', accessor: 'facilityName' },
  { header: '担当医', accessor: 'doctorName' },
  { header: '詳細・メモ', accessor: 'content' },
  { header: '登録日', accessor: (item) => formatDateTime(item.createdAt) },
];

/**
 * 記録タイプのラベルを取得
 */
function getRecordTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    visit: '外来受診',
    diagnosis: '診断',
    procedure: '処置・手術',
    consultation: '相談',
    other: 'その他',
  };
  return labels[type] || type;
}

