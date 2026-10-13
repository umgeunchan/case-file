import type { SuspectDef } from './types';

export const scenario = {
  title: '펜트하우스의 마지막 잔',
  intro: [
    '2026년 10월, 서울 한남동의 한 펜트하우스.',
    '21시에 디너 파티가 끝나고, 손님 몇 명이 남아 있었다.',
    '23시 40분, 비서가 서재에서 쓰러진 집주인 서진우(58)를 발견했다.',
    'IT 투자자이자 미술품 컬렉터. 사인은 위스키 잔에 섞인 약물.',
    '그날 밤 이 집에 있던 사람은 네 명. 서재, 거실, 주방을 조사해 범인을 밝혀내라.',
  ],
  victim: { name: '서진우', age: 58, description: 'IT 투자자 겸 미술품 컬렉터', image: 'suspects/victim.svg' },
};

export const suspects: SuspectDef[] = [
  {
    id: 'haeun',
    name: '서하은',
    age: 28,
    relation: '딸',
    motive: '유언장에서 빠질 위기',
    statement: '10시 반에 아빠랑 다투고 바로 집에 갔어요.',
    sprites: {
      normal: 'suspects/haeun_normal.svg',
      sweat: 'suspects/haeun_sweat.svg',
      angry: 'suspects/haeun_angry.svg',
      final: 'suspects/haeun_final.svg',
    },
    card: { bg: '#3a1c24', plate: '#7a2a36' },
  },
  {
    id: 'minseok',
    name: '강민석',
    age: 35,
    relation: '비서',
    motive: '횡령',
    statement: '사장님이 두통약을 부탁해서 편의점에 다녀왔어요.',
    sprites: {
      normal: 'suspects/minseok_normal.svg',
      sweat: 'suspects/minseok_sweat.svg',
      angry: 'suspects/minseok_angry.svg',
      final: 'suspects/minseok_final.svg',
    },
    card: { bg: '#2c3040', plate: '#3a4258' },
  },
  {
    id: 'doyun',
    name: '한도윤',
    age: 47,
    relation: '전속 요리사',
    motive: '해고 통보',
    statement: '11시부터 주방에서 야식을 만들었소.',
    sprites: {
      normal: 'suspects/doyun_normal.svg',
      sweat: 'suspects/doyun_sweat.svg',
      angry: 'suspects/doyun_angry.svg',
      final: 'suspects/doyun_final.svg',
    },
    card: { bg: '#3a3430', plate: '#5e5850' },
  },
  {
    id: 'sera',
    name: '윤세라',
    age: 41,
    relation: '갤러리 대표',
    motive: null,
    statement: '디너 후엔 계속 거실에 있었어요. 서재엔 안 들어갔어요.',
    sprites: {
      normal: 'suspects/sera_normal.svg',
      sweat: 'suspects/sera_sweat.svg',
      angry: 'suspects/sera_angry.svg',
      final: 'suspects/sera_final.svg',
    },
    card: { bg: '#1c2444', plate: '#24346e' },
  },
];

/** 진상 타임라인 (정답 엔딩 해설) */
export const timeline: { time: string; event: string }[] = [
  { time: '21:00', event: '디너 종료, 거실에서 단체 사진 촬영' },
  { time: '22:30', event: '하은이 서재에 들어가 말다툼' },
  { time: '22:40', event: '하은이 서재에서 나옴' },
  { time: '22:41', event: '피해자가 윤세라에게 문자: "11시에 서재로 와. 할 얘기 있어."' },
  { time: '22:44', event: '하은 외출 (현관 기록)' },
  { time: '22:50', event: '비서가 서재에 들어감, 피해자가 두통약을 부탁함' },
  { time: '22:53', event: '비서가 서재에서 나옴' },
  { time: '22:55', event: '비서 외출' },
  { time: '22:56', event: '피해자가 비서에게 문자: "타이레놀 말고 게보린으로" (피해자 생존 확인)' },
  { time: '23:01', event: '비서가 편의점에서 결제' },
  { time: '23:03', event: '윤세라 서재 입장' },
  { time: '23:05', event: '요리사가 주방에서 오븐 수동 시작' },
  { time: '23:08', event: '윤세라가 잔에 약물을 넣음' },
  { time: '23:10', event: '요리사가 주방에서 오븐 패널 터치' },
  { time: '23:12', event: '피해자 심박 정지' },
  { time: '23:14', event: '윤세라 퇴장, 책상 밑에 귀걸이 한 짝을 떨어뜨림' },
  { time: '23:15', event: '윤세라가 거실 쓰레기통에 약병 라벨을 찢어 버림' },
  { time: '23:25', event: '비서 귀가' },
  { time: '23:40', event: '비서가 시신 발견' },
];
