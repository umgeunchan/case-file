import type { Line, SuspectDialogue, SuspectId } from './types';

/** 대사에 정의되지 않은 증거를 제시했을 때 */
export const fallbackLine: Line = { expr: 'normal', text: '그게 저랑 무슨 상관이죠?' };

export const dialogues: Record<SuspectId, SuspectDialogue> = {
  haeun: {
    base: {
      expr: 'normal',
      text: '10시 반에 아빠랑 다투고 바로 나갔어요. 제 생일도 잊는 사람이었다고요. 3월 15일, 98년생. 그거 하나 못 외워요.',
    },
    reactions: [
      { evidence: 'will_draft', expr: 'angry', text: '그래서 싸운 거예요! 하지만 죽이진 않았어요!' },
      { evidence: 'wallpad_log', expr: 'normal', text: '봐요, 10시 44분에 나갔잖아요.' },
    ],
  },
  minseok: {
    base: { expr: 'normal', text: '사장님이 두통약을 부탁하셔서 편의점에 다녀왔습니다.' },
    reactions: [
      { evidence: 'ledger', expr: 'sweat', text: '그, 그건… 따로 설명드리겠습니다…' },
      { evidence: 'receipt', expr: 'normal', text: '23시 1분입니다. 저는 그때 밖에 있었어요.' },
      { evidence: 'msg_minseok', expr: 'normal', text: '네, 그 문자 받고 게보린으로 바꿔 샀습니다.' },
    ],
  },
  doyun: {
    base: { expr: 'normal', text: '11시부터 주방에서 야식을 만들었소.' },
    reactions: [
      { evidence: 'rat_poison', expr: 'angry', text: '뜯지도 않은 걸 왜 들이미시오.' },
      { evidence: 'dismissal_notice', expr: 'angry', text: '화는 났지. 하지만 칼은 요리에만 쓰오.' },
      { evidence: 'oven_log', expr: 'normal', text: '흥. 그 기계가 증인이오.' },
    ],
  },
  sera: {
    base: { expr: 'normal', text: '디너 후엔 계속 거실에서 와인을 마셨어요. 서재엔 들어가지 않았어요.' },
    reactions: [
      { evidence: 'earring', expr: 'sweat', text: '어머, 디너 때 떨어뜨렸나 보네요.' },
      { evidence: 'group_photo', after: ['earring'], expr: 'sweat', text: '……디너는 거실에서 했었죠. 그건…' },
      { evidence: 'd_lie', expr: 'angry', text: '그래요, 잠깐 들렀어요! 인사만 하고 나왔다고요!' },
      { evidence: 'empty_vial', expr: 'normal', text: '향수 공병이에요. 이상할 것 없잖아요?' },
      { evidence: 'torn_label', expr: 'angry', text: '그 쓰레기를 누가 버렸는지 어떻게 알죠?' },
      { evidence: 'msg_sera', expr: 'sweat', text: '문자는 봤지만… 가지 않았어요.' },
      { evidence: 'appraisal', expr: 'sweat', text: '그 감정서는 틀렸어요. 다시 감정하면…' },
    ],
  },
};
