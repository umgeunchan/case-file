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
  it('저장소가 없어도(Node 환경) 예외를 던지지 않는다', () => {
    expect(loadProgress('mini')).toBeNull();
    expect(() => saveProgress(newProgress('mini', 0))).not.toThrow();
  });
});
