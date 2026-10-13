import { assetUrl } from '../assetUrl';
import { items } from '../data/items';
import { rooms } from '../data/rooms';
import { useGame } from '../state/GameContext';
import { ItemIcon } from './Inventory';
import { whereFound } from './whereFound';
import ZoomScreen from './ZoomScreen';

export default function ItemPopup() {
  const { state, dispatch } = useGame();
  const item = state.overlay ? items[state.overlay] : undefined;
  if (!item) return null;
  if (item.zoom) return <ZoomScreen item={item} />;

  const image = assetUrl(item.image);
  const close = () => dispatch({ type: 'CLOSE_OVERLAY' });
  const found = whereFound(item.id);
  const no = state.items.indexOf(item.id) + 1;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="popup-title" onClick={close}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <h2 id="popup-title" className="popup-name pix">{item.name}</h2>
        <div className="popup-art pix">{image ? <img src={image} alt="" /> : <ItemIcon id={item.id} />}</div>
        <div className="popup-meta">
          <span>{found ? `획득 장소 · ${rooms[found.room].name}, ${found.spot}` : ''}</span>
          {no > 0 && <span className="popup-no">No. {String(no).padStart(2, '0')}</span>}
        </div>
        <p className="popup-text pix">
          {item.text}
          {item.evidence && <span className="popup-tag">증거로 기록했다.</span>}
          {item.key && <span className="popup-tag">열쇠를 손에 넣었다.</span>}
        </p>
        <button className="pbtn pbtn-primary popup-close" onClick={close}>닫기</button>
      </div>
    </div>
  );
}
