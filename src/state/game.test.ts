import { describe, expect, it } from 'vitest';
import { deductionList } from '../data/deductions';
import { itemList } from '../data/items';
import { scenario } from '../data/scenario';
import { gameReducer, initialState, type GameAction, type GameState } from './game';

const run = (actions: GameAction[], from: GameState = initialState) => actions.reduce(gameReducer, from);
const touch = (id: string): GameAction => ({ type: 'TOUCH', hotspot: id });
const inGame = run([{ type: 'NEW_GAME' }, { type: 'SKIP_INTRO' }]);

describe('타이틀과 인트로', () => {
  it('새 게임은 인트로 첫 줄부터 시작한다', () => {
    const s = run([{ type: 'NEW_GAME' }]);
    expect(s.screen).toBe('intro');
    expect(s.introIndex).toBe(0);
  });
  it('인트로를 끝까지 넘기면 서재에서 게임이 시작된다', () => {
    const s = run([{ type: 'NEW_GAME' }, ...scenario.intro.map(() => ({ type: 'NEXT_INTRO' }) as GameAction)]);
    expect(s.screen).toBe('game');
    expect(s.room).toBe('study');
  });
});

describe('방과 핫스팟', () => {
  it('방을 이동한다', () => {
    expect(run([{ type: 'GO_ROOM', room: 'kitchen' }], inGame).room).toBe('kitchen');
  });
  it('증거 아이템을 터치하면 인벤토리에 들어가고 팝업이 열린다', () => {
    const s = run([touch('police_memo')], inGame);
    expect(s.items).toEqual(['police_memo']);
    expect(s.overlay).toBe('police_memo');
    expect(s.checked).toContain('police_memo');
  });
  it('같은 증거를 다시 터치해도 중복으로 들어가지 않는다', () => {
    const s = run([touch('police_memo'), { type: 'CLOSE_OVERLAY' }, touch('police_memo')], inGame);
    expect(s.items).toEqual(['police_memo']);
  });
  it('분위기용 아이템은 대화창에 설명만 나오고 인벤토리에 들어가지 않는다', () => {
    const s = run([touch('whisky_glass')], inGame);
    expect(s.items).toEqual([]);
    expect(s.overlay).toBeNull();
    expect(s.dialog?.text).toBe('바닥에 위스키가 조금 남아 있다.');
    expect(s.checked).toContain('whisky_glass');
  });
  it('확대 화면이 필요한 비증거 아이템은 오버레이로 열리지만 인벤토리에는 없다', () => {
    const s = run([touch('desk_calendar')], inGame);
    expect(s.overlay).toBe('desk_calendar');
    expect(s.items).toEqual([]);
  });
  it('다른 방의 핫스팟은 터치할 수 없다', () => {
    expect(run([touch('oven_log')], inGame).items).toEqual([]);
  });
  it('설탕통에서 열쇠를 한 번만 얻는다', () => {
    let s = run([{ type: 'GO_ROOM', room: 'kitchen' }, touch('sugar_jar')], inGame);
    expect(s.items).toEqual(['drawer_key']);
    expect(s.dialog?.text).toBe('설탕 속에 작은 열쇠가 묻혀 있다.');
    s = run([touch('sugar_jar')], s);
    expect(s.items).toEqual(['drawer_key']);
    expect(s.dialog?.text).toBe('설탕통에는 이제 설탕뿐이다.');
  });
  it('인벤토리에서 아이템을 다시 볼 수 있다', () => {
    const s = run([touch('police_memo'), { type: 'CLOSE_OVERLAY' }, { type: 'VIEW_ITEM', item: 'police_memo' }], inGame);
    expect(s.overlay).toBe('police_memo');
  });
  it('갖고 있지 않은 아이템은 볼 수 없다', () => {
    expect(run([{ type: 'VIEW_ITEM', item: 'earring' }], inGame).overlay).toBeNull();
  });
});

describe('서랍', () => {
  it('열쇠가 없으면 잠겨 있다', () => {
    const s = run([touch('drawer')], inGame);
    expect(s.dialog?.text).toBe('잠겨 있다.');
    expect(s.drawerOpen).toBe(false);
  });
  it('열쇠가 있으면 열리고 증거 3개를 얻는다', () => {
    let s = run([{ type: 'GO_ROOM', room: 'kitchen' }, touch('sugar_jar'), { type: 'GO_ROOM', room: 'study' }, touch('drawer')], inGame);
    expect(s.drawerOpen).toBe(true);
    expect(s.items).toEqual(expect.arrayContaining(['appraisal', 'ledger', 'will_draft']));
    s = run([touch('drawer')], s);
    expect(s.dialog?.text).toBe('서랍은 이미 비어 있다.');
    expect(s.items.filter((id) => id === 'appraisal')).toHaveLength(1);
  });
});

