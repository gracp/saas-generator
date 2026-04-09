'use client';
import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
    return () => {
      // cleanup if needed
    };
  }, []);

  return <>{children}</>;
}
