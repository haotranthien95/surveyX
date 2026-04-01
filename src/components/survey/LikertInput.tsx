'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const LIKERT_OPTIONS = [
  { value: '1', en: 'Strongly Disagree', my: 'လုံးဝမသဘောတူပါ' },
  { value: '2', en: 'Disagree', my: 'မသဘောတူပါ' },
  { value: '3', en: 'Neutral', my: 'ကြားနေ' },
  { value: '4', en: 'Agree', my: 'သဘောတူပါသည်' },
  { value: '5', en: 'Strongly Agree', my: 'လုံးဝသဘောတူပါသည်' },
];

interface LikertInputProps {
  questionId: string;
  questionText: string;
  questionNumber: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  displayLocale: 'en' | 'my';
}

export function LikertInput({
  questionId,
  questionText,
  questionNumber,
  value,
  onChange,
  error,
  displayLocale,
}: LikertInputProps) {
  return (
    <div
      className={
        error
          ? 'rounded-xl border-2 border-red-400 bg-red-50 p-4'
          : 'rounded-xl p-4'
      }
    >
      <p
        id={`q-${questionId}`}
        style={displayLocale === 'my' ? { lineHeight: '1.75' } : undefined}
        className="text-sm text-gray-800 mb-3"
      >
        <span className="text-xs text-gray-400 font-mono mr-2">{questionNumber}.</span>
        {questionText}
      </p>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        aria-labelledby={`q-${questionId}`}
        role="radiogroup"
        aria-invalid={error ? 'true' : 'false'}
        className="flex flex-col sm:flex-row gap-2"
      >
        {LIKERT_OPTIONS.map(option => {
          const label = displayLocale === 'my' ? option.my : option.en;
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={`flex items-center gap-2 cursor-pointer rounded-lg border px-3 min-h-[48px] sm:min-h-[44px] sm:min-w-[44px] sm:flex-col sm:justify-center sm:text-center transition-colors ${
                isSelected
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <RadioGroupItem value={option.value} aria-label={label} />
              <span className="text-xs text-gray-700">{label}</span>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