describe('휴대폰', () => {
  const atPhone = run([touch('phone')], inGame);
  it('휴대폰을 터치하면 잠금 화면이 열린다', () => {
    expect(atPhone.panel).toBe('phone');
  });
  it('하은의 생일을 넣으면 전용 힌트가 나오고 흔들리지 않는다', () => {
    const s = run([{ type: 'SUBMIT_PIN', pin: '980315' }], atPhone);
    expect(s.phoneUnlocked).toBe(false);
    expect(s.phoneError?.text).toBe('비밀번호가 틀렸습니다. …같은 해, 다른 날일지도?');
    expect(s.phoneError?.shake).toBe(false);
  });
  it('그 외 오답은 기본 메시지와 흔들림, 횟수 제한 없음', () => {
    const s = run(Array.from({ length: 20 }, () => ({ type: 'SUBMIT_PIN', pin: '000000' }) as GameAction), atPhone);
    expect(s.phoneError?.text).toBe('비밀번호가 틀렸습니다.');
    expect(s.phoneError?.shake).toBe(true);
    expect(run([{ type: 'SUBMIT_PIN', pin: '980417' }], s).phoneUnlocked).toBe(true);
  });
  it('정답이면 해제되고 문자·메모 증거 3개를 얻는다', () => {
    const s = run([{ type: 'SUBMIT_PIN', pin: '980417' }], atPhone);
    expect(s.phoneUnlocked).toBe(true);
    expect(s.phoneError).toBeNull();
    expect(s.items).toEqual(expect.arrayContaining(['msg_sera', 'msg_minseok', 'memo_forgery']));
  });
});

describe('추리 노트', () => {
  const allEvidence = itemList.filter((i) => i.evidence).map((i) => i.id);
  const withAll: GameState = { ...inGame, items: allEvidence };
  const combine = (a: string, b: string): GameAction => ({ type: 'COMBINE', a, b });

  it.each(deductionList.map((d) => [d.id, d] as const))('%s 조합이 동작한다 (순서 무관)', (_id, d) => {
    // 추리 결과를 재료로 쓰는 조합은 그 결과를 먼저 만들어 둔다
    const prereq = deductionList.filter((x) => d.inputs.includes(x.id)).map((x) => combine(...x.inputs));
    const forward = run([...prereq, combine(d.inputs[0], d.inputs[1])], withAll);
    const reverse = run([...prereq, combine(d.inputs[1], d.inputs[0])], withAll);
    for (const s of [forward, reverse]) {
      expect(s.deductions).toContain(d.id);
      expect(s.notebookResult).toMatchObject({ success: true, text: d.text });
    }
  });
  it('연결점이 없는 조합은 실패 문구', () => {
    const s = run([combine('police_memo', 'ledger')], withAll);
    expect(s.deductions).toEqual([]);
    expect(s.notebookResult).toMatchObject({ success: false, text: '이 둘 사이에는 연결점이 보이지 않는다.' });
  });
  it('이미 만든 추리는 다시 기록하지 않는다', () => {
    const s = run([combine('smartwatch', 'doorlock_log'), combine('doorlock_log', 'smartwatch')], withAll);
    expect(s.deductions).toEqual(['d_time']);
    expect(s.notebookResult?.text).toBe('이미 노트에 적어 둔 추리다.');
  });
  it('갖고 있지 않은 증거로는 조합할 수 없다', () => {
    expect(run([combine('smartwatch', 'doorlock_log')], inGame).deductions).toEqual([]);
    expect(run([combine('msg_sera', 'd_time')], withAll).deductions).toEqual([]);
  });
  it('같은 증거 두 개는 조합할 수 없다', () => {
    expect(run([combine('smartwatch', 'smartwatch')], withAll).notebookResult?.success).toBe(false);
  });
});

describe('심문', () => {
  const allEvidence = itemList.filter((i) => i.evidence).map((i) => i.id);
  const withAll: GameState = { ...inGame, items: allEvidence };
  const pick = (suspect: 'haeun' | 'minseok' | 'doyun' | 'sera'): GameAction => ({ type: 'SELECT_SUSPECT', suspect });
  const present = (evidence: string): GameAction => ({ type: 'PRESENT', evidence });

  it('용의자를 고르면 기본 진술이 나온다', () => {
    const s = run([pick('doyun')], withAll);
    expect(s.interrogation).toMatchObject({ suspect: 'doyun', line: { expr: 'normal', text: '11시부터 주방에서 야식을 만들었소.' } });
  });
  it('정의된 증거를 제시하면 반응 대사와 표정이 나온다', () => {
    const s = run([pick('haeun'), present('will_draft')], withAll);
    expect(s.interrogation?.line).toEqual({ expr: 'angry', text: '그래서 싸운 거예요! 하지만 죽이진 않았어요!' });
  });
  it('정의되지 않은 증거를 제시하면 기본 반응', () => {
    const s = run([pick('minseok'), present('earring')], withAll);
    expect(s.interrogation?.line).toEqual({ expr: 'normal', text: '그게 저랑 무슨 상관이죠?' });
  });
  it('윤세라에게 단체 사진은 귀걸이를 먼저 보여 줘야 반응한다', () => {
    const before = run([pick('sera'), present('group_photo')], withAll);
    expect(before.interrogation?.line.text).toBe('그게 저랑 무슨 상관이죠?');
    const after = run([pick('sera'), present('earring'), present('group_photo')], withAll);
    expect(after.interrogation?.line).toEqual({ expr: 'sweat', text: '……디너는 거실에서 했었죠. 그건…' });
  });
  it('귀걸이 제시 기록은 용의자별이다', () => {
    const s = run([pick('haeun'), present('earring'), pick('sera'), present('group_photo')], withAll);
    expect(s.interrogation?.line.text).toBe('그게 저랑 무슨 상관이죠?');
  });
  it('추리 결과도 제시할 수 있다', () => {
    const s = run([pick('sera'), present('d_lie')], { ...withAll, deductions: ['d_lie'] });
    expect(s.interrogation?.line.expr).toBe('angry');
  });
  it('갖고 있지 않은 증거나 용의자 선택 전 제시는 무시한다', () => {
    expect(run([pick('sera'), present('d_lie')], withAll).interrogation?.line.text).toBe(
      '디너 후엔 계속 거실에서 와인을 마셨어요. 서재엔 들어가지 않았어요.',
    );
    expect(run([present('earring')], withAll).interrogation).toBeNull();
  });
});

