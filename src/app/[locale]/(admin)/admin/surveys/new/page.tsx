'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FileSpreadsheet, FileText, Edit3, Sparkles, ArrowLeft } from 'lucide-react';
import { SurveyCreateForm } from '@/components/admin/SurveyCreateForm';
import { ExcelUploadStep } from '@/components/admin/ExcelUploadStep';
import { ManualQuestionEditor } from '@/components/admin/ManualQuestionEditor';
import { Button } from '@/components/ui/button';

type ImportMethod = null | 'excel' | 'csv' | 'manual' | 'defaults';
type Step = 'details' | 'method' | 'import';

export default function NewSurveyPage() {
  const t = useTranslations('surveys');
  const router = useRouter();
  const locale = useLocale();

  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<ImportMethod>(null);
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  const step: Step = !surveyId ? 'details' : !importMethod ? 'method' : 'import';

  async function handleUseDefaults() {
    if (!surveyId) return;
    setLoadingDefaults(true);
    try {
      const res = await fetch(`/api/surveys/${surveyId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useDefaults: true }),
      });
      if (res.ok) {
        router.push(`/${locale}/admin/surveys/${surveyId}`);
      }
    } catch {
      // fallback
    } finally {
      setLoadingDefaults(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-lg font-medium text-foreground mb-6">
        {t('createTitle')}
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8 text-sm">
        {[
          { num: 1, label: 'Survey Details', active: step === 'details' },
          { num: 2, label: 'Import Method', active: step === 'method' },
          { num: 3, label: 'Add Questions', active: step === 'import' },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            {i > 0 && <span className="text-border">—</span>}
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              s.active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
            }`}>
              {s.num}
            </span>
            <span className={s.active ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Survey details */}
      {step === 'details' && (
        <SurveyCreateForm onSuccess={(id) => setSurveyId(id)} />
      )}

      {/* Step 2: Choose import method */}
      {step === 'method' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-6">
            Choose how to add questions to your survey.
          </p>

          <div className="grid gap-3">
            {/* Use default GPTW questions */}
            <button
              type="button"
              onClick={handleUseDefaults}
              disabled={loadingDefaults}
              className="flex items-start gap-4 p-4 border border-border rounded-lg text-left hover:bg-muted/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Use Default GPTW Questions</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {loadingDefaults ? 'Loading...' : '52 bilingual questions — 47 Likert + 2 open-ended + 3 demographics. Ready to go.'}
                </p>
              </div>
            </button>

            {/* Upload Excel */}
            <button
              type="button"
              onClick={() => setImportMethod('excel')}
              className="flex items-start gap-4 p-4 border border-border rounded-lg text-left hover:bg-muted/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Upload Excel File</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Import questions from .xlsx or .xls with bilingual columns.
                </p>
              </div>
            </button>

            {/* Upload CSV */}
            <button
              type="button"
              onClick={() => setImportMethod('csv')}
              className="flex items-start gap-4 p-4 border border-border rounded-lg text-left hover:bg-muted/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Upload CSV File</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Import from .csv with columns: id, type, en, my, dimension, subPillar, options.
                </p>
              </div>
            </button>

            {/* Manual editor */}
            <button
              type="button"
              onClick={() => setImportMethod('manual')}
              className="flex items-start gap-4 p-4 border border-border rounded-lg text-left hover:bg-muted/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                <Edit3 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Create Manually</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add questions one by one with the built-in editor.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Import */}
      {step === 'import' && (
        <div>
          <button
            type="button"
            onClick={() => setImportMethod(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to import methods
          </button>

          {(importMethod === 'excel' || importMethod === 'csv') && (
            <ExcelUploadStep surveyId={surveyId!} acceptCSV={importMethod === 'csv'} />
          )}

          {importMethod === 'manual' && (
            <ManualQuestionEditor surveyId={surveyId!} />
          )}
        </div>
      )}
    </div>
  );
}
