import { describe, expect, it } from 'vitest';
import { judge } from './judge';

describe('정답 판정', () => {
  it('윤세라 + 거짓 진술·수단·동기 범주를 하나씩 충족하면 정답', () => {
    expect(judge('sera', ['earring', 'empty_vial', 'appraisal'])).toBe('correct');
    expect(judge('sera', ['d_lie', 'd_method', 'd_call'])).toBe('correct');
    expect(judge('sera', ['msg_sera', 'group_photo', 'torn_label'])).toBe('correct');
  });
  it('범주가 하나라도 비면 증거 부족', () => {
    expect(judge('sera', ['earring', 'group_photo', 'appraisal'])).toBe('insufficient');
    expect(judge('sera', ['earring', 'empty_vial', 'police_memo'])).toBe('insufficient');
    expect(judge('sera', ['d_time', 'd_alive', 'd_out'])).toBe('insufficient');
  });
  it('증거가 3개가 아니거나 중복이면 증거 부족', () => {
    expect(judge('sera', ['earring', 'empty_vial'])).toBe('insufficient');
    expect(judge('sera', ['earring', 'earring', 'appraisal'])).toBe('insufficient');
  });
  it('범인이 아니면 증거와 무관하게 오답', () => {
    expect(judge('haeun', ['earring', 'empty_vial', 'appraisal'])).toBe('wrong');
    expect(judge('minseok', [])).toBe('wrong');
    expect(judge('doyun', ['d_lie', 'd_method', 'd_motive'])).toBe('wrong');
  });
});
