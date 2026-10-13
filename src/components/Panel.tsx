import type { ReactNode } from 'react';
import { useGame } from '../state/GameContext';

/** 노트·심문처럼 게임 화면 위에 덮이는 전체 화면 패널 */
export default function Panel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  const { dispatch } = useGame();
  return (
    <section className={`panel-screen ${className ?? ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <header className="zoom-head">
        <button className="zoom-back pix" onClick={() => dispatch({ type: 'CLOSE_PANEL' })}>◀ 돌아가기</button>
        <h2 className="zoom-heading">{title}</h2>
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}
