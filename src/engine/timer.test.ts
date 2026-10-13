import { describe, expect, it } from 'vitest';
import { miniCase } from './__fixtures__/miniCase';
import { newProgress } from './investigation';
import { formatTime, remainingSeconds, shouldWarn } from './timer';

describe('remainingSeconds', () => {
  const p = newProgress('mini', 0);
  it('경과 시간만큼 줄어든다', () => {
    expect(remainingSeconds(miniCase, p, 60_000)).toBe(1740);
  });
  it('0 아래로 내려가지 않는다', () => {
    expect(remainingSeconds(miniCase, p, 99 * 60_000)).toBe(0);
  });
  it('종료 시각이 있으면 그 시점에 멈춘다', () => {
    expect(remainingSeconds(miniCase, { ...p, finishedAt: 120_000 }, 999_000)).toBe(1680);
  });
});

describe('shouldWarn', () => {
  it('10분 이하로 남으면 경고', () => {
    expect(shouldWarn(miniCase, 601)).toBe(false);
    expect(shouldWarn(miniCase, 600)).toBe(true);
    expect(shouldWarn(miniCase, 0)).toBe(false);
  });
  it('제한 시간이 10분 이하인 사건은 경고 없음', () => {
    expect(shouldWarn({ ...miniCase, timeLimitMinutes: 10 }, 300)).toBe(false);
  });
});

describe('formatTime', () => {
  it('mm:ss', () => {
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(5999)).toBe('99:59');
  });
});
