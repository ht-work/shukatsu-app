"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useShukatsuStore } from "@/hooks/use-shukatsu-store";

export function HydrationGate({ children }: { children: ReactNode }) {
  const { hydrated } = useShukatsuStore();

  if (!hydrated) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
        読み込み中
      </div>
    );
  }

  return children;
}
