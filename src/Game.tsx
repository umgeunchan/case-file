import EndingScreen from './components/EndingScreen';
import GameScreen from './components/GameScreen';
import IntroScreen from './components/IntroScreen';
import TitleScreen from './components/TitleScreen';
import { GameProvider, useGame } from './state/GameContext';

const debug = new URLSearchParams(window.location.search).get('debug') === '1';

function Screens() {
  const { state } = useGame();
  switch (state.screen) {
    case 'title':
      return <TitleScreen />;
    case 'intro':
      return <IntroScreen />;
    case 'ending':
      return <EndingScreen />;
    default:
      return <GameScreen debug={debug} />;
  }
}

export default function Game() {
  return (
    <GameProvider>
      <div className="frame">
        <Screens />
      </div>
    </GameProvider>
  );
}
