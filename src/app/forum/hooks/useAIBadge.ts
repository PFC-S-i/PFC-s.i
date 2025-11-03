'use client';

import { useEffect, useState } from 'react';

export type AILabel = 'crypto' | 'offtopic' | 'uncertain';
const EVENT_NAME = 'event-ai-updated';

function simpleHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i), h |= 0;
  return Math.abs(h).toString(36);
}

function readLabelFromLocalStorage(keys: string[]): AILabel | null {
  try {
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const o = JSON.parse(raw) as { label?: AILabel };
      if (o?.label === 'crypto' || o?.label === 'offtopic' || o?.label === 'uncertain') {
        return o.label;
      }
    }
  } catch {}
  return null;
}

export function makeAiKeyFromData(id: string | null, title: string, description?: string) {
  return `event_ai_${id ?? simpleHash(`${title}::${description ?? ''}`)}`;
}

/**
 * Lê o rótulo salvo no localStorage (pela key com id ou pela key hash) e
 * atualiza em tempo real quando o modal emitir "event-ai-updated".
 */
export function useAIBadge(params: {
  id?: string | null;
  title: string;
  description?: string;
  initial?: AILabel | null; // se o back passar algo no futuro
}) {
  const { id = null, title, description = '', initial = null } = params;
  const [label, setLabel] = useState<AILabel | null>(initial);

  useEffect(() => {
    // chaves possíveis: por id (preferência) e por hash (fallback)
    const keyById = `event_ai_${id ?? ''}`;
    const keyByHash = `event_ai_${simpleHash(`${title}::${description}`)}`;
    const keys = id ? [keyById, keyByHash] : [keyByHash];

    // 1) tenta ler imediatamente do localStorage
    const found = readLabelFromLocalStorage(keys);
    if (found) setLabel(found);

    // 2) escuta atualizações do modal
    const onUpd = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      const key = String(d?.key || '');
      if (keys.includes(key) && d?.ai?.label) {
        const v = d.ai.label as AILabel;
        if (v === 'crypto' || v === 'offtopic' || v === 'uncertain') {
          setLabel(v);
        }
      }
    };
    window.addEventListener(EVENT_NAME, onUpd as any);
    return () => window.removeEventListener(EVENT_NAME, onUpd as any);
  }, [id, title, description]);

  return label;
}
