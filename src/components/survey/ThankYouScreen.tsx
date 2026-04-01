'use client';

import { CheckCircle } from 'lucide-react';
import { FadeIn } from '@/components/motion/FadeIn';

export function ThankYouScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <FadeIn>
        <div className="flex flex-col items-center text-center gap-4 max-w-sm px-4">
          <CheckCircle className="w-16 h-16 text-green-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Thank You!</h1>
          <p className="text-sm text-gray-500 max-w-sm text-center">
            Your responses have been recorded anonymously. Thank you for taking
            the time to share your feedback.
          </p>
          <p className="text-xs text-gray-400">You may now close this page.</p>
        </div>
      </FadeIn>
    </div>
  );
}
