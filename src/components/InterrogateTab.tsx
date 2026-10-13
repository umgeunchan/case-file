import { useState } from 'react';
import { askDialogue, findClue, getAvailableDialogues } from '../engine/investigation';
import type { Dialogue } from '../types';
import type { TabProps } from './TabProps';

export default function InterrogateTab({ caseData: c, progress, onChange }: TabProps) {
  const [suspectId, setSuspectId] = useState(c.suspects[0]?.id);
  const suspect = c.suspects.find((s) => s.id === suspectId);

  const transcript = progress.askedDialogues
    .map((id) => c.dialogues.find((d) => d.id === id))
    .filter((d): d is Dialogue => !!d && d.suspectId === suspectId);
  const available = suspect ? getAvailableDialogues(c, progress, suspect.id) : [];

  return (
    <div className="split">
      <nav className="sidebar" aria-label="용의자">
        {c.suspects.map((s) => (
          <button
            key={s.id}
            className={`side-btn ${s.id === suspectId ? 'is-active' : ''}`}
            onClick={() => setSuspectId(s.id)}
          >
            {s.name}
            {getAvailableDialogues(c, progress, s.id).length > 0 && <small>●</small>}
          </button>
        ))}
      </nav>

      {suspect && (
        <section className="panel">
          <header className="suspect-head">
            {suspect.image && <img src={suspect.image} alt="" />}
            <div>
              <h2>{suspect.name}</h2>
              <p className="muted" style={{ margin: 0 }}>{suspect.profile}</p>
            </div>
          </header>

          <div className="transcript">
            {transcript.length === 0 && <p className="muted">아직 심문 기록이 없습니다.</p>}
            {transcript.map((d) => (
              <div key={d.id} className="qa">
                <p className="qa-q">Q. {d.question}</p>
                <p className="qa-a prewrap">{d.answer}</p>
                {d.givesClues?.map((id) => (
                  <p key={id} className="hint" style={{ marginTop: 6 }}>단서 획득: {findClue(c, id)?.text}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="questions">
            {available.length === 0 ? (
              <p className="hint">지금은 더 물어볼 것이 없다. 단서를 더 찾아보자.</p>
            ) : (
              available.map((d) => (
                <button key={d.id} className="btn" onClick={() => onChange(askDialogue(progress, d))}>
                  ▶ {d.question}
                </button>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
