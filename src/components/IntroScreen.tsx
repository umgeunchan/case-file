import { assetUrl } from '../assetUrl';
import { scenario } from '../data/scenario';
import { useGame } from '../state/GameContext';
import DialogBox from './DialogBox';

export default function IntroScreen() {
  const { state, dispatch } = useGame();
  return (
    <div className="intro-screen">
      <div className="intro-head">
        <span className="intro-step">{state.introIndex + 1} / {scenario.intro.length}</span>
        <button className="link-btn" onClick={() => dispatch({ type: 'SKIP_INTRO' })}>건너뛰기</button>
      </div>
      <div className="intro-art">
        {assetUrl(scenario.victim.image) && <img src={assetUrl(scenario.victim.image)} alt={`피해자 ${scenario.victim.name}`} />}
        <span className="intro-caption">피해자 · {scenario.victim.name} ({scenario.victim.age})</span>
      </div>
      <DialogBox
        speaker="사건 개요"
        text={scenario.intro[state.introIndex]}
        onAdvance={() => dispatch({ type: 'NEXT_INTRO' })}
        className="dialog-intro"
      />
    </div>
  );
}
