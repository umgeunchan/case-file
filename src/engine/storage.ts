import type { Progress } from '../types';

export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const key = (caseId: string) => `case-file:progress:${caseId}`;

// localStorage를 쓸 수 없는 환경(차단, 용량 초과 등)에서 이번 세션 동안 진행 상태를 보관한다.
const memory = new Map<string, string>();

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

// 메모리 기록은 저장소 쓰기가 실패했을 때만 남으므로, 있으면 그것이 최신이다.
function readRaw(k: string, store: KeyValueStore | undefined): string | null {
  const inMemory = memory.get(k);
  if (inMemory !== undefined || !store) return inMemory ?? null;
  try {
    return store.getItem(k);
  } catch {
    return null;
  }
}

export function loadProgress(caseId: string, store = defaultStore()): Progress | null {
  try {
    const raw = readRaw(key(caseId), store);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isProgress(parsed) && parsed.caseId === caseId ? parsed : null;
  } catch {
    return null;
  }
}

export function saveProgress(p: Progress, store = defaultStore()): void {
  const k = key(p.caseId);
  const raw = JSON.stringify(p);
  try {
    if (!store) throw new Error('no storage');
    store.setItem(k, raw);
    memory.delete(k);
  } catch {
    memory.set(k, raw);
  }
}

export function clearProgress(caseId: string, store = defaultStore()): void {
  memory.delete(key(caseId));
  try {
    store?.removeItem(key(caseId));
  } catch {
    // 메모리 기록은 이미 지웠다.
  }
}
