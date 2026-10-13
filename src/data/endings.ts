import type { Line, SuspectId } from './types';

export const culprit: SuspectId = 'sera';

/** 정답이 되려면 제출한 3개가 각 범주를 하나씩 충족해야 한다 */
export const categories: { id: string; name: string; accepted: string[] }[] = [
  { id: 'lie', name: '거짓 진술', accepted: ['earring', 'group_photo', 'd_lie'] },
  { id: 'means', name: '수단', accepted: ['empty_vial', 'torn_label', 'd_method'] },
  { id: 'motive', name: '동기 또는 기회', accepted: ['appraisal', 'memo_forgery', 'msg_sera', 'd_motive', 'd_call'] },
];

export const slotCount = 3;

export const insufficientText = '심증은 있지만 증거가 부족합니다.';

/** 범인이 아닌 사람을 지목했을 때의 반박 대사 */
export const rebuttals: Partial<Record<SuspectId, Line>> = {
  haeun: { expr: 'angry', text: '전 10시 44분에 집을 나갔어요. 월패드를 보세요!' },
  minseok: { expr: 'angry', text: '제가 편의점에 있었다는 건 영수증이 증명하잖아요!' },
  doyun: { expr: 'angry', text: '오븐 기록을 보시오. 난 주방을 떠난 적이 없소.' },
};

export const goodEnding = {
  confession: { expr: 'final' as const, text: '그 그림 하나로 제 갤러리 20년이 끝날 판이었어요. 한 잔만 따라주면… 다 끝날 줄 알았죠.' },
  narration: '윤세라는 귀걸이 한 짝을 내려다보며 체포되었다.',
};

export const badEnding = {
  narration: '진범은 그날 밤 조용히 펜트하우스를 떠났다…',
};
