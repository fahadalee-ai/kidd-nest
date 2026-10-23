import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center">
      <div className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background sm:my-4 sm:h-[min(844px,calc(100dvh-32px))] sm:rounded-[36px] sm:shadow-[0_20px_60px_rgba(31,42,68,0.18)]">
        {children}
      </div>
    </div>
  );
}
