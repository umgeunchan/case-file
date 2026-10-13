import type { ItemDef } from './types';

const list: ItemDef[] = [
  // 서재
  { id: 'police_memo', name: '경찰 감식 메모', short: '감식메모', evidence: true, view: 'popup', text: '디캔터에서는 약물 미검출. 잔에서만 검출됨.' },
  { id: 'smartwatch', image: 'items/smartwatch.svg', name: '스마트워치', short: '워치', evidence: true, view: 'popup', text: '심박 기록: 23:12 이후 측정 불가.' },
  { id: 'doorlock_log', name: '서재 도어락 기록', short: '도어락', evidence: true, view: 'zoom', text: '22:30 / 22:40 / 22:50 / 22:53 / 23:03 / 23:14 / 23:40 열림',
    zoom: {
      kind: 'log', device: 'doorlock', heading: '디지털 도어락', title: '서재 도어락 기록', line: '출입 기록이 남아 있다. 시각을 확인하자.',
      columns: ['시각', '기록'],
      rows: [['22:30', '열림'], ['22:40', '열림'], ['22:50', '열림'], ['22:53', '열림'], ['23:03', '열림'], ['23:14', '열림'], ['23:40', '열림']],
    } },
  { id: 'earring', image: 'items/earring.svg', name: '진주 귀걸이 한 짝', short: '귀걸이', evidence: true, view: 'popup', text: '책상 밑에 진주 귀걸이 한 짝이 떨어져 있다.' },
  { id: 'receipt', image: 'items/receipt.svg', name: '편의점 영수증', short: '영수증', evidence: true, view: 'popup', text: '게보린 1개. 23:01 결제.' },
  { id: 'desk_calendar', name: '탁상 달력', evidence: false, view: 'zoom', text: "4월 칸에 '17 ★ 그날'이라고 적혀 있다.",
    zoom: { kind: 'calendar', title: '4월 17일', line: '별표와 함께 "그날"이라고 적혀 있다.', month: 4, firstWeekday: 3, days: 30, mark: 17, markLabel: '그날' } },
  { id: 'postit', image: 'items/postit.svg', name: '포스트잇', evidence: false, view: 'dialog', text: '서랍 열쇠는 늘 달콤한 곳에.' },
  { id: 'decanter', name: '크리스털 디캔터', evidence: false, view: 'dialog', text: '묵직한 크리스털 디캔터. 위스키가 반쯤 남아 있다.' },
  { id: 'whisky_glass', image: 'items/whisky_glass.svg', name: '위스키 잔', evidence: false, view: 'dialog', text: '바닥에 위스키가 조금 남아 있다.' },

  // 거실
  { id: 'group_photo', image: 'items/group_photo.svg', name: '단체 사진 (21:00)', short: '단체사진', evidence: true, view: 'popup', text: '디너 때 찍은 사진. 윤세라는 진주 귀걸이 한 쌍을 하고 있다.' },
  {
    id: 'first_painting',
    name: '그림 「첫 그림」',
    evidence: false,
    view: 'zoom',
    text: '하은이가 태어난 해, 처음으로 나를 위해 산 그림. 1998. 04. 그날을 잊지 않으리',
    zoom: {
      kind: 'painting', image: 'zoom/painting_back.svg', title: '그림 뒷면의 손글씨', line: '액자를 뒤집자 캔버스 천에\n손으로 쓴 글씨가 보인다.',
      frontText: '따뜻한 색감의 풍경화. 아래 명판에 「첫 그림」이라고 적혀 있다.',
      handwriting: ['하은이가 태어난 해,', '처음으로 나를 위해 산 그림.', '1998. 04.', '그날을 잊지 않으리'],
    },
  },
  { id: 'wallpad_log', name: '월패드 현관 기록', short: '월패드', evidence: true, view: 'zoom', text: '22:44 서하은 외출 / 22:55 강민석 외출 / 23:25 강민석 입장',
    zoom: {
      kind: 'log', device: 'wallpad', heading: '월패드', title: '월패드 현관 기록', line: '누가, 언제 드나들었는지 남아 있다.',
      columns: ['시각', '구분', '내용'],
      rows: [['22:44', '현관', '서하은 외출'], ['22:55', '현관', '강민석 외출'], ['23:25', '현관', '강민석 입장']],
    } },
  { id: 'empty_vial', image: 'items/empty_vial.svg', name: '빈 약병', short: '약병', evidence: true, view: 'popup', text: '윤세라의 클러치 안에 라벨 없는 작은 빈 약병이 있다.' },
  { id: 'torn_label', image: 'items/torn_label.svg', name: '찢긴 라벨 조각', short: '라벨', evidence: true, view: 'popup', text: "'복원실 약품 — 취급 주의 / Gallery S…'" },
  { id: 'wine_glasses', name: '와인잔 2개', evidence: false, view: 'dialog', text: '립스틱 자국. 한 잔은 거의 마시지 않았다.' },

  // 주방
  { id: 'oven_log', name: '스마트 오븐 기록', short: '오븐기록', evidence: true, view: 'zoom', text: '23:05 수동 시작 / 23:10 레시피 2단계 확인 (패널 터치)',
    zoom: {
      kind: 'log', device: 'oven', heading: '스마트 오븐', title: '스마트 오븐 기록', line: '오븐이 언제 쓰였는지 기록되어 있다.',
      columns: ['시각', '기록'],
      rows: [['23:05', '수동 시작'], ['23:10', '레시피 2단계 확인 (패널 터치)']],
    } },
  { id: 'rat_poison', image: 'items/rat_poison.svg', name: '쥐약 상자', short: '쥐약', evidence: true, view: 'popup', text: '밀봉 스티커가 뜯기지 않았다.' },
  { id: 'dismissal_notice', image: 'items/dismissal_notice.svg', name: '해고 예고장', short: '해고장', evidence: true, view: 'popup', text: '한도윤 님, 11월 말일부로 계약을 종료합니다.' },
  { id: 'fridge_memo', name: '냉장고 메모', evidence: false, view: 'dialog', text: '사장님 야식 23:30' },
  { id: 'drawer_key', image: 'items/drawer_key.svg', name: '서랍 열쇠', short: '열쇠', evidence: false, key: true, view: 'popup', text: '설탕통에 묻혀 있던 작은 열쇠.' },

  // 서랍
  { id: 'appraisal', image: 'items/appraisal.svg', name: '위작 감정서', short: '감정서', evidence: true, view: 'popup', text: '「푸른 정원」 위작 판정. 판매처: 갤러리 세라' },
  { id: 'ledger', image: 'items/ledger.svg', name: '횡령 장부', short: '장부', evidence: true, view: 'popup', text: '회사 계좌에서 강민석 명의로 수차례 이체된 기록.' },
  { id: 'will_draft', image: 'items/will_draft.svg', name: '유언장 수정 초안', short: '유언장', evidence: true, view: 'popup', text: '서하은의 상속분을 대폭 축소한다.' },

  // 휴대폰
  { id: 'msg_sera', name: '윤세라에게 보낸 문자', short: '문자·세라', evidence: true, view: 'popup', text: '22:41 → 윤세라: "11시에 서재로 와. 할 얘기 있어."' },
  { id: 'msg_minseok', name: '강민석에게 보낸 문자', short: '문자·민석', evidence: true, view: 'popup', text: '22:56 → 강민석: "타이레놀 말고 게보린으로"' },
  { id: 'memo_forgery', name: '휴대폰 메모', short: '폰 메모', evidence: true, view: 'popup', text: '「푸른 정원」 위작 확정. 내일 오전 변호사·경찰 연락할 것.' },
];

export const items: Record<string, ItemDef> = Object.fromEntries(list.map((item) => [item.id, item]));
export const itemList = list;
