import { useState } from 'react';
import { deductions } from '../data/deductions';
import { usableEvidence } from '../state/game';
import { useGame } from '../state/GameContext';
import EvidenceChip from './EvidenceChip';
import Panel from './Panel';

export default function Notebook() {
  const { state, dispatch } = useGame();
  const [picked, setPicked] = useState<string[]>([]);
  const usable = usableEvidence(state);
  const result = state.notebookResult;

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 2 ? [...p, id] : [p[1], id]));

  const combine = () => {
    if (picked.length !== 2) return;
    dispatch({ type: 'COMBINE', a: picked[0], b: picked[1] });
    setPicked([]);
  };

  return (
    <Panel title="추리 노트" className="panel-notebook">
      <p className="hint-text">증거 두 개를 골라 연결점을 찾자. 추리 결과끼리도 조합할 수 있다.</p>
      <div className="ev-grid">
        {usable.length === 0 && <p className="muted-text">아직 조합할 증거가 없다.</p>}
        {usable.map((id) => (
          <EvidenceChip key={id} id={id} selected={picked.includes(id)} onClick={() => toggle(id)} />
        ))}
      </div>

      <div className="combine-bar">
        <span className="combine-slots">{picked.length === 0 ? '두 개를 고르세요' : picked.length === 1 ? '하나 더 고르세요' : '조합할 준비가 됐다'}</span>
        <button className="pbtn pbtn-primary" disabled={picked.length !== 2} onClick={combine}>조합하기</button>
      </div>

      {result && (
        <p key={result.seq} className={`combine-result ${result.success ? 'is-success' : 'is-fail'}`} role="status">
          {result.text}
        </p>
      )}

      <h3 className="notebook-heading">추리 기록 ({state.deductions.length})</h3>
      {state.deductions.length === 0 ? (
        <p className="muted-text">아직 기록된 추리가 없다.</p>
      ) : (
        <ol className="deduction-list">
          {state.deductions.map((id) => (
            <li key={id}>
              <strong>{deductions[id].title}</strong>
              <span>{deductions[id].text}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
