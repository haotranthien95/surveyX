'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Survey, Question } from '@/lib/types';

// Query keys
export const surveyKeys = {
  all: ['surveys'] as const,
  detail: (id: string) => ['survey', id] as const,
  questions: (id: string) => ['questions', id] as const,
};

// Fetch all surveys
export function useSurveys() {
  return useQuery({
    queryKey: surveyKeys.all,
    queryFn: async (): Promise<Survey[]> => {
      const res = await fetch('/api/surveys');
      if (!res.ok) throw new Error('Failed to fetch surveys');
      const data = await res.json();
      return data.surveys;
    },
  });
}

// Fetch single survey
export function useSurvey(id: string) {
  return useQuery({
    queryKey: surveyKeys.detail(id),
    queryFn: async (): Promise<Survey> => {
      const res = await fetch(`/api/surveys/${id}`);
      if (!res.ok) throw new Error('Failed to fetch survey');
      const data = await res.json();
      return data.survey;
    },
    enabled: !!id,
  });
}

// Fetch survey questions
export function useSurveyQuestions(surveyId: string) {
  return useQuery({
    queryKey: surveyKeys.questions(surveyId),
    queryFn: async (): Promise<Question[]> => {
      const res = await fetch(`/api/surveys/${surveyId}/questions`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      return data.questions;
    },
    enabled: !!surveyId,
  });
}

// Update survey mutation
export function useUpdateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string; status?: string }) => {
      const res = await fetch(`/api/surveys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update survey');
      const result = await res.json();
      return result.survey as Survey;
    },
    onSuccess: (survey) => {
      queryClient.setQueryData(surveyKeys.detail(survey.id), survey);
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
    },
  });
}

// Delete survey mutation
export function useDeleteSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/surveys/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete survey');
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: surveyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
    },
  });
}

// Send invitations mutation
export function useSendInvitations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ surveyId, emails, locale }: { surveyId: string; emails: string[]; locale: string }) => {
      const res = await fetch(`/api/surveys/${surveyId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, locale }),
      });
      if (!res.ok) throw new Error('Failed to send invitations');
      return res.json();
    },
    onSuccess: (_data, { surveyId }) => {
      queryClient.invalidateQueries({ queryKey: ['tokens', surveyId] });
    },
  });
}
