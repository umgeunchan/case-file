import { describe, expect, it } from 'vitest';
import { newProgress } from './investigation';
import { clearProgress, loadProgress, saveProgress, type KeyValueStore } from './storage';

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

describe('storage', () => {
  it('저장하고 다시 불러온다', () => {
    const store = memoryStore();
    const p = { ...newProgress('mini', 5), memo: '메모' };
    saveProgress(p, store);
    expect(store.data.has('case-file:progress:mini')).toBe(true);
    expect(loadProgress('mini', store)).toEqual(p);
  });
  it('기록이 없으면 null', () => {
    expect(loadProgress('mini', memoryStore())).toBeNull();
  });
  it('손상된 JSON이면 null', () => {
    const store = memoryStore();
    store.setItem('case-file:progress:mini', '{not json');
    expect(loadProgress('mini', store)).toBeNull();
  });
  it('형식이 다르면 null', () => {
    const store = memoryStore();
    store.setItem('case-file:progress:mini', JSON.stringify({ caseId: 'mini', clues: 'x' }));
    expect(loadProgress('mini', store)).toBeNull();
  });
  it('다른 사건의 기록이면 null', () => {
    const store = memoryStore();
    store.setItem('case-file:progress:mini', JSON.stringify(newProgress('other', 0)));
    expect(loadProgress('mini', store)).toBeNull();
  });
  it('삭제한다', () => {
    const store = memoryStore();
    saveProgress(newProgress('mini', 0), store);
    clearProgress('mini', store);
    expect(loadProgress('mini', store)).toBeNull();
  });
  it('저장소 접근이 막혀도 예외를 던지지 않는다', () => {
    expect(loadProgress('mini', throwing)).toBeNull();
    expect(() => saveProgress(newProgress('mini', 0), throwing)).not.toThrow();
    expect(() => clearProgress('mini', throwing)).not.toThrow();
  });
  it('저장소 접근이 막히면 메모리에 보관해 같은 세션에서 이어진다', () => {
    const p = newProgress('blocked', 7);
    saveProgress(p, throwing);
    expect(loadProgress('blocked', throwing)).toEqual(p);
    clearProgress('blocked', throwing);
    expect(loadProgress('blocked', throwing)).toBeNull();
  });
  it('쓰기만 실패하는 저장소(용량 초과)에서도 메모리로 이어진다', () => {
    const store = { ...memoryStore(), setItem: () => { throw new Error('quota'); } };
    const p = newProgress('quota', 9);
    saveProgress(p, store);
    expect(loadProgress('quota', store)).toEqual(p);
  });
  it('저장소가 없는(Node) 환경에서도 메모리로 이어진다', () => {
    expect(loadProgress('nostore')).toBeNull();
    const p = newProgress('nostore', 3);
    saveProgress(p);
    expect(loadProgress('nostore')).toEqual(p);
  });
});
