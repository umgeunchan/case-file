import { describe, expect, it } from 'vitest';
import { miniCase } from './__fixtures__/miniCase';
import {
  askDialogue, clueSource, findClue, getAvailableDialogues, inspectItem,
  isLocationExhausted, newProgress, sanitizeProgress,
} from './investigation';

const item = (id: string) => miniCase.items.find((i) => i.id === id)!;
const dialogue = (id: string) => miniCase.dialogues.find((d) => d.id === id)!;

describe('newProgress', () => {
  it('빈 진행 상태를 만든다', () => {
    expect(newProgress('mini', 1000)).toEqual({
      caseId: 'mini', startedAt: 1000, inspectedItems: [], askedDialogues: [], clues: [], memo: '',
    });
  });
});

describe('inspectItem', () => {
  it('아이템을 조사하면 단서를 얻는다', () => {
    const p = inspectItem(newProgress('mini', 0), item('I1'));
    expect(p.inspectedItems).toEqual(['I1']);
    expect(p.clues).toEqual(['C1']);
  });
  it('잠긴 아이템은 조사할 수 없다', () => {
    const p0 = newProgress('mini', 0);
    expect(inspectItem(p0, item('I2'))).toBe(p0);
  });
  it('이미 가진 단서는 중복으로 추가하지 않는다', () => {
    let p = inspectItem(newProgress('mini', 0), item('I1'));
    p = inspectItem(p, item('I2'));
    expect(p.clues).toEqual(['C1', 'C2']);
  });
  it('같은 아이템을 두 번 조사해도 변하지 않는다', () => {
    const p1 = inspectItem(newProgress('mini', 0), item('I1'));
    expect(inspectItem(p1, item('I1'))).toBe(p1);
  });
});

describe('dialogues', () => {
  it('조건 없는 질문만 처음에 열려 있다', () => {
    const ids = getAvailableDialogues(miniCase, newProgress('mini', 0), 'S1').map((d) => d.id);
    expect(ids).toEqual(['D1']);
  });
  it('단서를 얻으면 새 질문이 열리고, 이미 한 질문은 사라진다', () => {
    let p = inspectItem(newProgress('mini', 0), item('I1'));
    p = inspectItem(p, item('I2'));
    p = askDialogue(p, dialogue('D1'));
    expect(p.askedDialogues).toEqual(['D1']);
    expect(p.clues).toContain('C3');
    expect(getAvailableDialogues(miniCase, p, 'S1').map((d) => d.id)).toEqual(['D2']);
  });
  it('잠긴 질문은 할 수 없다', () => {
    const p0 = newProgress('mini', 0);
    expect(askDialogue(p0, dialogue('D2'))).toBe(p0);
  });
});

describe('isLocationExhausted', () => {
  it('장소의 모든 아이템을 조사하면 true', () => {
    let p = inspectItem(newProgress('mini', 0), item('I1'));
    expect(isLocationExhausted(miniCase, p, 'L1')).toBe(false);
    p = inspectItem(p, item('I2'));
    expect(isLocationExhausted(miniCase, p, 'L1')).toBe(true);
  });
});

describe('sanitizeProgress', () => {
  it('사건에 없는 id를 제거한다', () => {
    const p = {
      ...newProgress('mini', 0),
      inspectedItems: ['I1', 'GONE'],
      askedDialogues: ['D9', 'D1'],
      clues: ['C1', 'CX'],
    };
    const s = sanitizeProgress(miniCase, p);
    expect(s.inspectedItems).toEqual(['I1']);
    expect(s.askedDialogues).toEqual(['D1']);
    expect(s.clues).toEqual(['C1']);
  });
});

describe('findClue / clueSource', () => {
  it('단서와 출처를 찾는다', () => {
    let p = inspectItem(newProgress('mini', 0), item('I1'));
    p = askDialogue(p, dialogue('D1'));
    expect(findClue(miniCase, 'C1')?.text).toBe('칼의 흔적');
    expect(clueSource(miniCase, p, 'C1')).toBe('거실 · 칼');
    expect(clueSource(miniCase, p, 'C3')).toBe('가 심문');
    expect(clueSource(miniCase, p, 'C2')).toBe('');
  });
});
