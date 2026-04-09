'use client';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { SessionProvider } from '@/components/session-provider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AnalyticsProvider>
        <ToastProvider>{children}</ToastProvider>
      </AnalyticsProvider>
    </SessionProvider>
  );
}
