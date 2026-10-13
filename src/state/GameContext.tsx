import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { gameReducer, initialState, type GameAction, type GameState } from './game';
import { saveGame } from './save';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children, initial = initialState }: { children: ReactNode; initial?: GameState }) {
  const [state, dispatch] = useReducer(gameReducer, initial);
  // 상태가 바뀔 때마다 진행 상황을 저장한다 (타이틀 화면 제외)
  useEffect(() => saveGame(state), [state]);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error('useGame must be used inside GameProvider');
  return value;
}
