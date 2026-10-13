import type { ReactNode } from 'react';
import { useGame } from '../state/GameContext';

export default function Panel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  const { dispatch } = useGame();
  return (
    <section className={`panel-screen ${className ?? ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <header className="panel-head">
        <h2>{title}</h2>
        <button className="pbtn panel-close" onClick={() => dispatch({ type: 'CLOSE_PANEL' })} aria-label="닫기">✕</button>
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}
