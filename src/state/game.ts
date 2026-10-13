import { combineDuplicateText, combineFailText, deductionList } from '../data/deductions';
import { dialogues, fallbackLine } from '../data/dialogues';
import { insufficientText } from '../data/endings';
import { items } from '../data/items';
import { drawerLock, phoneLock } from '../data/locks';
import { rooms } from '../data/rooms';
import { scenario } from '../data/scenario';
import type { Line, RoomId, SuspectId } from '../data/types';
import { judge } from './judge';

export type Screen = 'title' | 'intro' | 'game' | 'ending';
export type Panel = 'phone' | 'notebook' | 'interrogation' | 'accusation';

/** 같은 문구가 다시 나와도 화면이 새로 그려지도록 seq를 붙인다 */
export interface Notice {
  text: string;
  seq: number;
  /** 대화창 위쪽에 보이는 제목 (조사한 물건 이름) */
  title?: string;
}

export interface GameState {
  screen: Screen;
  introIndex: number;
  room: RoomId;
  /** 획득한 아이템 (증거 + 열쇠) */
  items: string[];
  /** 한 번이라도 터치한 핫스팟 */
  checked: string[];
  /** 추리 노트에 기록된 추리 결과 */
  deductions: string[];
  notebookResult: (Notice & { success: boolean }) | null;
  /** 제시 기록. "용의자:증거" 형식 */
  presented: string[];
  interrogation: { suspect: SuspectId; line: Line; seq: number } | null;
  drawerOpen: boolean;
  phoneUnlocked: boolean;
  /** 휴대폰 오답 메시지. shake면 화면을 흔든다 */
  phoneError: (Notice & { shake: boolean }) | null;
  accuseNotice: Notice | null;
  ending: { kind: 'good' } | { kind: 'bad'; suspect: SuspectId } | null;
  panel: Panel | null;
  /** 팝업/확대 화면으로 보고 있는 아이템 */
  overlay: string | null;
  dialog: Notice | null;
  seq: number;
}

export type GameAction =
  | { type: 'NEW_GAME' }
  | { type: 'NEXT_INTRO' }
  | { type: 'SKIP_INTRO' }
  | { type: 'GO_ROOM'; room: RoomId }
  | { type: 'TOUCH'; hotspot: string }
  | { type: 'VIEW_ITEM'; item: string }
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'OPEN_PANEL'; panel: Panel }
  | { type: 'CLOSE_PANEL' }
  | { type: 'SUBMIT_PIN'; pin: string }
  | { type: 'COMBINE'; a: string; b: string }
  | { type: 'SELECT_SUSPECT'; suspect: SuspectId }
  | { type: 'PRESENT'; evidence: string }
  | { type: 'ACCUSE'; suspect: SuspectId; evidence: string[] }
  | { type: 'RETRY_ACCUSATION' }
  | { type: 'TO_TITLE' }
  | { type: 'LOAD'; state: GameState };

export const initialState: GameState = {
  screen: 'title',
  introIndex: 0,
  room: 'study',
  items: [],
  checked: [],
  deductions: [],
  notebookResult: null,
  presented: [],
  interrogation: null,
  drawerOpen: false,
  phoneUnlocked: false,
  phoneError: null,
  accuseNotice: null,
  ending: null,
  panel: null,
  overlay: null,
  dialog: null,
  seq: 0,
};

const addAll = (list: string[], add: string[]) => [...list, ...add.filter((id) => !list.includes(id))];

function say(s: GameState, text: string, title?: string): GameState {
  return { ...s, dialog: { text, title, seq: s.seq + 1 }, seq: s.seq + 1 };
}

function touch(s: GameState, hotspotId: string): GameState {
  const hotspot = rooms[s.room].hotspots.find((h) => h.id === hotspotId);
  if (!hotspot) return s;
  const next: GameState = { ...s, checked: addAll(s.checked, [hotspot.id]) };
  const action = hotspot.action;

  switch (action.type) {
    case 'item': {
      const item = items[action.item];
      if (item.evidence) return { ...next, items: addAll(next.items, [item.id]), overlay: item.id };
      if (item.view === 'dialog') return say(next, item.text, item.name);
      return { ...next, overlay: item.id };
    }
    case 'give':
      if (next.items.includes(action.item)) return say(next, action.emptyText, hotspot.label);
      return say({ ...next, items: [...next.items, action.item] }, action.text, hotspot.label);
    case 'drawer':
      if (next.drawerOpen) return say(next, drawerLock.emptyText, hotspot.label);
      if (!next.items.includes(drawerLock.requiresItem)) return say(next, drawerLock.lockedText, hotspot.label);
      return say({ ...next, drawerOpen: true, items: addAll(next.items, drawerLock.rewards) }, drawerLock.openText, hotspot.label);
    case 'phone':
      return { ...next, panel: 'phone', phoneError: null };
  }
}

