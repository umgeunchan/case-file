import { assetUrl } from '../assetUrl';
import { rooms } from '../data/rooms';
import { useGame } from '../state/GameContext';

export default function RoomView({ debug = false }: { debug?: boolean }) {
  const { state, dispatch } = useGame();
  const room = rooms[state.room];
  const background = assetUrl(room.background);

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
          <img className="stage-bg" src={background} alt={room.name} />
        ) : (
          <span className="stage-watermark" aria-hidden="true">{room.name}</span>
        )}
        {room.hotspots.map((h) => (
          <button
            key={h.id}
            type="button"
            className={`hotspot ${state.checked.includes(h.id) ? 'is-checked' : ''}`}
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
            aria-label={h.label}
            onClick={() => dispatch({ type: 'TOUCH', hotspot: h.id })}
          >
            <span className="hotspot-label">{debug ? h.id : h.label}</span>
            {state.checked.includes(h.id) && <span className="hotspot-check" aria-hidden="true">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
