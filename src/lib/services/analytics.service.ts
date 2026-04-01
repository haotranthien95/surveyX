// src/lib/services/analytics.service.ts
// Server-only analytics aggregation — do NOT add 'use client'

import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { countSurveyTokens } from './token.service';
import { GPTW_QUESTIONS } from '@/lib/constants';
import type { DashboardData, DepartmentBreakdownData } from '@/lib/types/analytics';

const ANONYMITY_THRESHOLD = 5;

const DIMENSION_DISPLAY: Record<string, string> = {
  camaraderie: 'Camaraderie',
  credibility: 'Credibility',
  fairness: 'Fairness',
  pride: 'Pride',
  respect: 'Respect',
};

const SCORED_DIMENSIONS = ['camaraderie', 'credibility', 'fairness', 'pride', 'respect'] as const;

function favorableScore(rows: Record<string, string>[], questionId: string): number {
  const validAnswers = rows
    .map(r => r[questionId])
    .filter(v => v !== undefined && v !== '');

  if (validAnswers.length === 0) return 0;

  const favorable = validAnswers.filter(v => v === '4' || v === '5').length;
  return Math.round((favorable / validAnswers.length) * 100);
}

function computeENPS(
  rows: Record<string, string>[]
): { score: number; promoters: number; passives: number; detractors: number } {
  const validAnswers = rows
    .map(r => r['UNC-47'])
    .filter(v => v !== undefined && v !== '');

  if (validAnswers.length === 0) {
    return { score: 0, promoters: 0, passives: 0, detractors: 0 };
  }

  const total = validAnswers.length;
  const promoterCount = validAnswers.filter(v => v === '4' || v === '5').length;
  const passiveCount = validAnswers.filter(v => v === '3').length;
  const detractorCount = validAnswers.filter(v => v === '1' || v === '2').length;

  const promoters = Math.round((promoterCount / total) * 100);
  const passives = Math.round((passiveCount / total) * 100);
  const detractors = Math.round((detractorCount / total) * 100);

  return { score: promoters - detractors, promoters, passives, detractors };
}

function computeSegmentDimensions(
  rows: Record<string, string>[],
): { dimension: string; score: number | null }[] {
  if (rows.length < ANONYMITY_THRESHOLD) {
    return SCORED_DIMENSIONS.map(dim => ({
      dimension: DIMENSION_DISPLAY[dim],
      score: null,
    }));
  }

  return SCORED_DIMENSIONS.map(dim => {
    const dimQuestions = GPTW_QUESTIONS.filter(
      q => q.type === 'likert' && q.dimension === dim
    );
    const scores = dimQuestions.map(q => favorableScore(rows, q.id));
    const meanScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    return { dimension: DIMENSION_DISPLAY[dim], score: meanScore };
  });
}