describe('지목과 엔딩', () => {
  const allEvidence = itemList.filter((i) => i.evidence).map((i) => i.id);
  const ready: GameState = { ...inGame, items: allEvidence, phoneUnlocked: true };
  const accuse = (suspect: 'haeun' | 'minseok' | 'doyun' | 'sera', evidence: string[]): GameAction => ({ type: 'ACCUSE', suspect, evidence });

  it('휴대폰을 풀기 전에는 지목 화면을 열 수 없다', () => {
    expect(run([{ type: 'OPEN_PANEL', panel: 'accusation' }], { ...ready, phoneUnlocked: false }).panel).toBeNull();
    expect(run([{ type: 'OPEN_PANEL', panel: 'accusation' }], ready).panel).toBe('accusation');
  });
  it('정답이면 정답 엔딩', () => {
    const s = run([{ type: 'OPEN_PANEL', panel: 'accusation' }, accuse('sera', ['earring', 'empty_vial', 'appraisal'])], ready);
    expect(s.screen).toBe('ending');
    expect(s.ending).toEqual({ kind: 'good' });
  });
  it('범주가 부족하면 게임 오버 없이 지목 화면에 남는다', () => {
    const s = run([{ type: 'OPEN_PANEL', panel: 'accusation' }, accuse('sera', ['earring', 'group_photo', 'appraisal'])], ready);
    expect(s.screen).toBe('game');
    expect(s.panel).toBe('accusation');
    expect(s.accuseNotice?.text).toBe('심증은 있지만 증거가 부족합니다.');
  });
  it('범인을 틀리면 오답 엔딩, 다시 추리하기로 지목 직전으로 돌아간다', () => {
    let s = run([{ type: 'OPEN_PANEL', panel: 'accusation' }, accuse('doyun', ['earring', 'empty_vial', 'appraisal'])], ready);
    expect(s.ending).toEqual({ kind: 'bad', suspect: 'doyun' });
    s = run([{ type: 'RETRY_ACCUSATION' }], s);
    expect(s.screen).toBe('game');
    expect(s.panel).toBe('accusation');
    expect(s.ending).toBeNull();
    expect(s.items).toEqual(allEvidence);
  });
  it('갖고 있지 않은 증거로는 지목할 수 없다', () => {
    const s = run([{ type: 'OPEN_PANEL', panel: 'accusation' }, accuse('sera', ['d_lie', 'd_method', 'd_motive'])], ready);
    expect(s.screen).toBe('game');
    expect(s.ending).toBeNull();
  });
});

describe('처음부터 정답 엔딩까지', () => {
  it('핫스팟 터치와 퍼즐만으로 정답 엔딩에 도달한다', () => {
    const go = (room: 'study' | 'living' | 'kitchen'): GameAction => ({ type: 'GO_ROOM', room });
    const s = run([
      { type: 'NEW_GAME' },
      ...scenario.intro.map(() => ({ type: 'NEXT_INTRO' }) as GameAction),
      touch('earring'), touch('desk_calendar'),
      go('living'), touch('group_photo'), touch('first_painting'), touch('empty_vial'), touch('torn_label'),
      go('kitchen'), touch('sugar_jar'),
      go('study'), touch('drawer'), touch('phone'), { type: 'SUBMIT_PIN', pin: '980417' }, { type: 'CLOSE_PANEL' },
      { type: 'COMBINE', a: 'earring', b: 'group_photo' },
      { type: 'COMBINE', a: 'empty_vial', b: 'torn_label' },
      { type: 'COMBINE', a: 'appraisal', b: 'memo_forgery' },
      { type: 'OPEN_PANEL', panel: 'accusation' },
      { type: 'ACCUSE', suspect: 'sera', evidence: ['d_lie', 'd_method', 'd_motive'] },
    ]);
    expect(s.ending).toEqual({ kind: 'good' });
  });
});
