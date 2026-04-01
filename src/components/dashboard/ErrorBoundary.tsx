'use client';

import { Component, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground bg-muted/30 rounded-lg" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Unable to render this chart. Data may be unavailable.</span>
        </div>
      );
    }
    return this.props.children;
  }
}
