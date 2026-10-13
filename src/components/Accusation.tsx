import { useState } from 'react';
import { slotCount } from '../data/endings';
import { suspects } from '../data/scenario';
import type { SuspectId } from '../data/types';
import { usableEvidence } from '../state/game';
import { useGame } from '../state/GameContext';
import EvidenceChip, { evidenceName } from './EvidenceChip';
import Panel from './Panel';
import Portrait from './Portrait';

export default function Accusation() {
  const { state, dispatch } = useGame();
  const [suspect, setSuspect] = useState<SuspectId | null>(null);
  const [slots, setSlots] = useState<(string | null)[]>(() => Array(slotCount).fill(null));
  const usable = usableEvidence(state);
  const filled = slots.filter((x): x is string => x !== null);

  const addEvidence = (id: string) => {
    if (slots.includes(id)) return setSlots((s) => s.map((x) => (x === id ? null : x)));
    const empty = slots.indexOf(null);
    if (empty === -1) return;
    setSlots((s) => s.map((x, i) => (i === empty ? id : x)));
  };

  const submit = () => {
    if (!suspect || filled.length !== slotCount) return;
    dispatch({ type: 'ACCUSE', suspect, evidence: filled });
  };

  return (
    <Panel title="범인 지목" className="panel-accusation">
      <p className="hint-text">범인을 지목하고, 결정적인 증거 {slotCount}개를 제출하자. 증거 대신 추리 결과도 낼 수 있다.</p>

      <h3 className="section-label">범인</h3>
      <div className="suspect-row">
        {suspects.map((s) => (
          <button
            key={s.id}
            className={`suspect-pick ${suspect === s.id ? 'is-active is-accused' : ''}`}
            aria-pressed={suspect === s.id}
            onClick={() => setSuspect(s.id)}
          >
            <Portrait suspect={s} expr="normal" size="small" />
            <span className="suspect-relation">{s.relation}</span>
          </button>
        ))}
      </div>

      <h3 className="section-label">증거</h3>
      <div className="slot-row">
        {slots.map((id, i) => (
          <button
            key={i}
            className={`evidence-slot ${id ? 'is-filled' : ''}`}
            onClick={() => id && setSlots((s) => s.map((x, j) => (j === i ? null : x)))}
            aria-label={id ? `${evidenceName(id)} 빼기` : `빈 슬롯 ${i + 1}`}
          >
            {id ? evidenceName(id) : `슬롯 ${i + 1}`}
          </button>
        ))}
      </div>

      {state.accuseNotice && (
        <p key={state.accuseNotice.seq} className="combine-result is-fail accuse-notice" role="alert">{state.accuseNotice.text}</p>
      )}

      <div className="ev-grid accuse-grid">
        {usable.map((id) => (
          <EvidenceChip key={id} id={id} selected={slots.includes(id)} onClick={() => addEvidence(id)} />
        ))}
      </div>

      <div className="combine-bar">
        <span className="combine-slots">{suspect ? `${suspects.find((s) => s.id === suspect)!.name} · ` : ''}{filled.length}/{slotCount}</span>
        <button className="pbtn pbtn-primary" disabled={!suspect || filled.length !== slotCount} onClick={submit}>지목하기</button>
      </div>
    </Panel>
  );
}
