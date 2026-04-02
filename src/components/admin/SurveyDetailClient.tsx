'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Eye, Send, Pencil, Check, X, Trash2, Play, Pause, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ManualQuestionEditor } from '@/components/admin/ManualQuestionEditor';
import { useUpdateSurvey, useDeleteSurvey } from '@/hooks/use-surveys';
import type { Survey, Question } from '@/lib/types';

interface SurveyDetailClientProps {
  survey: Survey;
  questions: Question[];
  responseCount: number;
  tokenCount: number;
  previewToken: string;
  surveys: { id: string; name: string }[];
}

function StatusBadge({ status }: { status: Survey['status'] }) {
  if (status === 'active') return <Badge className="bg-green-50 text-green-700 border-0 text-xs px-2.5 py-0.5">Active</Badge>;
  if (status === 'closed') return <Badge variant="outline" className="text-xs px-2.5 py-0.5">Closed</Badge>;
  return <Badge variant="secondary" className="text-xs px-2.5 py-0.5">Draft</Badge>;
}

function TypeBadge({ type }: { type: Question['type'] }) {
  if (type === 'likert') return <Badge className="bg-blue-50 text-blue-700 border-0 text-[11px]">Likert</Badge>;
  if (type === 'open_ended') return <Badge variant="secondary" className="text-[11px]">Open-ended</Badge>;
  return <Badge variant="outline" className="text-[11px]">Demographic</Badge>;
}

