import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './cache';

// Next.js 16 requires (tag, profile) — use 'default'
const P = 'default';

export function revalidateSurveys() {
  revalidateTag(CACHE_TAGS.surveys, P);
}

export function revalidateSurvey(id: string) {
  revalidateTag(CACHE_TAGS.survey(id), P);
  revalidateTag(CACHE_TAGS.questions(id), P);
  revalidateTag(CACHE_TAGS.surveys, P);
}

export function revalidateAnalytics(surveyId: string) {
  revalidateTag(CACHE_TAGS.analytics(surveyId), P);
}

export function revalidateTokens(surveyId: string) {
  revalidateTag(CACHE_TAGS.tokens(surveyId), P);
}

export function revalidateSmtp() {
  revalidateTag(CACHE_TAGS.smtp, P);
}
