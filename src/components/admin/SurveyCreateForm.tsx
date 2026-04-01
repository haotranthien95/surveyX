'use client';

// src/components/admin/SurveyCreateForm.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SurveyCreateFormProps {
  onSuccess?: (surveyId: string) => void;
}

export function SurveyCreateForm({ onSuccess }: SurveyCreateFormProps) {
  const t = useTranslations('surveys');
  const router = useRouter();
  const locale = useLocale();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setNameError(t('nameRequired'));
      return;
    }

    setNameError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNameError((data as { error?: string }).error ?? 'Something went wrong.');
        return;
      }

      const data = (await res.json()) as { survey: { id: string } };
      const surveyId = data.survey.id;

      if (onSuccess) {
        onSuccess(surveyId);
      } else {
        router.push(`/${locale}/admin/surveys/new?step=2&id=${surveyId}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="survey-name">{t('nameLabel')}</Label>
        <Input
          id="survey-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          placeholder={t('namePlaceholder')}
          aria-invalid={nameError ? 'true' : undefined}
          aria-describedby={nameError ? 'survey-name-error' : undefined}
          required
        />
        {nameError && (
          <p id="survey-name-error" className="text-sm text-destructive">
            {nameError}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="survey-description">{t('descriptionLabel')}</Label>
        <Textarea
          id="survey-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('descriptionPlaceholder')}
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={submitting}>
          {t('createButton')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/admin/surveys`)}
        >
          {t('discardButton')}
        </Button>
      </div>
    </form>
  );
}
