import { clueSource, findClue } from '../engine/investigation';
import type { TabProps } from './TabProps';

export default function JournalTab({ caseData: c, progress, onChange }: TabProps) {
  return (
    <div className="journal">
      <section className="panel">
        <h2 style={{ marginTop: 0 }}>사건 브리핑</h2>
        <p className="prewrap" style={{ margin: 0 }}>{c.briefing}</p>
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0 }}>수집한 단서 ({progress.clues.length})</h2>
        {progress.clues.length === 0 ? (
          <p className="muted">아직 수집한 단서가 없습니다.</p>
        ) : (
          <ol className="clue-list">
            {progress.clues.map((id) => (
              <li key={id}>
                {findClue(c, id)?.text}
                <small className="muted">{clueSource(c, progress, id)}</small>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0 }}>메모장</h2>
        <textarea
          className="memo"
          value={progress.memo}
          placeholder="수사 메모를 입력하세요."
          onChange={(e) => onChange({ ...progress, memo: e.target.value })}
        />
      </section>
    </div>
  );
}
