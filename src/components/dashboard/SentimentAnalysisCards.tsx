'use client';

import { MessageSquare, AlertTriangle, Lightbulb, Heart } from 'lucide-react';
import type { SentimentAnalysisData, OpenEndedSentiment } from '@/lib/types/analytics';
import { cn } from '@/lib/utils';

interface SentimentAnalysisCardsProps {
  data: SentimentAnalysisData;
}

interface SentimentCardProps {
  sentiment: OpenEndedSentiment;
}

function SentimentBadge({
  type,
  count,
  percentage,
  themes,
}: {
  type: 'frustrated' | 'constructive' | 'positive' | 'unclassified';
  count: number;
  percentage: number;
  themes?: string[];
}) {
  const config = {
    frustrated: {
      label: 'Frustrated',
      icon: AlertTriangle,
      bgClass: 'bg-red-50 dark:bg-red-950/60',
      badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      barClass: 'bg-red-400',
      textClass: 'text-red-800 dark:text-red-200',
    },
    constructive: {
      label: 'Constructive',
      icon: Lightbulb,
      bgClass: 'bg-amber-50 dark:bg-amber-950/60',
      badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
      barClass: 'bg-amber-400',
      textClass: 'text-amber-800 dark:text-amber-200',
    },
    positive: {
      label: 'Positive',
      icon: Heart,
      bgClass: 'bg-green-50 dark:bg-green-950/60',
      badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      barClass: 'bg-green-400',
      textClass: 'text-green-800 dark:text-green-200',
    },
    unclassified: {
      label: 'Neutral / Mixed',
      icon: MessageSquare,
      bgClass: 'bg-muted/40',
      badgeClass: 'bg-muted text-muted-foreground',
      barClass: 'bg-muted-foreground/40',
      textClass: 'text-muted-foreground',
    },
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <div className={cn('rounded-lg p-3 space-y-2', c.bgClass)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={cn('w-3.5 h-3.5', c.textClass)} />
          <span className={cn('text-xs font-medium', c.textClass)}>{c.label}</span>
        </div>
        <span className={cn('text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full', c.badgeClass)}>
          {count} ({percentage}%)
        </span>
      </div>
      {/* Mini progress bar */}
      <div className="h-1 bg-black/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', c.barClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Themes */}
      {themes && themes.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {themes.map(theme => (
            <span
              key={theme}
              className={cn(
                'inline-block text-[10px] px-1.5 py-0.5 rounded border',
                type === 'frustrated' && 'border-red-200 text-red-600 dark:border-red-800 dark:text-red-400',
                type === 'constructive' && 'border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400',
                type === 'positive' && 'border-green-200 text-green-600 dark:border-green-800 dark:text-green-400',
                type === 'unclassified' && 'border-border text-muted-foreground'
              )}
            >
              {theme}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function OpenEndedCard({ sentiment }: SentimentCardProps) {
  if (sentiment.totalResponses === 0) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-foreground">{sentiment.questionLabel}</p>
        <p className="text-xs text-muted-foreground italic">No open-ended responses</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-foreground leading-relaxed">
          {sentiment.questionLabel}
        </p>
        <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
          {sentiment.totalResponses} responses
        </span>
      </div>
      {/* Stacked visual indicator */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {sentiment.frustrated.percentage > 0 && (
          <div
            className="bg-red-400 h-full transition-all"
            style={{ width: `${sentiment.frustrated.percentage}%` }}
            title={`Frustrated: ${sentiment.frustrated.percentage}%`}
          />
        )}
        {sentiment.constructive.percentage > 0 && (
          <div
            className="bg-amber-400 h-full transition-all"
            style={{ width: `${sentiment.constructive.percentage}%` }}
            title={`Constructive: ${sentiment.constructive.percentage}%`}
          />
        )}
        {sentiment.positive.percentage > 0 && (
          <div
            className="bg-green-400 h-full transition-all"
            style={{ width: `${sentiment.positive.percentage}%` }}
            title={`Positive: ${sentiment.positive.percentage}%`}
          />
        )}
        {sentiment.unclassified.percentage > 0 && (
          <div
            className="bg-gray-300 h-full transition-all"
            style={{ width: `${sentiment.unclassified.percentage}%` }}
            title={`Unclassified: ${sentiment.unclassified.percentage}%`}
          />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sentiment.frustrated.count > 0 && (
          <SentimentBadge
            type="frustrated"
            count={sentiment.frustrated.count}
            percentage={sentiment.frustrated.percentage}
            themes={sentiment.frustrated.themes}
          />
        )}
        {sentiment.constructive.count > 0 && (
          <SentimentBadge
            type="constructive"
            count={sentiment.constructive.count}
            percentage={sentiment.constructive.percentage}
            themes={sentiment.constructive.themes}
          />
        )}
        {sentiment.positive.count > 0 && (
          <SentimentBadge
            type="positive"
            count={sentiment.positive.count}
            percentage={sentiment.positive.percentage}
            themes={sentiment.positive.themes}
          />
        )}
        {sentiment.unclassified.count > 0 && (
          <SentimentBadge
            type="unclassified"
            count={sentiment.unclassified.count}
            percentage={sentiment.unclassified.percentage}
          />
        )}
      </div>
    </div>
  );
}

export function SentimentAnalysisCards({ data }: SentimentAnalysisCardsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Q1 — What makes this a great place to work?
        </h4>
        <OpenEndedCard sentiment={data.oe01} />
      </div>
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Q2 — What would you change to improve the workplace?
        </h4>
        <OpenEndedCard sentiment={data.oe02} />
      </div>
      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
        Sentiment is classified using keyword matching. &quot;Frustrated&quot; responses contain language about negative experiences.
        &quot;Constructive&quot; responses contain suggestions or improvement requests. &quot;Positive&quot; responses express satisfaction or appreciation.
      </p>
    </div>
  );
}
