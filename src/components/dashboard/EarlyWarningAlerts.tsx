'use client';

import { AlertTriangle, TrendingDown } from 'lucide-react';
import type { EarlyWarningAlert } from '@/lib/types/analytics';

interface EarlyWarningAlertsProps {
  alerts: EarlyWarningAlert[];
}

export function EarlyWarningAlerts({ alerts }: EarlyWarningAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
          <span className="text-green-600 dark:text-green-400 text-base">✓</span>
        </div>
        <p className="text-sm font-medium text-foreground/80">No early warning signals</p>
        <p className="text-xs text-muted-foreground max-w-[280px]">
          All departments are performing at or above the overall average on both Their Job and Credibility dimensions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
            {alerts.length} department{alerts.length > 1 ? 's' : ''} flagged for dual-axis risk
          </p>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
            Both &quot;Their Job&quot; relationship and Credibility pillar score below the overall average.
            These departments may be experiencing leadership and role clarity issues simultaneously.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.department}
            className="rounded-lg border border-border/60 bg-card px-4 py-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{alert.department}</span>
              <span className="text-[11px] text-muted-foreground">
                {alert.responseCount} responses
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Their Job */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Their Job</span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                      {alert.jobScore}%
                    </span>
                    <span className="text-muted-foreground/60">
                      (avg {alert.overallJobAvg}%)
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-400/70"
                    style={{ width: `${alert.jobScore}%` }}
                  />
                </div>
                <div
                  className="h-px bg-border/60"
                  style={{ marginLeft: `${alert.overallJobAvg}%`, width: '2px', backgroundColor: 'hsl(var(--muted-foreground))', opacity: 0.4 }}
                />
              </div>

              {/* Credibility */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Credibility</span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                      {alert.credibilityScore}%
                    </span>
                    <span className="text-muted-foreground/60">
                      (avg {alert.overallCredibilityAvg}%)
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-400/70"
                    style={{ width: `${alert.credibilityScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Combined gap */}
            <div className="text-[10px] text-muted-foreground/70 border-t border-border/30 pt-2">
              Combined gap from average:{' '}
              <span className="text-red-500 font-medium">
                {(alert.overallJobAvg - alert.jobScore) + (alert.overallCredibilityAvg - alert.credibilityScore)}pp
              </span>{' '}
              below across both dimensions
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
