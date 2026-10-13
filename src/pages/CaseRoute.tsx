import type { ComponentType } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCase } from '../cases';
import type { CaseData } from '../types';
import NotFound from './NotFound';

export interface CasePageProps {
  caseData: CaseData;
}

export default function CaseRoute({ page: Page }: { page: ComponentType<CasePageProps> }) {
  const { caseId } = useParams();
  const entry = caseId ? getCase(caseId) : undefined;
  if (!entry) return <NotFound />;
  if (entry.errors.length) {
    return (
      <Layout>
        <div className="panel">
          <h1>데이터 오류</h1>
          <p className="muted">사건 파일을 고쳐야 플레이할 수 있습니다.</p>
          <ul>{entry.errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      </Layout>
    );
  }
  return <Page key={entry.data.id} caseData={entry.data} />;
}
