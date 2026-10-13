import type { Progress } from '../types';

export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const key = (caseId: string) => `case-file:progress:${caseId}`;

function defaultStore(): KeyValueStore | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

function isProgress(v: unknown): v is Progress {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.caseId === 'string' &&
    typeof p.startedAt === 'number' &&
    isStringArray(p.inspectedItems) &&
    isStringArray(p.askedDialogues) &&
    isStringArray(p.clues) &&
    typeof p.memo === 'string'
  );
}

export function loadProgress(caseId: string, store = defaultStore()): Progress | null {
  try {
    const raw = store?.getItem(key(caseId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isProgress(parsed) && parsed.caseId === caseId ? parsed : null;
  } catch {
    return null;
  }
}

export function saveProgress(p: Progress, store = defaultStore()): void {
  try {
    store?.setItem(key(p.caseId), JSON.stringify(p));
  } catch {
    // 저장이 막힌 환경에서는 메모리 상태로만 진행한다.
  }
}

export function clearProgress(caseId: string, store = defaultStore()): void {
  try {
    store?.removeItem(key(caseId));
  } catch {
    // 위와 같음
  }
}
