import type { DeductionDef } from './types';

/** inputs에는 증거 id나 다른 추리 결과 id를 넣을 수 있다. 순서는 상관없다. */
export const deductionList: DeductionDef[] = [
  { id: 'd_time', title: '범행 시간', inputs: ['smartwatch', 'doorlock_log'], text: '범행 시간은 23:03~23:14. 그 시간 서재에 누군가 있었다.' },
  { id: 'd_alive', title: '22:56의 생존 확인', inputs: ['msg_minseok', 'receipt'], text: '22:56까지 피해자는 살아 있었고, 비서는 밖에 있었다.' },
  { id: 'd_out', title: '하은과 비서의 외출', inputs: ['wallpad_log', 'doorlock_log'], text: '23:03~23:14에 하은과 비서는 집 밖에 있었다.' },
  { id: 'd_chef', title: '요리사의 알리바이', inputs: ['oven_log', 'doorlock_log'], text: '요리사는 23:05와 23:10에 주방에서 패널을 직접 눌렀다. 서재에 있을 수 없다.' },
  { id: 'd_poison_not', title: '쥐약이 아니다', inputs: ['rat_poison', 'police_memo'], text: '쥐약은 밀봉 상태. 사용된 약물은 다른 것이다.' },
  { id: 'd_lie', title: '윤세라의 거짓 진술', inputs: ['earring', 'group_photo'], text: '윤세라는 서재에 들어간 적이 있다. "서재엔 안 갔다"는 진술은 거짓이다.' },
  { id: 'd_method', title: '범행 수단', inputs: ['empty_vial', 'torn_label'], text: '갤러리 복원실 약품이 윤세라의 클러치에서 나왔다.' },
  { id: 'd_motive', title: '범행 동기', inputs: ['appraisal', 'memo_forgery'], text: '위작이 신고되면 윤세라의 갤러리는 끝난다.' },
  { id: 'd_call', title: '서재로의 호출', inputs: ['msg_sera', 'd_time'], text: '피해자가 직접 윤세라를 23:00에 서재로 불렀다.' },
];

export const deductions: Record<string, DeductionDef> = Object.fromEntries(deductionList.map((d) => [d.id, d]));

export const combineFailText = '이 둘 사이에는 연결점이 보이지 않는다.';
export const combineDuplicateText = '이미 노트에 적어 둔 추리다.';
