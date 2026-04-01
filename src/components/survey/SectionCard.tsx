import type { ReactNode } from 'react';

interface SectionCardProps {
  sectionId: string;
  title: string;
  icon: ReactNode;
  description?: string;
  answeredCount: number;
  totalCount: number;
  children: ReactNode;
}

export function SectionCard({
  sectionId,
  title,
  icon,
  description,
  answeredCount,
  totalCount,
  children,
}: SectionCardProps) {
  const progress = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <section
      id={`section-${sectionId}`}
      className="mb-10"
    >
      {/* Section header — clean, no card wrapper */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <span className="text-muted-foreground/60">{icon}</span>
          <h2 className="text-base font-medium text-foreground">{title}</h2>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {answeredCount}/{totalCount}
        </span>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground ml-[30px] mb-3">{description}</p>
      )}

      {/* Thin progress line */}
      <div className="h-0.5 bg-border rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-foreground/20 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Questions — dividers between, not cards */}
      <div className="divide-y divide-border/50">
        {children}
      </div>
    </section>
  );
}
