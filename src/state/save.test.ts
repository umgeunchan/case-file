import { describe, expect, it } from 'vitest';
import { gameReducer, initialState, type GameState } from './game';
import { clearSave, hasSave, loadGame, saveGame, SAVE_KEY, type KeyValueStore } from './save';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwing: KeyValueStore = {
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('blocked'); },
  removeItem: () => { throw new Error('blocked'); },
};

const progressed: GameState = {
  ...initialState,
  screen: 'game',
  room: 'living',
  items: ['earring', 'drawer_key'],
  checked: ['earring', 'sugar_jar'],
  deductions: ['d_time'],
  presented: ['sera:earring'],
  drawerOpen: true,
  phoneUnlocked: true,
  panel: 'notebook',
  overlay: 'earring',
  dialog: { text: 'x', seq: 3 },
  seq: 3,
};

describe('저장/불러오기', () => {
  it('진행 상황을 저장하고 그대로 불러온다', () => {
    const store = memoryStore();
    saveGame(progressed, store);
    const loaded = loadGame(store)!;
    expect(loaded).toMatchObject({
      screen: 'game', room: 'living', items: ['earring', 'drawer_key'], checked: ['earring', 'sugar_jar'],
      deductions: ['d_time'], presented: ['sera:earring'], drawerOpen: true, phoneUnlocked: true,
    });
  });
  it('열려 있던 팝업·패널·일회성 메시지는 저장하지 않는다', () => {
    const store = memoryStore();
    saveGame(progressed, store);
    const loaded = loadGame(store)!;
    expect(loaded.panel).toBeNull();
    expect(loaded.overlay).toBeNull();
    expect(loaded.dialog).toBeNull();
  });
  it('타이틀 화면 상태는 저장하지 않는다', () => {
    const store = memoryStore();
    saveGame(initialState, store);
    expect(hasSave(store)).toBe(false);
  });
  it('손상되었거나 형식이 다른 저장은 무시한다', () => {
    const store = memoryStore();
    store.setItem(SAVE_KEY, '{broken');
    expect(loadGame(store)).toBeNull();
    store.setItem(SAVE_KEY, JSON.stringify({ screen: 'game', items: 'earring' }));
    expect(loadGame(store)).toBeNull();
  });
  it('데이터에서 사라진 id는 버리고 불러온다', () => {
    const store = memoryStore();
    saveGame({ ...progressed, items: ['earring', 'gone_item'], deductions: ['d_gone', 'd_time'] }, store);
    const loaded = loadGame(store)!;
    expect(loaded.items).toEqual(['earring']);
    expect(loaded.deductions).toEqual(['d_time']);
  });
  it('저장을 지운다', () => {
    const store = memoryStore();
    saveGame(progressed, store);
    clearSave(store);
    expect(loadGame(store)).toBeNull();
  });
  it('저장소가 막혀도 예외 없이 동작하고, 같은 세션에서는 메모리로 이어진다', () => {
    expect(loadGame(throwing)).toBeNull();
    expect(() => saveGame(progressed, throwing)).not.toThrow();
    expect(loadGame(throwing)?.items).toEqual(['earring', 'drawer_key']);
    expect(() => clearSave(throwing)).not.toThrow();
    expect(hasSave(throwing)).toBe(false);
  });
  it('LOAD 액션은 불러온 상태로 이어서 시작한다', () => {
    const store = memoryStore();
    saveGame(progressed, store);
    const s = gameReducer(initialState, { type: 'LOAD', state: loadGame(store)! });
    expect(s.screen).toBe('game');
    expect(s.items).toEqual(['earring', 'drawer_key']);
  });
});
