'use client';

import { Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

interface DashboardFiltersProps {
  surveys: { id: string; name: string }[];
  activeSurveyId: string | undefined;
  orgOptions?: string[];
}

const DEFAULT_ORG_OPTIONS = ['Wave Money', 'Yoma Bank'];

function DashboardFiltersInner({ surveys, activeSurveyId, orgOptions = DEFAULT_ORG_OPTIONS }: DashboardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeOrg = searchParams.get('org') ?? '';

  function handleSurveyChange(surveyId: string | null) {
    if (!surveyId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('survey', surveyId);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleOrgChange(org: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (org && org !== '__all__') {
      params.set('org', org);
    } else {
      params.delete('org');
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      {/* Survey selector */}
      <Select value={activeSurveyId ?? ''} onValueChange={handleSurveyChange}>
        <SelectTrigger className="w-64">
          <span className="truncate">
            {surveys.find(s => s.id === activeSurveyId)?.name || 'Select survey'}
          </span>
        </SelectTrigger>
        <SelectContent>
          {surveys.map(s => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Organization filter */}
      <Select value={activeOrg || '__all__'} onValueChange={handleOrgChange}>
        <SelectTrigger className="w-48">
          <span className="truncate">
            {activeOrg || 'All Organizations'}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Organizations</SelectItem>
          {orgOptions.map(org => (
            <SelectItem key={org} value={org}>
              {org}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function DashboardFilters(props: DashboardFiltersProps) {
  return (
    <Suspense fallback={<div className="h-8 w-96 animate-pulse rounded-lg bg-muted" />}>
      <DashboardFiltersInner {...props} />
    </Suspense>
  );
}
