'use client';

// src/app/[locale]/(admin)/admin/surveys/new/page.tsx
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SurveyCreateForm } from '@/components/admin/SurveyCreateForm';
import { ExcelUploadStep } from '@/components/admin/ExcelUploadStep';

export default function NewSurveyPage() {
  const t = useTranslations('surveys');
  const searchParams = useSearchParams();

  const [surveyId, setSurveyId] = useState<string | null>(
    searchParams.get('id')
  );
  const step = surveyId ? 2 : 1;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-[20px] font-semibold text-gray-900 mb-6">
        {t('createTitle')}
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span
          className={`px-3 py-1 rounded-full font-medium ${
            step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          1
        </span>
        <span className={step === 1 ? 'text-gray-900' : 'text-gray-400'}>
          Survey Details
        </span>
        <span className="text-gray-300 mx-1">→</span>
        <span
          className={`px-3 py-1 rounded-full font-medium ${
            step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          2
        </span>
        <span className={step === 2 ? 'text-gray-900' : 'text-gray-400'}>
          Import Questions
        </span>
      </div>

      {step === 1 ? (
        <SurveyCreateForm onSuccess={(id) => setSurveyId(id)} />
      ) : (
        <ExcelUploadStep surveyId={surveyId!} />
      )}
    </div>
  );
}
