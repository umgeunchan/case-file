import { describe, expect, it } from 'vitest';
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
