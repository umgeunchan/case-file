import { deductions } from '../data/deductions';
import { items } from '../data/items';
import { rooms } from '../data/rooms';
import { initialState, type GameState } from './game';

export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const SAVE_KEY = 'penthouse:save:v1';

/** 저장 대상: 진행 상황만. 열려 있는 팝업·패널·일회성 메시지는 저장하지 않는다 */
type SavedState = Pick<
  GameState,
  'screen' | 'introIndex' | 'room' | 'items' | 'checked' | 'deductions' | 'presented' | 'drawerOpen' | 'phoneUnlocked' | 'ending'
>;

// localStorage를 쓸 수 없을 때(차단, 용량 초과) 이번 세션 동안만 보관한다
const memory = new Map<string, string>();

function defaultStore(): KeyValueStore | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

function readRaw(store: KeyValueStore | undefined): string | null {
  const inMemory = memory.get(SAVE_KEY);
  if (inMemory !== undefined || !store) return inMemory ?? null;
  try {
    return store.getItem(SAVE_KEY);
  } catch {
    return null;
  }
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const SCREENS = ['intro', 'game', 'ending'];

function isSaved(v: unknown): v is SavedState {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    SCREENS.includes(s.screen as string) &&
    typeof s.introIndex === 'number' &&
    typeof s.room === 'string' && s.room in rooms &&
    isStringArray(s.items) && isStringArray(s.checked) && isStringArray(s.deductions) && isStringArray(s.presented) &&
    typeof s.drawerOpen === 'boolean' && typeof s.phoneUnlocked === 'boolean'
  );
}

export function saveGame(s: GameState, store = defaultStore()): void {
  if (s.screen === 'title') return;
  const saved: SavedState = {
    screen: s.screen, introIndex: s.introIndex, room: s.room, items: s.items, checked: s.checked,
    deductions: s.deductions, presented: s.presented, drawerOpen: s.drawerOpen, phoneUnlocked: s.phoneUnlocked, ending: s.ending,
  };
  const raw = JSON.stringify(saved);
  try {
    if (!store) throw new Error('no storage');
    store.setItem(SAVE_KEY, raw);
    memory.delete(SAVE_KEY);
  } catch {
    memory.set(SAVE_KEY, raw);
  }
}

export function loadGame(store = defaultStore()): GameState | null {
  try {
    const raw = readRaw(store);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isSaved(parsed)) return null;
    return {
      ...initialState,
      ...parsed,
      // 시나리오 데이터가 바뀌어 사라진 id는 버린다
      items: parsed.items.filter((id) => id in items),
      deductions: parsed.deductions.filter((id) => id in deductions),
      ending: parsed.ending ?? null,
    };
  } catch {
    return null;
  }
}

export function hasSave(store = defaultStore()): boolean {
  return loadGame(store) !== null;
}

export function clearSave(store = defaultStore()): void {
  memory.delete(SAVE_KEY);
  try {
    store?.removeItem(SAVE_KEY);
  } catch {
    // 메모리 기록은 이미 지웠다
  }
}
