'use client';

interface MobileSection {
  id: string;
  title: string;
  answeredCount: number;
  totalCount: number;
}

interface MobileProgressBarProps {
  sections: MobileSection[];
  totalProgress: number;
  activeSection: string | null;
}

export function MobileProgressBar({
  sections,
  totalProgress,
  activeSection,
}: MobileProgressBarProps) {
  const handleScrollTo = (sectionId: string) => {
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border lg:hidden">
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex gap-1 px-4 py-2.5 w-max">
          {sections.map(section => {
            const isActive = activeSection === section.id;
            const isComplete = section.totalCount > 0 && section.answeredCount === section.totalCount;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => handleScrollTo(section.id)}
                className={`whitespace-nowrap text-[11px] px-3 py-1.5 rounded-full transition-colors ${
                  isActive
                    ? 'bg-foreground text-background font-medium'
                    : isComplete
                    ? 'text-green-600 bg-green-50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                {section.title}
              </button>
            );
          })}
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className="h-full bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${totalProgress}%` }}
        />
      </div>
    </div>
  );
}
