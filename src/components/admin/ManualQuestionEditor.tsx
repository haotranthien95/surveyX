'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Question, QuestionType, Dimension } from '@/lib/types';

interface ManualQuestionEditorProps {
  surveyId: string;
  initialQuestions?: Question[];
}

const TYPES: { value: QuestionType; label: string }[] = [
  { value: 'likert', label: 'Likert (1-5 scale)' },
  { value: 'open_ended', label: 'Open-ended text' },
  { value: 'demographic', label: 'Demographic select' },
];

const DIMENSIONS: { value: string; label: string }[] = [
  { value: '_none', label: 'None' },
  { value: 'camaraderie', label: 'Camaraderie' },
  { value: 'credibility', label: 'Credibility' },
  { value: 'fairness', label: 'Fairness' },
  { value: 'pride', label: 'Pride' },
  { value: 'respect', label: 'Respect' },
];

interface QuestionDraft {
  localId: string;
  id: string;
  type: QuestionType;
  en: string;
  my: string;
  dimension: Dimension | '';
  subPillar: string;
  options: string; // JSON string for demographic options
}

function createBlankQuestion(index: number): QuestionDraft {
  return {
    localId: crypto.randomUUID(),
    id: `Q-${String(index + 1).padStart(2, '0')}`,
    type: 'likert',
    en: '',
    my: '',
    dimension: '',
    subPillar: '',
    options: '',
  };
}

export function ManualQuestionEditor({ surveyId, initialQuestions }: ManualQuestionEditorProps) {
  const t = useTranslations('surveys');
  const router = useRouter();
  const locale = useLocale();

  const [questions, setQuestions] = useState<QuestionDraft[]>(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      return initialQuestions.map((q, i) => ({
        localId: crypto.randomUUID(),
        id: q.id,
        type: q.type,
        en: q.en,
        my: q.my,
        dimension: q.dimension || '',
        subPillar: q.subPillar || '',
        options: q.options ? JSON.stringify(q.options) : '',
      }));
    }
    return [createBlankQuestion(0)];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addQuestion() {
    setQuestions(prev => [...prev, createBlankQuestion(prev.length)]);
  }

  function removeQuestion(localId: string) {
    setQuestions(prev => prev.filter(q => q.localId !== localId));
  }

  function updateQuestion(localId: string, field: keyof QuestionDraft, value: string) {
    setQuestions(prev => prev.map(q =>
      q.localId === localId ? { ...q, [field]: value } : q
    ));
  }

  async function handleSave() {
    // Validate — at least one question with English text
    const valid = questions.filter(q => q.en.trim() !== '');
    if (valid.length === 0) {
      setError('Add at least one question with English text.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload: Question[] = valid.map(q => ({
      id: q.id,
      type: q.type,
      en: q.en.trim(),
      my: q.my.trim() || q.en.trim(),
      dimension: (q.dimension || undefined) as Question['dimension'],
      subPillar: q.subPillar || undefined,
      options: q.options ? (() => {
        try { return JSON.parse(q.options); } catch { return undefined; }
      })() : undefined,
    }));

    try {
      const res = await fetch(`/api/surveys/${surveyId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: payload }),
      });

      if (res.ok) {
        router.push(`/${locale}/admin/surveys/${surveyId}`);
      } else {
        const data = await res.json().catch(() => ({ error: 'Save failed' }));
        setError(data.error || 'Save failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" /> Add Question
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Saving...' : 'Save Questions'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="space-y-3">
        {questions.map((q, index) => (
          <div key={q.localId} className="border border-border rounded-lg p-4 space-y-3 bg-white">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              <span className="text-xs text-muted-foreground tabular-nums font-medium w-6">
                {index + 1}
              </span>

              {/* ID */}
              <Input
                value={q.id}
                onChange={e => updateQuestion(q.localId, 'id', e.target.value)}
                placeholder="ID (e.g. Q-01)"
                className="w-24 h-8 text-xs"
              />

              {/* Type */}
              <Select value={q.type} onValueChange={v => { if (v) updateQuestion(q.localId, 'type', v); }}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Dimension */}
              {q.type === 'likert' && (
                <Select value={q.dimension || '_none'} onValueChange={v => { if (v) updateQuestion(q.localId, 'dimension', v === '_none' ? '' : v); }}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue placeholder="Dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIMENSIONS.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex-1" />

              <button
                type="button"
                onClick={() => removeQuestion(q.localId)}
                className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                aria-label="Remove question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* English text */}
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">
                English
              </label>
              <Textarea
                value={q.en}
                onChange={e => updateQuestion(q.localId, 'en', e.target.value)}
                placeholder="Question text in English..."
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Burmese text */}
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">
                Burmese (optional — defaults to English)
              </label>
              <Textarea
                value={q.my}
                onChange={e => updateQuestion(q.localId, 'my', e.target.value)}
                placeholder="မြန်မာဘာသာ..."
                rows={2}
                className="text-sm font-myanmar"
              />
            </div>

            {/* Sub-pillar for likert */}
            {q.type === 'likert' && q.dimension && (
              <Input
                value={q.subPillar}
                onChange={e => updateQuestion(q.localId, 'subPillar', e.target.value)}
                placeholder="Sub-pillar (e.g. Community, Integrity)"
                className="h-8 text-xs"
              />
            )}

            {/* Options for demographic */}
            {q.type === 'demographic' && (
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">
                  Options (JSON array)
                </label>
                <Textarea
                  value={q.options}
                  onChange={e => updateQuestion(q.localId, 'options', e.target.value)}
                  placeholder='[{"en": "Option 1", "my": "ရွေးချယ်စရာ ၁"}, {"en": "Option 2", "my": "ရွေးချယ်စရာ ၂"}]'
                  rows={2}
                  className="text-xs font-mono"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={addQuestion} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Add Another Question
        </Button>
      </div>
    </div>
  );
}
