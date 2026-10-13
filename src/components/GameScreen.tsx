import { roomOrder, rooms } from '../data/rooms';
import { useGame } from '../state/GameContext';
import DialogBox from './DialogBox';
import Inventory from './Inventory';
import ItemPopup from './ItemPopup';
import Notebook from './Notebook';
import PhoneLock from './PhoneLock';
import RoomView from './RoomView';

export default function GameScreen({ debug }: { debug: boolean }) {
  const { state, dispatch } = useGame();

  return (
    <div className="game-screen">
      <nav className="room-tabs" aria-label="방 이동">
        {roomOrder.map((id) => (
          <button
            key={id}
            type="button"
            className={`room-tab ${state.room === id ? 'is-active' : ''}`}
            aria-current={state.room === id}
            onClick={() => dispatch({ type: 'GO_ROOM', room: id })}
          >
            {rooms[id].name}
          </button>
        ))}
      </nav>

      <RoomView debug={debug} />

      <div className="hud">
        <DialogBox
          text={state.dialog?.text ?? '살펴볼 곳을 터치하자.'}
          replayKey={state.dialog?.seq}
          onAdvance={state.dialog ? () => dispatch({ type: 'CLOSE_DIALOG' }) : undefined}
        />
        <Inventory />
        <div className="actions-bar">
          <button className="pbtn" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: 'notebook' })}>
            추리 노트{state.deductions.length > 0 && ` (${state.deductions.length})`}
          </button>
        </div>
      </div>

      {state.panel === 'phone' && <PhoneLock />}
      {state.panel === 'notebook' && <Notebook />}
      <ItemPopup />
    </div>
  );
}
