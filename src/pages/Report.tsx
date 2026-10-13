import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { formatTime, remainingSeconds } from '../engine/timer';
import { useProgress } from '../hooks/useProgress';
import type { CasePageProps } from './CaseRoute';

function Choices({ name, options, value, onChange }: {
  name: string; options: string[]; value: number | null; onChange: (i: number) => void;
}) {
  return (
    <>
      {options.map((text, i) => (
        <label key={i} className="choice">
          <input type="radio" name={name} checked={value === i} onChange={() => onChange(i)} />
          <span>{text}</span>
        </label>
      ))}
    </>
  );
}

export default function Report({ caseData: c }: CasePageProps) {
  const [progress, setProgress] = useProgress(c);
  const navigate = useNavigate();
  const [culpritId, setCulpritId] = useState<string | null>(null);
  const [motive, setMotive] = useState<number | null>(null);
  const [method, setMethod] = useState<number | null>(null);
  const [openedAt] = useState(() => Date.now());

  if (!progress) return <Navigate to={`/case/${c.id}`} replace />;
  if (progress.report) return <Navigate to={`/case/${c.id}/result`} replace />;

  const remaining = remainingSeconds(c, progress, openedAt);
  const ready = culpritId !== null && motive !== null && method !== null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (culpritId === null || motive === null || method === null) return;
    if (!window.confirm('보고서를 제출하면 수정할 수 없습니다. 제출하시겠습니까?')) return;
    setProgress({ ...progress, report: { culpritId, motive, method }, finishedAt: Date.now() });
    navigate(`/case/${c.id}/result`);
  };

  return (
    <Layout>
      <form className="panel" onSubmit={submit}>
        <div className="report-head">
          <h1>수사결과보고서</h1>
          <span className={`timer ${remaining === 0 ? 'is-low' : ''}`}>
            {remaining > 0 ? `남은 시간 ${formatTime(remaining)}` : '제한 시간 종료'}
          </span>
        </div>
        <p className="muted">지금까지 수집한 단서를 바탕으로 범인을 지목하고 사건을 재구성하세요.</p>

        <fieldset>
          <legend>1. 범인은 누구인가?</legend>
          {c.suspects.map((s) => (
            <label key={s.id} className="choice">
              <input type="radio" name="culprit" checked={culpritId === s.id} onChange={() => setCulpritId(s.id)} />
              <span>{s.name} <small className="muted">— {s.profile}</small></span>
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>2. 동기는 무엇인가?</legend>
          <Choices name="motive" options={c.solution.motive.options} value={motive} onChange={setMotive} />
        </fieldset>

        <fieldset>
          <legend>3. 어떻게 범행했는가?</legend>
          <Choices name="method" options={c.solution.method.options} value={method} onChange={setMethod} />
        </fieldset>

        <div className="actions">
          {remaining > 0 && <Link className="btn" to={`/case/${c.id}/play`}>수사로 돌아가기</Link>}
          <button className="btn btn-primary" type="submit" disabled={!ready}>보고서 제출</button>
        </div>
      </form>
    </Layout>
  );
}
