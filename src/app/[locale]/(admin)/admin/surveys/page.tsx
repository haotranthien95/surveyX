// src/app/[locale]/(admin)/admin/surveys/page.tsx
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listSurveys, getResponseCount, getQuestions } from '@/lib/services/survey.service';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  const surveys = await listSurveys();

  // Fetch question and response counts for each survey in parallel
  const enriched = await Promise.all(
    surveys.map(async (survey) => {
      const [questions, responseCount] = await Promise.all([
        getQuestions(survey.id),
        getResponseCount(survey.id),
      ]);
      return { survey, questionCount: questions.length, responseCount };
    })
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-semibold text-gray-900">{t('title')}</h1>
        <Link href="surveys/new" className={cn(buttonVariants({ variant: 'default' }))}>
          {t('newSurvey')}
        </Link>
      </div>

      {/* Empty state */}
      {enriched.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('emptyHeading')}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t('emptyBody')}</p>
          <Link href="surveys/new" className={cn(buttonVariants({ variant: 'default' }))}>
            {t('createFirstSurvey')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {enriched.map(({ survey, questionCount, responseCount }) => (
            <div
              key={survey.id}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              {/* Survey name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900 truncate">
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

              {/* Actions */}
              <Link
                href={`surveys/${survey.id}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                {t('viewButton')}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