export async function computeAnalytics(surveyId: string): Promise<DashboardData | null> {
  // Load responses from PostgreSQL
  const dbResponses = await db.select().from(schema.responses)
    .where(eq(schema.responses.surveyId, surveyId));

  if (dbResponses.length === 0) return null;

  // Convert DB rows to flat answer records (same shape as old CSV rows)
  const rows: Record<string, string>[] = dbResponses.map(r => {
    const answers = r.answers as Record<string, string>;
    return { ...answers, email: r.email };
  });

  const likertQuestions = GPTW_QUESTIONS.filter(q => q.type === 'likert');

  // Per-question favorable scores
  const questionScoreMap: Record<string, number> = {};
  for (const q of likertQuestions) {
    questionScoreMap[q.id] = favorableScore(rows, q.id);
  }

  // EES = mean of all per-question scores
  const allScores = Object.values(questionScoreMap);
  const eesScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  // GPTW score = UNC-47
  const gptwScore = questionScoreMap['UNC-47'] ?? 0;

  // Dimension scores
  const dimensionScoreMap: Record<string, number> = {};
  for (const dim of SCORED_DIMENSIONS) {
    const dimQuestions = likertQuestions.filter(q => q.dimension === dim);
    const dimScores = dimQuestions.map(q => questionScoreMap[q.id]);
    dimensionScoreMap[dim] = dimScores.length > 0
      ? Math.round(dimScores.reduce((a, b) => a + b, 0) / dimScores.length)
      : 0;
  }

  const dimensions = SCORED_DIMENSIONS.map(dim => ({
    dimension: DIMENSION_DISPLAY[dim],
    score: dimensionScoreMap[dim],
  }));

  // Sentiment
  let positiveCount = 0, neutralCount = 0, negativeCount = 0, totalValid = 0;
  for (const q of likertQuestions) {
    for (const row of rows) {
      const v = row[q.id];
      if (!v) continue;
      totalValid++;
      if (v === '4' || v === '5') positiveCount++;
      else if (v === '3') neutralCount++;
      else negativeCount++;
    }
  }

  const sentiment = {
    positive: totalValid > 0 ? Math.round((positiveCount / totalValid) * 100) : 0,
    neutral: totalValid > 0 ? Math.round((neutralCount / totalValid) * 100) : 0,
    negative: totalValid > 0 ? Math.round((negativeCount / totalValid) * 100) : 0,
  };

  // ENPS
  const enps = computeENPS(rows);

  // Strengths / Opportunities
  const scoredQuestions = likertQuestions.map(q => ({
    label: q.en.length > 60 ? q.en.substring(0, 60) + '…' : q.en,
    score: questionScoreMap[q.id],
  }));

  const strengths = [...scoredQuestions].sort((a, b) => b.score - a.score).slice(0, 10);
  const opportunities = [...scoredQuestions].sort((a, b) => a.score - b.score).slice(0, 10);

  // Response rate
  const totalTokens = await countSurveyTokens(surveyId);
  const responseRate = totalTokens === 0 ? 0 : Math.round((rows.length / totalTokens) * 100);

  // Innovation / Leadership composite scores
  const innovationIds = ['CRE-11', 'RES-38', 'RES-44', 'PRI-28'];
  const leadershipIds = ['CRE-09', 'CRE-10', 'CRE-12', 'CRE-13', 'CRE-15'];

  const innovationScore = Math.round(
    innovationIds.map(id => questionScoreMap[id] ?? 0).reduce((a, b) => a + b, 0) / innovationIds.length
  );
  const leadershipScore = Math.round(
    leadershipIds.map(id => questionScoreMap[id] ?? 0).reduce((a, b) => a + b, 0) / leadershipIds.length
  );

  const leaderboard = [
    { label: 'Completion',   value: responseRate,                  color: 'hsl(220 70% 55%)' },
    { label: 'Credibility',  value: dimensionScoreMap.credibility, color: 'hsl(220 70% 55%)' },
    { label: 'Respect',      value: dimensionScoreMap.respect,     color: 'hsl(255 55% 58%)' },
    { label: 'Fairness',     value: dimensionScoreMap.fairness,    color: 'hsl(175 45% 45%)' },
    { label: 'Pride',        value: dimensionScoreMap.pride,       color: 'hsl(25 75% 55%)'  },
    { label: 'Camaraderie',  value: dimensionScoreMap.camaraderie, color: 'hsl(155 45% 45%)' },
    { label: 'Satisfaction', value: gptwScore,                     color: 'hsl(220 70% 55%)' },
    { label: 'ENPS',         value: enps.score,                    color: 'hsl(155 45% 45%)' },
    { label: 'Engagement',   value: eesScore,                      color: 'hsl(255 55% 58%)' },
    { label: 'Innovation',   value: innovationScore,               color: 'hsl(175 45% 45%)' },
    { label: 'Leadership',   value: leadershipScore,               color: 'hsl(25 75% 55%)'  },
  ];

  // Department breakdown — group by DEM-ORG
  const segmentMap = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const org = row['DEM-ORG'] || 'Unknown';
    if (!segmentMap.has(org)) segmentMap.set(org, []);
    segmentMap.get(org)!.push(row);
  }

  const departmentBreakdown: DepartmentBreakdownData = {
    segments: Array.from(segmentMap.entries()).map(([segmentLabel, segmentRows]) => ({
      segmentLabel,
      dimensions: computeSegmentDimensions(segmentRows),
      responseCount: segmentRows.length,
    })),
    anonymityThreshold: ANONYMITY_THRESHOLD,
  };

  return {
    eesScore,
    eesTrend: 0,
    gptwScore,
    responseRate,
    totalResponses: rows.length,
    dimensions,
    sentiment,
    enps,
    strengths,
    opportunities,
    leaderboard,
    departmentBreakdown,
  };
}
