import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { cases } from '../cases';
import { loadProgress } from '../engine/storage';
import type { CaseData } from '../types';

function statusOf(id: string): string | null {
  const p = loadProgress(id);
  if (!p) return null;
  return p.report ? '종결' : '수사 중';
}

function CardBody({ data, status }: { data: CaseData; status: string | null }) {
  return (
    <>
      <div className="card-meta">
        <span>{'★'.repeat(data.difficulty)}{'☆'.repeat(3 - data.difficulty)}</span>
        <span>제한 {data.timeLimitMinutes}분</span>
      </div>
      <h2>{data.title}</h2>
      <p className="muted">{data.summary}</p>
      {status && <span className="badge">{status}</span>}
    </>
  );
}

export default function CaseList() {
  return (
    <Layout>
      <section className="hero">
        <p className="eyebrow">CASE FILE</p>
        <h1>모든 진실은 현장에 숨겨져 있다</h1>
        <p className="muted">단서를 모으고, 용의자를 심문하고, 범인을 지목하라.</p>
      </section>
      {cases.length === 0 && <p className="muted center">아직 등록된 사건이 없습니다.</p>}
      <div className="case-grid">
        {cases.map(({ data, errors }) =>
          errors.length ? (
            <div key={data.id ?? data.title} className="case-card is-broken">
              <CardBody data={data} status="데이터 오류" />
            </div>
          ) : (
            <Link key={data.id} to={`/case/${data.id}`} className="case-card">
              <CardBody data={data} status={statusOf(data.id)} />
            </Link>
          ),
        )}
      </div>
    </Layout>
  );
}
