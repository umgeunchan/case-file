import { describe, expect, it } from 'vitest';
import type { Progress } from '../types';
import { miniCase } from './__fixtures__/miniCase';
import { gradeFor, score } from './scoring';

const base: Progress = {
  caseId: 'mini', startedAt: 0, inspectedItems: [], askedDialogues: [], clues: [], memo: '',
};

describe('gradeFor', () => {
  it('경계값', () => {
    expect(gradeFor(100)).toBe('S');
    expect(gradeFor(90)).toBe('S');
    expect(gradeFor(89)).toBe('A');
    expect(gradeFor(75)).toBe('A');
    expect(gradeFor(74)).toBe('B');
    expect(gradeFor(50)).toBe('B');
    expect(gradeFor(49)).toBe('C');
  });
});

describe('score', () => {
  it('보고서가 없으면 null', () => {
    expect(score(miniCase, base)).toBeNull();
  });
  it('모두 맞히고 핵심 단서를 모두 찾으면 100점 S', () => {
    const r = score(miniCase, { ...base, clues: ['C1', 'C2'], report: { culpritId: 'S1', motive: 1, method: 0 } })!;
    expect(r.total).toBe(100);
    expect(r.grade).toBe('S');
    expect(r.missedKeyClues).toBe(0);
  });
  it('핵심 단서 일부만 찾으면 비율만큼 점수 (반올림)', () => {
    const r = score(miniCase, { ...base, clues: ['C1', 'C3'], report: { culpritId: 'S1', motive: 1, method: 0 } })!;
    expect(r.keyCluesFound).toBe(1);
    expect(r.keyCluesTotal).toBe(2);
    expect(r.missedKeyClues).toBe(1);
    expect(r.total).toBe(95);
  });
  it('범인을 틀리면 다른 점수와 무관하게 C', () => {
    const r = score(miniCase, { ...base, clues: ['C1', 'C2'], report: { culpritId: 'S2', motive: 1, method: 0 } })!;
    expect(r.culpritCorrect).toBe(false);
    expect(r.total).toBe(50);
    expect(r.grade).toBe('C');
  });
  it('동기·수법 오답은 감점', () => {
    const r = score(miniCase, { ...base, clues: ['C1', 'C2'], report: { culpritId: 'S1', motive: 0, method: 1 } })!;
    expect(r.motiveCorrect).toBe(false);
    expect(r.methodCorrect).toBe(false);
    expect(r.total).toBe(60);
    expect(r.grade).toBe('B');
  });
  it('핵심 단서가 없는 사건은 단서 점수 만점', () => {
    const noKey = { ...miniCase, clues: miniCase.clues.map((c) => ({ ...c, isKey: false })) };
    const r = score(noKey, { ...base, report: { culpritId: 'S1', motive: 1, method: 0 } })!;
    expect(r.keyCluesTotal).toBe(0);
    expect(r.total).toBe(100);
  });
});