export function SurveyDetailClient({ survey: initialSurvey, questions: initialQuestions, responseCount, tokenCount, previewToken, surveys }: SurveyDetailClientProps) {
  const t = useTranslations('surveys');
  const router = useRouter();
  const locale = useLocale();

  const [survey, setSurvey] = useState(initialSurvey);
  const [editingHeader, setEditingHeader] = useState(false);
  const [editingQuestions, setEditingQuestions] = useState(false);
  const [editName, setEditName] = useState(survey.name);
  const [editDesc, setEditDesc] = useState(survey.description || '');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const updateMutation = useUpdateSurvey();
  const deleteMutation = useDeleteSurvey();

  async function saveHeader() {
    const updated = await updateMutation.mutateAsync({
      id: survey.id,
      name: editName,
      description: editDesc,
    });
    setSurvey(updated);
    setEditingHeader(false);
  }

  async function updateStatus(status: 'draft' | 'active' | 'closed') {
    const updated = await updateMutation.mutateAsync({ id: survey.id, status });
    setSurvey(updated);
    setShowStatusMenu(false);
  }

  async function handleDelete() {
    if (!confirm('Delete this survey and all its questions, tokens, and responses? This cannot be undone.')) return;
    await deleteMutation.mutateAsync(survey.id);
    router.push(`/${locale}/admin/surveys`);
  }

  if (editingQuestions) {
    return (
      <div className="p-8 max-w-3xl">
        <button
          type="button"
          onClick={() => setEditingQuestions(false)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          ← Back to survey
        </button>
        <h2 className="text-xl font-light text-foreground tracking-tight mb-6">Edit Questions</h2>
        <ManualQuestionEditor surveyId={survey.id} initialQuestions={initialQuestions} />
      </div>
    );
  }

  // Hero stats for bold display
  const pendingCount = Math.max(0, tokenCount - responseCount);
  const responseRate = tokenCount > 0 ? Math.round((responseCount / tokenCount) * 100) : 0;

  return (
    <div className="p-8">

      {/* Survey switcher + New */}
      <div className="mb-10 flex items-center gap-2">
        <Select value={survey.id} onValueChange={(id) => { if (id) router.push(`/${locale}/admin/surveys/${id}`); }}>
          <SelectTrigger className="w-72">
            <span className="truncate">{surveys.find(s => s.id === survey.id)?.name || survey.name}</span>
          </SelectTrigger>
          <SelectContent>
            {surveys.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Link href={`/${locale}/admin/surveys/new`}>
          <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" aria-label={t('newSurvey')}>
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Header — editorial style */}
      <div className="mb-10">
        {editingHeader ? (
          <div className="space-y-3 max-w-lg">
            <Input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="text-2xl font-light tracking-tight"
              autoFocus
            />
            <Textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveHeader} disabled={updateMutation.isPending || !editName.trim()}>
                <Check className="w-3.5 h-3.5 mr-1" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setEditingHeader(false);
                setEditName(survey.name);
                setEditDesc(survey.description || '');
              }}>
                <X className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Title row */}
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-light text-foreground tracking-tight">{survey.name}</h1>

              {/* Status badge with dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="flex items-center gap-1"
                >
                  <StatusBadge status={survey.status} />
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                {showStatusMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
                      <button onClick={() => updateStatus('draft')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2">
                        <Pencil className="w-3.5 h-3.5" /> Draft
                      </button>
                      <button onClick={() => updateStatus('active')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2">
                        <Play className="w-3.5 h-3.5" /> Active
                      </button>
                      <button onClick={() => updateStatus('closed')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2">
                        <Pause className="w-3.5 h-3.5" /> Closed
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Edit name */}
              <button
                type="button"
                onClick={() => setEditingHeader(true)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Edit survey name"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Delete survey"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {survey.description && (
              <p className="text-sm text-gray-500 mb-4 max-w-xl">{survey.description}</p>
            )}
          </>
        )}
      </div>

      {/* Hero metrics — large editorial numbers */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div>
            <div className="text-4xl font-light tracking-tight tabular-nums text-gray-900">{initialQuestions.length}</div>
            <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">Questions</div>
          </div>
          <div>
            <div className="text-4xl font-light tracking-tight tabular-nums text-gray-900">{responseCount}</div>
            <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">Responses</div>
          </div>
          {tokenCount > 0 && (
            <div>
              <div className="text-4xl font-light tracking-tight tabular-nums text-gray-900">{responseRate}%</div>
              <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">Response Rate</div>
            </div>
          )}
          {tokenCount > 0 && (
            <div>
              <div className="text-4xl font-light tracking-tight tabular-nums text-gray-400">{pendingCount}</div>
              <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">Pending</div>
            </div>
          )}
          <div className="self-end mb-0.5">
            <div className="text-xs text-gray-400 tabular-nums">{new Date(survey.createdAt).toLocaleDateString()}</div>
            <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-0.5">Created</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="divider-dot mb-10" />

      {/* Actions — primary elevated, secondary recessed */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        <Link
          href={`../surveys/${survey.id}/invite`}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          <Send className="w-4 h-4" /> {t('sendInvitations')}
        </Link>
        <Link
          href={`/${locale}/survey/${previewToken}`}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:text-foreground hover:border-gray-300 transition-colors"
        >
          <Eye className="w-4 h-4" /> {t('previewSurvey')}
        </Link>
        <button
          type="button"
          onClick={() => setEditingQuestions(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:text-foreground hover:border-gray-300 transition-colors"
        >
          <Pencil className="w-4 h-4" /> Edit Questions
        </button>
      </div>

      {/* Questions table */}
      {initialQuestions.length > 0 ? (
        <div>
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">
            All Questions ({initialQuestions.length})
          </h2>
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">{t('questionId')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">{t('questionEnglish')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">{t('questionBurmese')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">{t('questionType')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">{t('questionSection')}</th>
                </tr>
              </thead>
              <tbody>
                {initialQuestions.map((q, i) => (
                  <tr key={q.id} className={`${i !== initialQuestions.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 transition-colors`}>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500 tabular-nums">{q.id}</td>
                    <td className="px-4 py-3 max-w-[260px] text-foreground leading-relaxed">{q.en}</td>
                    <td className="px-4 py-3 max-w-[260px] text-foreground font-myanmar leading-relaxed">{q.my}</td>
                    <td className="px-4 py-3"><TypeBadge type={q.type} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs capitalize">{q.dimension ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-400 mb-4">No questions added yet.</p>
          <Button variant="outline" size="sm" onClick={() => setEditingQuestions(true)}>
            <Pencil className="w-4 h-4 mr-1" /> Add Questions
          </Button>
        </div>
      )}
    </div>
  );
}
