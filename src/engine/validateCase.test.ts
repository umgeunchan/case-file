import { describe, expect, it } from 'vitest';
import sample from '../cases/sample.json';
import { miniCase } from './__fixtures__/miniCase';
import { validateCase } from './validateCase';

const clone = () => structuredClone(miniCase);

describe('validateCase', () => {
  it('정상 사건은 오류가 없다', () => {
    expect(validateCase(miniCase)).toEqual([]);
  });
  it('샘플 사건은 오류가 없다', () => {
    expect(validateCase(sample)).toEqual([]);
  });
  it('객체가 아니거나 배열 필드가 없으면 오류', () => {
    expect(validateCase(null).length).toBeGreaterThan(0);
    const c = clone() as unknown as Record<string, unknown>;
    delete c.items;
    expect(validateCase(c).join()).toContain('items');
  });
  it('없는 장소를 참조하는 아이템', () => {
    const c = clone();
    c.items[0].locationId = 'LX';
    expect(validateCase(c).join()).toContain('LX');
  });
  it('없는 단서를 참조하는 질문 조건', () => {
    const c = clone();
    c.dialogues[0].requires = ['CX'];
    expect(validateCase(c).join()).toContain('CX');
  });
  it('없는 용의자를 참조하는 질문과 정답', () => {
    const c = clone();
    c.dialogues[0].suspectId = 'SX';
    c.solution.culpritId = 'SY';
    const errors = validateCase(c).join();
    expect(errors).toContain('SX');
    expect(errors).toContain('SY');
  });
  it('정답 인덱스가 보기 범위를 벗어나면 오류', () => {
    const c = clone();
    c.solution.motive.answer = 5;
    expect(validateCase(c).join()).toContain('motive');
  });
  it('id 중복은 오류', () => {
    const c = clone();
    c.clues.push({ id: 'C1', text: 'dup', isKey: false });
    expect(validateCase(c).join()).toContain('C1');
  });
  it('제한 시간과 난이도 범위', () => {
    const c = clone() as unknown as Record<string, unknown>;
    c.timeLimitMinutes = 0;
    c.difficulty = 7;
    const errors = validateCase(c).join();
    expect(errors).toContain('timeLimitMinutes');
    expect(errors).toContain('difficulty');
  });
  it('summary와 briefing은 문자열이어야 한다', () => {
    const c = clone() as unknown as Record<string, unknown>;
    c.summary = { x: 1 };
    c.briefing = 3;
    const errors = validateCase(c).join();
    expect(errors).toContain('summary');
    expect(errors).toContain('briefing');
  });
  it('배열 원소가 객체가 아니면 크래시 없이 오류', () => {
    for (const field of ['locations', 'items', 'clues', 'suspects', 'dialogues']) {
      const c = clone() as unknown as Record<string, unknown[]>;
      c[field] = [...c[field], null];
      expect(() => validateCase(c)).not.toThrow();
      expect(validateCase(c).join()).toContain(field);
    }
  });
});
