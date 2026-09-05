"use client";

import { useState, useCallback } from "react";

export function useCopyToClipboard(resetDelay = 2000) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: false }));
    }, resetDelay);
  }, [resetDelay]);

  return { copiedStates, handleCopy };
}
