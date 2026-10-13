import { describe, expect, it } from 'vitest';
import { miniCase } from '../engine/__fixtures__/miniCase';
import { buildRegistry } from './registry';

describe('buildRegistry', () => {
  it('정상 사건은 오류 없이 제목과 함께 등록된다', () => {
    const [entry] = buildRegistry({ './mini.json': { default: miniCase } });
    expect(entry.errors).toEqual([]);
    expect(entry.title).toBe('테스트 사건');
    expect(entry.key).toBe('./mini.json');
  });
  it('최상위가 null이어도 크래시 없이 오류로 표시한다', () => {
    const entries = buildRegistry({ './a.json': { default: null }, './mini.json': { default: miniCase } });
    const broken = entries.find((e) => e.key === './a.json')!;
    expect(broken.errors.length).toBeGreaterThan(0);
    expect(broken.title).toContain('a.json');
  });
  it('제목이 문자열이 아니면 파일 이름으로 대신 표시한다', () => {
    const [entry] = buildRegistry({ './x.json': { default: { ...miniCase, title: { bad: 1 } } } });
    expect(entry.errors.length).toBeGreaterThan(0);
    expect(typeof entry.title).toBe('string');
  });
  it('여러 파일에 같은 사건 id가 있으면 뒤의 파일을 오류로 표시한다', () => {
    const entries = buildRegistry({
      './a.json': { default: miniCase },
      './b.json': { default: { ...miniCase, title: '복사본' } },
    });
    expect(entries.find((e) => e.key === './a.json')!.errors).toEqual([]);
    expect(entries.find((e) => e.key === './b.json')!.errors.join()).toContain('mini');
  });
});
