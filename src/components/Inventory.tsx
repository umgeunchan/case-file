import { assetUrl } from '../assetUrl';
import { items } from '../data/items';
import { useGame } from '../state/GameContext';

export function ItemIcon({ id }: { id: string }) {
  const item = items[id];
  const src = assetUrl(item?.image);
  if (src) return <img className="item-icon" src={src} alt="" />;
  return <span className="item-icon is-placeholder" aria-hidden="true">{item?.name.slice(0, 1)}</span>;
}

const MIN_SLOTS = 6;

/** 하단 증거품 칸. 6칸을 기본으로 보여 주고, 넘치면 옆으로 스크롤된다 */
export default function Inventory() {
  const { state, dispatch } = useGame();
  const empty = Math.max(0, MIN_SLOTS - state.items.length);
  return (
    <div className="inventory" aria-label="증거품">
      {state.items.map((id) => (
        <button
          key={id}
          type="button"
          className={`inv-slot pix ${items[id].key ? 'is-key' : ''}`}
          onClick={() => dispatch({ type: 'VIEW_ITEM', item: id })}
          aria-label={`${items[id].name} 보기`}
        >
          <ItemIcon id={id} />
          <span className="inv-name">{items[id].short ?? items[id].name}</span>
        </button>
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`empty-${i}`} className="inv-slot pix is-empty" aria-hidden="true">{state.items.length + i + 1}</span>
      ))}
    </div>
  );
}
