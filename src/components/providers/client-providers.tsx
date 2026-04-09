"use client";
import { SessionProvider } from "@/components/session-provider";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AnalyticsProvider>
        <ToastProvider>{children}</ToastProvider>
      </AnalyticsProvider>
    </SessionProvider>
  );
}
