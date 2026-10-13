import type { HotspotAction, RoomDef, RoomId } from './types';

const item = (id: string): HotspotAction => ({ type: 'item', item: id });

/** 디자인 캔버스의 방 그림(390×480 px) 좌표를 퍼센트 좌표로 바꾼다 */
const STAGE_W = 390;
const STAGE_H = 480;
const round = (n: number) => Math.round(n * 100) / 100;
function at(l: number, t: number, w: number, h: number) {
  return { x: round((l / STAGE_W) * 100), y: round((t / STAGE_H) * 100), w: round((w / STAGE_W) * 100), h: round((h / STAGE_H) * 100) };
}

export const roomOrder: RoomId[] = ['study', 'living', 'kitchen'];

export const rooms: Record<RoomId, RoomDef> = {
  study: {
    id: 'study',
    name: '서재',
    intro: '펜트하우스 서재. 위스키 향이 희미하게 남아 있다.\n물건을 터치해 조사하자.',
    background: 'rooms/study.svg',
    colors: { base: '#3a2420', accent: '#6e2a35', text: '#f1e2d0' },
    theme: {
      bg: '#120a0c', navBg: '#1a0d10', navBorder: '#4f242b',
      tabBg: '#2a1418', tabText: '#c9aa98', tabNum: '#8a6a60', tabBorder: '#4f242b',
      tabActiveBg: '#7a2a36', tabActiveText: '#fff3dc', tabActiveNum: '#e8c27a', tabActiveBorder: '#d9a656',
      dialogBg: '#140b0e', dialogFrame: '#e8dcc8', dialogInset: '#2a1418', dialogText: '#f4ead8', dialogTitle: '#e8c27a',
      speakerBg: '#7a2a36', speakerText: '#fff3dc', speakerBorder: '#d9a656',
      hudBg: '#0e0709', hudBorder: '#4f242b', hudLabel: '#c9aa98', hudAccent: '#e8c27a',
      buttonBg: '#d9a656', buttonText: '#1a0d10',
      slotBg: '#1e1114', slotBorder: '#4f242b', slotText: '#f4ead8', slotEmpty: '#5a3a3c',
      badgeBg: 'rgba(18,10,12,0.86)', badgeText: '#f4ead8', badgeAccent: '#e8c27a',
      select: '#ffe39a',
    },
    hotspots: [
      { id: 'whisky_glass', label: '위스키 잔', ...at(96, 258, 30, 36), action: item('whisky_glass') },
      { id: 'decanter', label: '크리스털 디캔터', ...at(126, 237, 30, 54), action: item('decanter') },
      { id: 'phone', label: '휴대폰', ...at(159, 271, 34, 34), action: { type: 'phone' } },
      { id: 'desk_calendar', label: '탁상 달력', ...at(195, 255, 36, 36), action: item('desk_calendar') },
      { id: 'postit', label: '포스트잇', ...at(231, 264, 24, 36), action: item('postit') },
      { id: 'police_memo', label: '경찰 감식 메모', ...at(256, 261, 42, 36), action: item('police_memo') },
      { id: 'drawer', label: '잠긴 서랍', ...at(261, 309, 69, 42), action: { type: 'drawer' } },
      { id: 'earring', label: '귀걸이', ...at(186, 390, 36, 36), action: item('earring') },
      { id: 'receipt', label: '편의점 봉투', ...at(339, 339, 45, 75), action: item('receipt') },
      { id: 'smartwatch', label: '스마트워치', ...at(39, 417, 42, 36), action: item('smartwatch') },
      { id: 'doorlock_log', label: '도어락', ...at(312, 153, 33, 42), action: item('doorlock_log') },
    ],
  },
  living: {
    id: 'living',
    name: '거실',
    intro: '거실. 통창 너머로 서울의 밤이 펼쳐져 있다.\n물건을 터치해 조사하자.',
    background: 'rooms/living.svg',
    colors: { base: '#1c2541', accent: '#c9a227', text: '#f4ead2' },
    theme: {
      bg: '#0a0e1c', navBg: '#0e1328', navBorder: '#24305a',
      tabBg: '#141a36', tabText: '#a8b0d0', tabNum: '#6a74a0', tabBorder: '#24305a',
      tabActiveBg: '#24346e', tabActiveText: '#fff6dc', tabActiveNum: '#e8c870', tabActiveBorder: '#d8b45a',
      dialogBg: '#0c1124', dialogFrame: '#e8dcc8', dialogInset: '#1a2240', dialogText: '#eef0f8', dialogTitle: '#e8c870',
      speakerBg: '#24346e', speakerText: '#fff6dc', speakerBorder: '#d8b45a',
      hudBg: '#080b18', hudBorder: '#24305a', hudLabel: '#a8b0d0', hudAccent: '#e8c870',
      buttonBg: '#d8b45a', buttonText: '#0e1328',
      slotBg: '#121a34', slotBorder: '#2a3a6e', slotText: '#eef0f8', slotEmpty: '#4a5684',
      badgeBg: 'rgba(10,14,28,0.86)', badgeText: '#eef0f8', badgeAccent: '#e8c870',
      select: '#ffe39a',
    },
    hotspots: [
      { id: 'first_painting', label: '그림 「첫 그림」', ...at(27, 48, 105, 87), action: item('first_painting') },
      { id: 'group_photo', label: '단체 사진', ...at(66, 165, 63, 45), action: item('group_photo') },
      { id: 'wallpad_log', label: '월패드', ...at(132, 144, 33, 42), action: item('wallpad_log') },
      { id: 'empty_vial', label: '클러치', ...at(180, 297, 39, 33), action: item('empty_vial') },
      { id: 'wine_glasses', label: '와인잔 2개', ...at(153, 348, 51, 38), action: item('wine_glasses') },
      { id: 'torn_label', label: '쓰레기통', ...at(357, 327, 30, 54), action: item('torn_label') },
    ],
  },
  kitchen: {
    id: 'kitchen',
    name: '주방',
    intro: '주방. 펜던트 조명 아래 아일랜드 식탁.\n물건을 터치해 조사하자.',
    background: 'rooms/kitchen.svg',
    colors: { base: '#e9e6e1', accent: '#8a8178', text: '#2b2724' },
    theme: {
      bg: '#cfc8be', navBg: '#ddd6cc', navBorder: '#8c847b',
      tabBg: '#bdb5aa', tabText: '#2a2622', tabNum: '#5a534c', tabBorder: '#8c847b',
      tabActiveBg: '#f8f6f2', tabActiveText: '#2a2622', tabActiveNum: '#7a5a20', tabActiveBorder: '#2a2622',
      dialogBg: '#2a2622', dialogFrame: '#f8f6f2', dialogInset: '#3a3530', dialogText: '#f6f2ea', dialogTitle: '#e8c27a',
      speakerBg: '#5e5850', speakerText: '#ffffff', speakerBorder: '#f8f6f2',
      hudBg: '#d4cdc3', hudBorder: '#8c847b', hudLabel: '#3a3530', hudAccent: '#5a4010',
      buttonBg: '#c9a050', buttonText: '#2a2622',
      slotBg: '#ece8e2', slotBorder: '#8c847b', slotText: '#2a2622', slotEmpty: '#6e675f',
      badgeBg: 'rgba(248,246,242,0.92)', badgeText: '#2a2622', badgeAccent: '#5a4010',
      select: '#c9a050',
    },
    hotspots: [
      { id: 'rat_poison', label: '쥐약 상자', ...at(99, 54, 42, 48), action: item('rat_poison') },
      {
        id: 'sugar_jar',
        label: '설탕통',
        ...at(76, 186, 36, 42),
        action: { type: 'give', item: 'drawer_key', text: '설탕 속에 작은 열쇠가 묻혀 있다.', emptyText: '설탕통에는 이제 설탕뿐이다.' },
      },
      { id: 'dismissal_notice', label: '서류 봉투', ...at(264, 204, 42, 36), action: item('dismissal_notice') },
      { id: 'oven_log', label: '스마트 오븐', ...at(159, 243, 90, 102), action: item('oven_log') },
      { id: 'fridge_memo', label: '냉장고 메모', ...at(330, 72, 36, 42), action: item('fridge_memo') },
    ],
  },
};
