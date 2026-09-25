"use client";

import { useState, useCallback } from "react";

export function useCopyToClipboard(resetDelay = 2000) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopy = useCallback(async (arg1: string, arg2?: string) => {
    // Si viene (id, text) o (text, id), detectamos automáticamente
    let textToCopy = arg1;
    let stateId = arg2 || "default";

    // Si arg2 contiene saltos de línea o es mucho más largo, arg1 es el ID y arg2 es el texto
    if (arg2 !== undefined) {
      if (arg2.includes("\n") || arg2.length > arg1.length || arg1.startsWith("all_") || arg1.startsWith("img_") || arg1.startsWith("anim_") || arg1 === "script" || arg1 === "narration") {
        stateId = arg1;
        textToCopy = arg2;
      } else {
        stateId = arg2;
        textToCopy = arg1;
      }
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch {
      // Fallback para navegadores antiguos o contextos no seguros
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (e) {
        console.error("Fallback copy failed:", e);
      }
    }

    setCopiedStates((prev) => ({ ...prev, [stateId]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [stateId]: false }));
    }, resetDelay);
  }, [resetDelay]);

  return { copiedStates, handleCopy };
}
