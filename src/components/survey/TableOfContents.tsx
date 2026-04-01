'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

interface TocSection {
  id: string;
  title: string;
  answeredCount: number;
  totalCount: number;
}

interface TableOfContentsProps {
  sections: TocSection[];
  totalProgress: number;
}

export function TableOfContents({ sections, totalProgress }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(
    sections[0]?.id ?? null
  );
  const activeSectionRef = useRef(activeSection);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(section => {
      const el = document.getElementById(`section-${section.id}`);
      if (!el) return;

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveSection(section.id);
            }
          });
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  const handleScrollTo = (sectionId: string) => {
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="w-56 sticky top-24 hidden lg:block" aria-label="Survey sections">
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">Progress</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{totalProgress}%</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground rounded-full transition-all duration-500 ease-out"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Section list */}
      <ul className="space-y-0.5">
        {sections.map(section => {
          const isComplete = section.totalCount > 0 && section.answeredCount === section.totalCount;
          const isActive = activeSection === section.id;

          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => handleScrollTo(section.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left text-[13px] transition-colors ${
                  isActive
                    ? 'text-foreground font-medium'
                    : isComplete
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/70 hover:text-foreground hover:bg-muted/30'
                }`}
              >
                {isComplete ? (
                  <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" strokeWidth={2.5} />
                ) : isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground flex-shrink-0 ml-1 mr-0.5" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-border flex-shrink-0 ml-1 mr-0.5" />
                )}
                <span className="truncate">{section.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
