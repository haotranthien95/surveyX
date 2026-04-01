'use client';

// src/components/admin/ExcelUploadStep.tsx
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Question } from '@/lib/types';

interface ExcelUploadStepProps {
  surveyId: string;
  acceptCSV?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TypeBadge({ type }: { type: Question['type'] }) {
  if (type === 'likert') return <Badge className="bg-blue-50 text-blue-700 border-0">Likert</Badge>;
  if (type === 'open_ended') return <Badge variant="secondary">Open-ended</Badge>;
  return <Badge variant="outline">Demographic</Badge>;
}

export function ExcelUploadStep({ surveyId, acceptCSV = false }: ExcelUploadStepProps) {
  const t = useTranslations('surveys');
  const router = useRouter();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formatError, setFormatError] = useState(false);

  function isValidFile(file: File): boolean {
    if (acceptCSV) {
      return file.name.endsWith('.csv');
    }
    return file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  }

  function handleFileSelect(file: File) {
    setError(null);
    setFormatError(false);
    setQuestions(null);

    if (!isValidFile(file)) {
      setFormatError(true);
      return;
    }
    setSelectedFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`/api/surveys/${surveyId}/questions`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        setError(t('uploadParseError'));
        return;
      }

      const data = (await res.json()) as { questions: Question[] };
      setQuestions(data.questions);
    } catch {
      setError(t('uploadParseError'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground mb-1">{t('uploadLabel')}</p>
        <p className="text-sm text-muted-foreground">{t('uploadHint')}</p>
      </div>

      {/* Drop zone */}
      {!selectedFile && (
        <div
          className={`border-2 border-dashed rounded-lg min-h-[120px] flex items-center justify-center cursor-pointer transition-colors ${
            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          aria-label={t('uploadDropzone')}
        >
          <p className="text-sm text-muted-foreground text-center px-4">
            {t('uploadDropzone')}
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptCSV ? '.csv' : '.xlsx,.xls'}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Format error */}
      {formatError && (
        <Alert variant="destructive">
          <AlertDescription>{t('uploadFormatError')}</AlertDescription>
        </Alert>
      )}

      {/* Selected file row */}
      {selectedFile && (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
          <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            onClick={() => {
              setSelectedFile(null);
              setQuestions(null);
              setError(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Upload error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload success */}
      {questions && (
        <Alert>
          <AlertDescription>
            {t('uploadSuccess', { count: questions.length })}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload button */}
      {selectedFile && !questions && (
        <Button onClick={handleUpload} disabled={uploading}>
          {uploading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading...
            </span>
          ) : (
            t('importButton')
          )}
        </Button>
      )}

      {/* Question preview table */}
      {questions && questions.length > 0 && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">{t('questionId')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">{t('questionEnglish')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">{t('questionBurmese')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">{t('questionType')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">{t('questionSection')}</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs">{q.id}</td>
                  <td className="px-3 py-2 max-w-[240px]">{q.en}</td>
                  <td className="px-3 py-2 max-w-[240px]">{q.my}</td>
                  <td className="px-3 py-2">
                    <TypeBadge type={q.type} />
                  </td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{q.dimension ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Navigate to survey after import */}
      {questions && (
        <Button onClick={() => router.push(`/${locale}/admin/surveys/${surveyId}`)}>
          {t('importButton')}
        </Button>
      )}
    </div>
  );
}
