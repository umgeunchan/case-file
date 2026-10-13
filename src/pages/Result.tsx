import { Link, Navigate, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { newProgress } from '../engine/investigation';
import { score } from '../engine/scoring';
import { useProgress } from '../hooks/useProgress';
import type { CasePageProps } from './CaseRoute';

function Row({ label, mine, answer, ok }: { label: string; mine?: string; answer?: string; ok: boolean }) {
  return (
    <tr>
      <th>{label}</th>
      <td>
        <span className={ok ? 'ok' : 'ng'}>{ok ? '✓' : '✗'}</span> {mine ?? '-'}
        {!ok && <div className="muted">정답: {answer}</div>}
      </td>
    </tr>
  );
}

export default function Result({ caseData: c }: CasePageProps) {
  const [progress, setProgress] = useProgress(c);
  const navigate = useNavigate();

  if (!progress) return <Navigate to={`/case/${c.id}`} replace />;
  const result = score(c, progress);
  const report = progress.report;
  if (!result || !report) return <Navigate to={`/case/${c.id}/play`} replace />;

  const nameOf = (id: string) => c.suspects.find((s) => s.id === id)?.name;
  const { motive, method } = c.solution;

  const restart = () => {
    if (!window.confirm('처음부터 다시 수사하시겠습니까?')) return;
    setProgress(newProgress(c.id, Date.now()));
    navigate(`/case/${c.id}/play`);
  };

  return (
    <Layout>
      <article className="panel">
        <p className="stamp">{result.culpritCorrect ? 'CASE CLOSED' : 'UNSOLVED'}</p>
        <h1>{result.culpritCorrect ? '사건을 해결했습니다!' : '범인 검거 실패'}</h1>

        <div className="grade">
          <span className={`grade-letter grade-${result.grade}`}>{result.grade}</span>
          <span>{result.total}점 / 100</span>
        </div>

        <table className="score-table">
          <tbody>
            <Row label="범인" mine={nameOf(report.culpritId)} answer={nameOf(c.solution.culpritId)} ok={result.culpritCorrect} />
            <Row label="동기" mine={motive.options[report.motive]} answer={motive.options[motive.answer]} ok={result.motiveCorrect} />
            <Row label="수법" mine={method.options[report.method]} answer={method.options[method.answer]} ok={result.methodCorrect} />
            {result.keyCluesTotal > 0 && (
              <tr>
                <th>핵심 단서</th>
                <td>{result.keyCluesFound} / {result.keyCluesTotal}</td>
              </tr>
            )}
          </tbody>
        </table>

        {result.missedKeyClues > 0 && <p className="hint">핵심 단서 {result.missedKeyClues}개를 놓쳤습니다.</p>}

        <h2>사건의 진상</h2>
        <p className="prewrap">{c.solution.explanation}</p>

        <div className="actions">
          <button className="btn btn-primary" onClick={restart}>재수사하기</button>
          <Link className="btn" to="/">사건 목록</Link>
        </div>
      </article>
    </Layout>
  );
}
