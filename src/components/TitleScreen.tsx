import { scenario } from '../data/scenario';
import { useGame } from '../state/GameContext';

export default function TitleScreen() {
  const { dispatch } = useGame();
  return (
    <div className="title-screen">
      <p className="title-eyebrow">CASE FILE</p>
      <h1 className="title-name">{scenario.title}</h1>
      <div className="title-actions">
        <button className="pbtn pbtn-primary" onClick={() => dispatch({ type: 'NEW_GAME' })}>시작하기</button>
      </div>
    </div>
  );
}
