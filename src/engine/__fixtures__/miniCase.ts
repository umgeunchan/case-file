import type { CaseData } from '../../types';

export const miniCase: CaseData = {
  id: 'mini',
  title: '테스트 사건',
  summary: '',
  briefing: '',
  difficulty: 1,
  timeLimitMinutes: 30,
  locations: [
    { id: 'L1', name: '거실', description: '' },
    { id: 'L2', name: '빈 방', description: '' },
  ],
  items: [
    { id: 'I1', locationId: 'L1', name: '칼', description: '', givesClues: ['C1'] },
    { id: 'I2', locationId: 'L1', name: '상자', description: '', requires: ['C1'], givesClues: ['C2', 'C1'] },
  ],
  clues: [
    { id: 'C1', text: '칼의 흔적', isKey: true },
    { id: 'C2', text: '상자 속 편지', isKey: true },
    { id: 'C3', text: '목격 증언', isKey: false },
  ],
  suspects: [
    { id: 'S1', name: '가', profile: '' },
    { id: 'S2', name: '나', profile: '' },
  ],
  dialogues: [
    { id: 'D1', suspectId: 'S1', question: 'q1', answer: 'a1', givesClues: ['C3'] },
    { id: 'D2', suspectId: 'S1', question: 'q2', answer: 'a2', requires: ['C2'] },
    { id: 'D3', suspectId: 'S2', question: 'q3', answer: 'a3' },
  ],
  solution: {
    culpritId: 'S1',
    motive: { options: ['m0', 'm1'], answer: 1 },
    method: { options: ['x0', 'x1'], answer: 0 },
    explanation: '',
  },
};
