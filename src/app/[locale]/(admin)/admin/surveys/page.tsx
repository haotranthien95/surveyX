// src/app/[locale]/(admin)/admin/surveys/page.tsx
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { cachedListSurveys, cachedGetResponseCount, cachedGetQuestions } from '@/lib/cache';
import { Badge } from '@/components/ui/badge';
import type { Survey } from '@/lib/types';

function StatusBadge({ status, t }: { status: Survey['status']; t: (key: string) => string }) {
  if (status === 'active') {
    return <Badge className="bg-blue-50 text-blue-700 border-0">{t('statusActive')}</Badge>;
  }
  if (status === 'closed') {
    return <Badge variant="outline">{t('statusClosed')}</Badge>;
  }
  return <Badge variant="secondary">{t('statusDraft')}</Badge>;
}

export default async function SurveysPage() {
  const t = await getTranslations('surveys');
  const surveys = await cachedListSurveys();

  // Fetch question and response counts in parallel (cached)
  const enriched = await Promise.all(
    surveys.map(async (survey) => {
      const [questions, responseCount] = await Promise.all([
        cachedGetQuestions(survey.id),
        cachedGetResponseCount(survey.id),
      ]);
      return { survey, questionCount: questions.length, responseCount };
    })
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-semibold text-gray-900">{t('title')}</h1>
        <Link href="surveys/new" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {t('newSurvey')}
        </Link>
      </div>

      {/* Empty state */}
      {enriched.length === 0 ? (
        <div className="py-16">
          <h2 className="text-base font-medium text-foreground mb-1">{t('emptyHeading')}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t('emptyBody')}</p>
          <Link href="surveys/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 min-h-[44px]">
            {t('createFirstSurvey')}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border" role="list">
          {enriched.map(({ survey, questionCount, responseCount }) => (
            <li key={survey.id} className="flex items-center gap-4 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground truncate">
                    {survey.name}
                  </span>
                  <StatusBadge status={survey.status} t={t} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{t('questionCount', { count: questionCount })}</span>
                  <span>{t('responseCount', { count: responseCount })}</span>
                  <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Link
                href={`surveys/${survey.id}`}
                className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted min-h-[44px]"
              >
                {t('viewButton')}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