function submitPin(s: GameState, pin: string): GameState {
  if (s.phoneUnlocked) return s;
  if (pin === phoneLock.pin) {
    return { ...s, phoneUnlocked: true, phoneError: null, items: addAll(s.items, phoneLock.rewards) };
  }
  const hint = phoneLock.hints.find((h) => h.input === pin);
  const seq = s.seq + 1;
  return { ...s, seq, phoneError: { text: hint ? hint.text : phoneLock.wrongText, shake: !hint, seq } };
}

/** 추리·심문·지목에 쓸 수 있는 것: 획득한 증거 + 기록된 추리 결과 */
export function usableEvidence(s: GameState): string[] {
  return [...s.items.filter((id) => items[id]?.evidence), ...s.deductions];
}

function combine(s: GameState, a: string, b: string): GameState {
  const usable = usableEvidence(s);
  if (a === b || !usable.includes(a) || !usable.includes(b)) return note(s, combineFailText, false);
  const found = deductionList.find((d) => d.inputs.includes(a) && d.inputs.includes(b));
  if (!found) return note(s, combineFailText, false);
  if (s.deductions.includes(found.id)) return note(s, combineDuplicateText, false);
  return note({ ...s, deductions: [...s.deductions, found.id] }, found.text, true);
}

function note(s: GameState, text: string, success: boolean): GameState {
  const seq = s.seq + 1;
  return { ...s, seq, notebookResult: { text, success, seq } };
}

export function reactionFor(suspect: SuspectId, evidence: string, presented: string[]): Line {
  const shown = (id: string) => presented.includes(`${suspect}:${id}`);
  const match = dialogues[suspect].reactions.find(
    (r) => r.evidence === evidence && (r.after ?? []).every(shown),
  );
  return match ? { expr: match.expr, text: match.text } : fallbackLine;
}

function speak(s: GameState, suspect: SuspectId, line: Line): GameState {
  const seq = s.seq + 1;
  return { ...s, seq, interrogation: { suspect, line, seq } };
}

function present(s: GameState, evidence: string): GameState {
  if (!s.interrogation || !usableEvidence(s).includes(evidence)) return s;
  const { suspect } = s.interrogation;
  const line = reactionFor(suspect, evidence, s.presented);
  const key = `${suspect}:${evidence}`;
  const presented = s.presented.includes(key) ? s.presented : [...s.presented, key];
  return speak({ ...s, presented }, suspect, line);
}

function accuse(s: GameState, suspect: SuspectId, evidence: string[]): GameState {
  if (!s.phoneUnlocked) return s;
  const usable = usableEvidence(s);
  if (!evidence.every((id) => usable.includes(id))) return s;
  const verdict = judge(suspect, evidence);
  if (verdict === 'insufficient') {
    const seq = s.seq + 1;
    return { ...s, seq, accuseNotice: { text: insufficientText, seq } };
  }
  const ending = verdict === 'correct' ? ({ kind: 'good' } as const) : ({ kind: 'bad', suspect } as const);
  return { ...s, screen: 'ending', panel: null, accuseNotice: null, ending };
}

export function gameReducer(s: GameState, a: GameAction): GameState {
  switch (a.type) {
    case 'NEW_GAME':
      return { ...initialState, screen: 'intro' };
    case 'NEXT_INTRO':
      if (s.introIndex + 1 < scenario.intro.length) return { ...s, introIndex: s.introIndex + 1 };
      return { ...s, screen: 'game' };
    case 'SKIP_INTRO':
      return { ...s, screen: 'game' };
    case 'GO_ROOM':
      return { ...s, room: a.room, dialog: null };
    case 'TOUCH':
      return touch(s, a.hotspot);
    case 'VIEW_ITEM':
      return s.items.includes(a.item) ? { ...s, overlay: a.item } : s;
    case 'CLOSE_OVERLAY':
      return { ...s, overlay: null };
    case 'CLOSE_DIALOG':
      return { ...s, dialog: null };
    case 'OPEN_PANEL':
      if (a.panel === 'accusation' && !s.phoneUnlocked) return s;
      return { ...s, panel: a.panel, overlay: null, accuseNotice: null };
    case 'CLOSE_PANEL':
      return { ...s, panel: null };
    case 'SUBMIT_PIN':
      return submitPin(s, a.pin);
    case 'COMBINE':
      return combine(s, a.a, a.b);
    case 'SELECT_SUSPECT':
      return speak(s, a.suspect, dialogues[a.suspect].base);
    case 'PRESENT':
      return present(s, a.evidence);
    case 'ACCUSE':
      return accuse(s, a.suspect, a.evidence);
    case 'RETRY_ACCUSATION':
      return { ...s, screen: 'game', panel: 'accusation', ending: null };
    case 'LOAD':
      return a.state;
    case 'TO_TITLE':
      return { ...s, screen: 'title', panel: null, overlay: null };
  }
}
