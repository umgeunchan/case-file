import { assetUrl } from '../assetUrl';
import { items } from '../data/items';
import { useGame } from '../state/GameContext';

export function ItemIcon({ id }: { id: string }) {
  const item = items[id];
  const src = assetUrl(item?.image);
  if (src) return <img className="item-icon" src={src} alt="" />;
  return <span className="item-icon is-placeholder" aria-hidden="true">{item?.name.slice(0, 1)}</span>;
}

export default function Inventory() {
  const { state, dispatch } = useGame();
  return (
    <div className="inventory" aria-label="인벤토리">
      {state.items.length === 0 && <span className="inventory-empty">아직 수집한 증거가 없다.</span>}
      {state.items.map((id) => (
        <button
          key={id}
          type="button"
          className={`inv-slot ${items[id].key ? 'is-key' : ''}`}
          onClick={() => dispatch({ type: 'VIEW_ITEM', item: id })}
          title={items[id].name}
        >
          <ItemIcon id={id} />
          <span className="inv-name">{items[id].name}</span>
        </button>
      ))}
    </div>
  );
}
