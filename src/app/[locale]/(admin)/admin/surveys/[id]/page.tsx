// src/app/[locale]/(admin)/admin/surveys/[id]/page.tsx
import { notFound } from 'next/navigation';
import { cachedGetSurvey, cachedGetQuestions, cachedGetResponseCount, cachedCountTokens } from '@/lib/cache';
import { generateToken } from '@/lib/services/token.service';
import { SurveyDetailClient } from '@/components/admin/SurveyDetailClient';

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  const survey = await cachedGetSurvey(id);
  if (!survey) notFound();

  const [questions, responseCount, tokenCount, previewToken] = await Promise.all([
    cachedGetQuestions(id),
    cachedGetResponseCount(id),
    cachedCountTokens(id),
    generateToken(id, 'admin-preview@survey-yoma.local'),
  ]);

  return (
    <SurveyDetailClient
      survey={survey}
      questions={questions}
      responseCount={responseCount}
      tokenCount={tokenCount}
      previewToken={previewToken}
    />
  );
}
