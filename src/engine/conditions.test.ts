import { describe, expect, it } from 'vitest';
import { isUnlocked } from './conditions';

describe('isUnlocked', () => {
  it('조건이 없으면 열려 있다', () => {
    expect(isUnlocked(undefined, [])).toBe(true);
    expect(isUnlocked([], [])).toBe(true);
  });
  it('필요한 단서를 모두 가져야 열린다', () => {
    expect(isUnlocked(['C1', 'C2'], ['C1'])).toBe(false);
    expect(isUnlocked(['C1', 'C2'], ['C2', 'C1', 'C3'])).toBe(true);
  });
});
