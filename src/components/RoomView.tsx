import { useState } from 'react';
import { assetUrl } from '../assetUrl';
import { rooms } from '../data/rooms';
import { useGame } from '../state/GameContext';

export default function RoomView({ debug = false }: { debug?: boolean }) {
  const { state, dispatch } = useGame();
  const room = rooms[state.room];
  const background = assetUrl(room.background);
  const [selected, setSelected] = useState<string | null>(null);
  const found = room.hotspots.filter((h) => state.checked.includes(h.id)).length;
  const sel = room.hotspots.find((h) => h.id === selected);

  return (
    <div className="stage-wrap">
      <div
        className={`stage ${background ? 'has-art' : ''} ${debug ? 'is-debug' : ''}`}
        style={{
          ['--room-base' as string]: room.colors.base,
          ['--room-accent' as string]: room.colors.accent,
          ['--room-text' as string]: room.colors.text,
        }}
      >
        {background ? (
          <img className="stage-bg" src={background} alt={`${room.name} 전경`} />
        ) : (
          <span className="stage-watermark" aria-hidden="true">{room.name}</span>
        )}

        <span className="stage-badge pix">{room.name}</span>
        <span className="stage-badge stage-badge-right pix">단서 {found}/{room.hotspots.length}</span>

        {room.hotspots.map((h) => (
          <button
            key={h.id}
            type="button"
            className={`hotspot ${state.checked.includes(h.id) ? 'is-checked' : ''}`}
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
            aria-label={`${h.label} 조사하기`}
            onClick={() => {
              setSelected(h.id);
              dispatch({ type: 'TOUCH', hotspot: h.id });
            }}
          >
            <span className="hotspot-label">{debug ? h.id : h.label}</span>
            {state.checked.includes(h.id) && <span className="hotspot-check" aria-hidden="true" />}
          </button>
        ))}

        {sel && (
          <div
            key={`${room.id}:${sel.id}`}
            className="hotspot-select"
            style={{ left: `${sel.x}%`, top: `${sel.y}%`, width: `${sel.w}%`, height: `${sel.h}%` }}
            aria-hidden="true"
          >
            <i /><i /><i /><i />
          </div>
        )}
      </div>
    </div>
  );
}
