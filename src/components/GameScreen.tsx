import type { CSSProperties } from 'react';
import { items } from '../data/items';
import { roomOrder, rooms } from '../data/rooms';
import { useGame } from '../state/GameContext';
import Accusation from './Accusation';
import DialogBox from './DialogBox';
import Interrogation from './Interrogation';
import Inventory from './Inventory';
import ItemPopup from './ItemPopup';
import Notebook from './Notebook';
import PhoneLock from './PhoneLock';
import RoomView from './RoomView';

/** 방 테마를 CSS 변수(--t-<키>)로 바꾼다 */
function themeVars(theme: Record<string, string>): CSSProperties {
  return Object.fromEntries(Object.entries(theme).map(([k, v]) => [`--t-${k}`, v])) as CSSProperties;
}

export default function GameScreen({ debug }: { debug: boolean }) {
  const { state, dispatch } = useGame();
  const room = rooms[state.room];
  const evidenceCount = state.items.filter((id) => items[id]?.evidence).length;

  return (
    <div className="game-screen" style={themeVars({ ...room.theme })}>
      <nav className="room-tabs" aria-label="방 이동">
        {roomOrder.map((id, i) => (
          <button
            key={id}
            type="button"
            className={`room-tab pix ${state.room === id ? 'is-active' : ''}`}
            aria-current={state.room === id ? 'page' : undefined}
            onClick={() => dispatch({ type: 'GO_ROOM', room: id })}
          >
            <span className="room-tab-num">{String(i + 1).padStart(2, '0')}</span>
            {rooms[id].name}
          </button>
        ))}
      </nav>

      <RoomView debug={debug} />

      <div className="dialog-area">
        <DialogBox
          speaker="나"
          title={state.dialog?.title}
          text={state.dialog?.text ?? room.intro}
          replayKey={state.dialog?.seq}
          onAdvance={state.dialog ? () => dispatch({ type: 'CLOSE_DIALOG' }) : undefined}
        />
      </div>

      <div className="hud">
        <div className="hud-row">
          <span className="hud-label">증거품 <b>{evidenceCount}</b></span>
          <div className="hud-actions">
            <button className="hud-btn pix" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: 'notebook' })}>
              노트{state.deductions.length > 0 && <b> {state.deductions.length}</b>}
            </button>
            <button className="hud-btn pix" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: 'interrogation' })}>심문</button>
            <button
              className="hud-btn hud-btn-primary"
              disabled={!state.phoneUnlocked}
              title={state.phoneUnlocked ? undefined : '피해자의 휴대폰을 먼저 조사하자'}
              onClick={() => dispatch({ type: 'OPEN_PANEL', panel: 'accusation' })}
            >
              지목!
            </button>
          </div>
        </div>
        <Inventory />
      </div>

      {state.panel === 'phone' && <PhoneLock />}
      {state.panel === 'notebook' && <Notebook />}
      {state.panel === 'interrogation' && <Interrogation />}
      {state.panel === 'accusation' && <Accusation />}
      <ItemPopup />
    </div>
  );
}
