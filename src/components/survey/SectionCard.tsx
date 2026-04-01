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
  return (
    <div
      id={`section-${sectionId}`}
      className="bg-white border border-gray-200 rounded-xl p-6 mb-8 sm:p-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">{icon}</span>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <span className="text-sm text-gray-400">
          {answeredCount}/{totalCount}
        </span>
      </div>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
      <div className="border-b border-gray-100 mt-3 mb-6" />
      <div className="space-y-6">{children}</div>
    </div>
  );
}
