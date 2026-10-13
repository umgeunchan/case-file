import { useState } from 'react';
import { assetUrl } from '../assetUrl';
import { items } from '../data/items';
import { useGame } from '../state/GameContext';
import { ItemIcon } from './Inventory';

function ZoomText({ text }: { text: string }) {
  return (
    <ul className="zoom-lines">
      {text.split(' / ').map((line) => <li key={line}>{line}</li>)}
    </ul>
  );
}

function FlipCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flip">
      <div className={`flip-inner ${flipped ? 'is-flipped' : ''}`}>
        <div className="flip-face flip-front"><p>{front}</p></div>
        <div className="flip-face flip-back"><p>{back}</p></div>
      </div>
      <button className="pbtn" onClick={() => setFlipped((f) => !f)}>{flipped ? '앞면 보기' : '뒤집어 보기'}</button>
    </div>
  );
}

export default function ItemPopup() {
  const { state, dispatch } = useGame();
  const item = state.overlay ? items[state.overlay] : undefined;
  if (!item) return null;
  const image = assetUrl(item.image);
  const close = () => dispatch({ type: 'CLOSE_OVERLAY' });

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={item.name} onClick={close}>
      <div className={`popup popup-${item.view}`} onClick={(e) => e.stopPropagation()}>
        {item.view !== 'zoom' && item.view !== 'flip' && (
          <div className="popup-art">{image ? <img src={image} alt="" /> : <ItemIcon id={item.id} />}</div>
        )}
        <h2 className="popup-name">{item.name}</h2>
        {item.evidence && <span className="popup-tag">증거</span>}
        {item.key && <span className="popup-tag is-key">열쇠</span>}
        {item.view === 'zoom' && <ZoomText text={item.text} />}
        {item.view === 'flip' && <FlipCard front={item.frontText ?? item.name} back={item.text} />}
        {(item.view === 'popup' || item.view === 'dialog') && <p className="popup-text">{item.text}</p>}
        <button className="pbtn pbtn-primary popup-close" onClick={close}>닫기</button>
      </div>
    </div>
  );
}
