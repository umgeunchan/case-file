import { useState } from 'react';
import { scenario } from '../data/scenario';
import { useGame } from '../state/GameContext';
import { loadGame } from '../state/save';

export default function TitleScreen() {
  const { dispatch } = useGame();
  const [saved] = useState(() => loadGame());

  const start = () => {
    if (saved && !window.confirm('진행 중인 기록이 지워집니다. 처음부터 시작할까요?')) return;
    dispatch({ type: 'NEW_GAME' });
  };

  return (
    <div className="title-screen">
      <p className="title-eyebrow">CASE FILE</p>
      <h1 className="title-name">{scenario.title}</h1>
      <div className="title-actions">
        {saved && (
          <button className="pbtn pbtn-primary" onClick={() => dispatch({ type: 'LOAD', state: saved })}>이어하기</button>
        )}
        <button className={`pbtn ${saved ? '' : 'pbtn-primary'}`} onClick={start}>{saved ? '처음부터' : '시작하기'}</button>
      </div>
    </div>
  );
}
