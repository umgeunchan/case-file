import { useState } from 'react';
import { suspects } from '../data/scenario';
import { usableEvidence } from '../state/game';
import { useGame } from '../state/GameContext';
import DialogBox from './DialogBox';
import EvidenceChip from './EvidenceChip';
import Panel from './Panel';
import Portrait from './Portrait';

export default function Interrogation() {
  const { state, dispatch } = useGame();
  const [choosing, setChoosing] = useState(false);
  const talk = state.interrogation;
  const suspect = suspects.find((s) => s.id === talk?.suspect);

  return (
    <Panel title="심문" className="panel-interrogation">
      <div className="suspect-row" role="tablist" aria-label="용의자">
        {suspects.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === suspect?.id}
            className={`suspect-pick ${s.id === suspect?.id ? 'is-active' : ''}`}
            onClick={() => {
              setChoosing(false);
              dispatch({ type: 'SELECT_SUSPECT', suspect: s.id });
            }}
          >
            <Portrait suspect={s} expr="normal" size="small" />
            <span className="suspect-relation">{s.relation}</span>
          </button>
        ))}
      </div>

      {!suspect || !talk ? (
        <p className="muted-text interrogation-empty">심문할 용의자를 고르자.</p>
      ) : (
        <div className="interrogation-stage">
          <div className="suspect-profile">
            <Portrait suspect={suspect} expr={talk.line.expr} />
            <dl className="profile-list">
              <dt>관계</dt><dd>{suspect.relation} ({suspect.age})</dd>
              <dt>동기</dt><dd>{suspect.motive ?? '???'}</dd>
            </dl>
          </div>
          <DialogBox speaker={suspect.name} text={talk.line.text} replayKey={talk.seq} />

          {choosing ? (
            <div className="present-picker">
              <div className="present-head">
                <span>무엇을 제시할까?</span>
                <button className="link-btn" onClick={() => setChoosing(false)}>취소</button>
              </div>
              <div className="ev-grid">
                {usableEvidence(state).length === 0 && <p className="muted-text">제시할 증거가 없다.</p>}
                {usableEvidence(state).map((id) => (
                  <EvidenceChip
                    key={id}
                    id={id}
                    onClick={() => {
                      dispatch({ type: 'PRESENT', evidence: id });
                      setChoosing(false);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <button className="pbtn pbtn-primary present-btn" onClick={() => setChoosing(true)}>증거 제시</button>
          )}
        </div>
      )}
    </Panel>
  );
}
