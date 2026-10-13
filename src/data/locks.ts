export const drawerLock = {
  requiresItem: 'drawer_key',
  lockedText: '잠겨 있다.',
  openText: '열쇠가 맞았다. 서랍 안에서 서류 세 장이 나왔다.',
  emptyText: '서랍은 이미 비어 있다.',
  rewards: ['appraisal', 'ledger', 'will_draft'],
};

export const phoneLock = {
  prompt: '내 인생 최고의 날 (YYMMDD)',
  pin: '980417',
  length: 6,
  wrongText: '비밀번호가 틀렸습니다.',
  /** 특정 오답에 대한 전용 힌트 */
  hints: [{ input: '980315', text: '비밀번호가 틀렸습니다. …같은 해, 다른 날일지도?' }],
  unlockText: '잠금이 해제되었다.',
  messages: [
    { evidence: 'msg_sera', time: '22:41', to: '윤세라', text: '11시에 서재로 와. 할 얘기 있어.' },
    { evidence: 'msg_minseok', time: '22:56', to: '강민석', text: '타이레놀 말고 게보린으로' },
  ],
  memos: [{ evidence: 'memo_forgery', text: '「푸른 정원」 위작 확정. 내일 오전 변호사·경찰 연락할 것.' }],
  rewards: ['msg_sera', 'msg_minseok', 'memo_forgery'],
};
