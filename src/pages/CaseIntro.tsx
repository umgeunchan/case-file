import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { newProgress } from '../engine/investigation';
import { useProgress } from '../hooks/useProgress';
import type { CasePageProps } from './CaseRoute';

export default function CaseIntro({ caseData: c }: CasePageProps) {
  const [progress, setProgress] = useProgress(c);
  const navigate = useNavigate();

  const start = () => {
    setProgress(newProgress(c.id, Date.now()));
    navigate(`/case/${c.id}/play`);
  };
  const restart = () => {
    if (window.confirm('진행 상황이 모두 삭제됩니다. 처음부터 다시 수사하시겠습니까?')) start();
  };

  return (
    <Layout>
      <article className="panel dossier">
        <div className="card-meta">
          <span>난이도 {'★'.repeat(c.difficulty)}{'☆'.repeat(3 - c.difficulty)}</span>
          <span>제한 시간 {c.timeLimitMinutes}분</span>
        </div>
        <h1>{c.title}</h1>
        {c.coverImage && <img className="cover" src={c.coverImage} alt="" />}
        <p className="prewrap">{c.summary}</p>

        <h2>용의자</h2>
        <ul className="suspect-grid">
          {c.suspects.map((s) => (
            <li key={s.id} className="suspect-card">
              {s.image && <img src={s.image} alt="" />}
              <strong>{s.name}</strong>
              <p className="muted">{s.profile}</p>
            </li>
          ))}
        </ul>

        <h2>수사 규칙</h2>
        <ul className="rules">
          <li>제한 시간 {c.timeLimitMinutes}분 안에 사건을 해결하세요. 시간이 끝나면 바로 보고서를 작성해야 합니다.</li>
          <li>현장을 조사해 단서를 모으면 용의자에게 새로운 질문을 할 수 있습니다.</li>
          <li>범인, 동기, 수법을 맞히고 핵심 단서를 많이 찾을수록 높은 등급을 받습니다.</li>
        </ul>

        <div className="actions">
          {!progress && <button className="btn btn-primary" onClick={start}>수사 개시</button>}
          {progress && !progress.report && (
            <button className="btn btn-primary" onClick={() => navigate(`/case/${c.id}/play`)}>이어서 수사</button>
          )}
          {progress?.report && (
            <button className="btn btn-primary" onClick={() => navigate(`/case/${c.id}/result`)}>결과 보기</button>
          )}
          {progress && <button className="btn" onClick={restart}>재수사하기</button>}
        </div>
      </article>
    </Layout>
  );
}
