import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
      {children}
    </div>
  );
}
