import type { RoomDef, RoomId } from './types';

const item = (id: string) => ({ type: 'item' as const, item: id });

export const roomOrder: RoomId[] = ['study', 'living', 'kitchen'];

export const rooms: Record<RoomId, RoomDef> = {
  study: {
    id: 'study',
    name: '서재',
    colors: { base: '#3a2420', accent: '#6e2a35', text: '#f1e2d0' },
    hotspots: [
      { id: 'police_memo', label: '경찰 감식 메모', x: 6, y: 6, w: 26, h: 12, action: item('police_memo') },
      { id: 'smartwatch', label: '스마트워치', x: 38, y: 6, w: 22, h: 12, action: item('smartwatch') },
      { id: 'doorlock_log', label: '도어락', x: 76, y: 8, w: 18, h: 22, action: item('doorlock_log') },
      { id: 'desk_calendar', label: '탁상 달력', x: 6, y: 26, w: 22, h: 12, action: item('desk_calendar') },
      { id: 'postit', label: '포스트잇', x: 34, y: 26, w: 18, h: 10, action: item('postit') },
      { id: 'whisky_glass', label: '위스키 잔', x: 56, y: 36, w: 16, h: 12, action: item('whisky_glass') },
      { id: 'phone', label: '휴대폰', x: 6, y: 46, w: 20, h: 12, action: { type: 'phone' } },
      { id: 'drawer', label: '잠긴 서랍', x: 30, y: 54, w: 30, h: 14, action: { type: 'drawer' } },
      { id: 'earring', label: '귀걸이', x: 64, y: 78, w: 10, h: 7, action: item('earring') },
      { id: 'receipt', label: '편의점 봉투', x: 76, y: 60, w: 18, h: 16, action: item('receipt') },
    ],
  },
  living: {
    id: 'living',
    name: '거실',
    colors: { base: '#1c2541', accent: '#c9a227', text: '#f4ead2' },
    hotspots: [
      { id: 'group_photo', label: '단체 사진', x: 8, y: 8, w: 26, h: 16, action: item('group_photo') },
      { id: 'first_painting', label: '그림 「첫 그림」', x: 40, y: 6, w: 30, h: 22, action: item('first_painting') },
      { id: 'wallpad_log', label: '월패드', x: 78, y: 10, w: 16, h: 18, action: item('wallpad_log') },
      { id: 'wine_glasses', label: '와인잔 2개', x: 10, y: 44, w: 24, h: 12, action: item('wine_glasses') },
      { id: 'empty_vial', label: '클러치', x: 42, y: 50, w: 20, h: 12, action: item('empty_vial') },
      { id: 'torn_label', label: '쓰레기통', x: 74, y: 66, w: 18, h: 20, action: item('torn_label') },
    ],
  },
  kitchen: {
    id: 'kitchen',
    name: '주방',
    colors: { base: '#e9e6e1', accent: '#8a8178', text: '#2b2724' },
    hotspots: [
      { id: 'oven_log', label: '스마트 오븐', x: 8, y: 10, w: 30, h: 22, action: item('oven_log') },
      { id: 'fridge_memo', label: '냉장고 메모', x: 70, y: 8, w: 22, h: 14, action: item('fridge_memo') },
      {
        id: 'sugar_jar',
        label: '설탕통',
        x: 44,
        y: 40,
        w: 18,
        h: 14,
        action: { type: 'give', item: 'drawer_key', text: '설탕 속에 작은 열쇠가 묻혀 있다.', emptyText: '설탕통에는 이제 설탕뿐이다.' },
      },
      { id: 'rat_poison', label: '쥐약 상자', x: 8, y: 64, w: 24, h: 14, action: item('rat_poison') },
      { id: 'dismissal_notice', label: '해고 예고장', x: 62, y: 66, w: 28, h: 12, action: item('dismissal_notice') },
    ],
  },
};
