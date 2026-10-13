import { items } from '../data/items';
import { rooms } from '../data/rooms';
import { scenario } from '../data/scenario';
import type { RoomId } from '../data/types';

export type Screen = 'title' | 'intro' | 'game' | 'ending';
export type Panel = 'phone' | 'notebook' | 'interrogation' | 'accusation';

/** 같은 문구가 다시 나와도 화면이 새로 그려지도록 seq를 붙인다 */
export interface Notice {
  text: string;
  seq: number;
}

export interface GameState {
  screen: Screen;
  introIndex: number;
  room: RoomId;
  /** 획득한 아이템 (증거 + 열쇠) */
  items: string[];
  /** 한 번이라도 터치한 핫스팟 */
  checked: string[];
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
  | { type: 'CLOSE_PANEL' };

export const initialState: GameState = {
  screen: 'title',
  introIndex: 0,
  room: 'study',
  items: [],
  checked: [],
  panel: null,
  overlay: null,
  dialog: null,
  seq: 0,
};

const addAll = (list: string[], add: string[]) => [...list, ...add.filter((id) => !list.includes(id))];

function say(s: GameState, text: string): GameState {
  return { ...s, dialog: { text, seq: s.seq + 1 }, seq: s.seq + 1 };
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
      if (item.view === 'dialog') return say(next, item.text);
      return { ...next, overlay: item.id };
    }
    case 'give':
      if (next.items.includes(action.item)) return say(next, action.emptyText);
      return say({ ...next, items: [...next.items, action.item] }, action.text);
    default:
      return next;
  }
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
      return { ...s, panel: a.panel, overlay: null };
    case 'CLOSE_PANEL':
      return { ...s, panel: null };
  }
}
