// src/app/forum/hooks/useAIBadge.ts
"use client";

import { useEffect, useState } from "react";

export type AILabel = "crypto" | "offtopic" | "uncertain";

const EVENT_NAME = "event-ai-updated";

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0; // força para 32 bits
  }
  return Math.abs(h).toString(36);
}

function readLabelFromLocalStorage(keys: string[]): AILabel | null {
  try {
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const o = JSON.parse(raw) as { label?: AILabel };
      if (
        o?.label === "crypto" ||
        o?.label === "offtopic" ||
        o?.label === "uncertain"
      ) {
        return o.label;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function makeAiKeyFromData(
  id: string | null,
  title: string,
  description?: string
): string {
  return `event_ai_${id ?? simpleHash(`${title}::${description ?? ""}`)}`;
}

// payload que o modal dispara:
type AiUpdatedDetail = {
  id?: string | null;
  key?: string;
  ai?: {
    label?: AILabel;
    misinfo_risk?:
      | "ok_informative"
      | "satire_or_obvious_fake"
      | "dubious_or_conspiratorial"
      | "scam_or_financial_fraud"
      | "not_about_crypto";
    decision?: "allow" | "warn" | "block";
    ui_label?: string;
  };
};

/**
 * Lê o rótulo salvo no localStorage (pela key com id ou pela key hash) e
 * atualiza em tempo real quando o modal emitir "event-ai-updated".
 */
export function useAIBadge(params: {
  id?: string | null;
  title: string;
  description?: string;
  initial?: AILabel | null;
}) {
  const { id = null, title, description = "", initial = null } = params;
  const [label, setLabel] = useState<AILabel | null>(initial);

  useEffect(() => {
    const keyById = `event_ai_${id ?? ""}`;
    const keyByHash = `event_ai_${simpleHash(`${title}::${description}`)}`;
    const keys = id ? [keyById, keyByHash] : [keyByHash];

    // 1) tenta ler imediatamente
    const found = readLabelFromLocalStorage(keys);
    if (found) setLabel(found);

    // 2) escuta atualizações
    const onUpdate = (e: Event) => {
      const ce = e as CustomEvent<AiUpdatedDetail>;
      const detail = ce.detail;
      if (!detail) return;

      const eventKey = String(detail.key ?? "");
      if (!keys.includes(eventKey)) return;

      const eventLabel = detail.ai?.label;
      if (
        eventLabel === "crypto" ||
        eventLabel === "offtopic" ||
        eventLabel === "uncertain"
      ) {
        setLabel(eventLabel);
      }
    };

    window.addEventListener(EVENT_NAME, onUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, onUpdate);
    };
  }, [id, title, description]);

  return label;
}
