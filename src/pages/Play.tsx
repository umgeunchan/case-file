import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import InterrogateTab from '../components/InterrogateTab';
import InvestigateTab from '../components/InvestigateTab';
import JournalTab from '../components/JournalTab';
import { formatTime, remainingSeconds, shouldWarn } from '../engine/timer';
import { useNow } from '../hooks/useNow';
import { useProgress } from '../hooks/useProgress';
import type { CasePageProps } from './CaseRoute';

type Tab = 'investigate' | 'interrogate' | 'journal';

export default function Play({ caseData: c }: CasePageProps) {
  const [progress, setProgress] = useProgress(c);
  const now = useNow();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('investigate');
  const [showBriefing, setShowBriefing] = useState(
    () => !!progress && progress.inspectedItems.length === 0 && progress.askedDialogues.length === 0,
  );
  const [warningDismissed, setWarningDismissed] = useState(false);

  const remaining = progress ? remainingSeconds(c, progress, now) : 0;
  const timeUp = !!progress && !progress.report && remaining === 0;

  useEffect(() => {
    if (timeUp) navigate(`/case/${c.id}/report`, { replace: true });
  }, [timeUp, navigate, c.id]);

  if (!progress) return <Navigate to={`/case/${c.id}`} replace />;
  if (progress.report) return <Navigate to={`/case/${c.id}/result`} replace />;

  const finish = () => {
    if (window.confirm('수사를 종결하고 보고서를 작성하시겠습니까?')) navigate(`/case/${c.id}/report`);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'investigate', label: '현장 조사' },
    { id: 'interrogate', label: '용의자 심문' },
    { id: 'journal', label: `수사 일지 (${progress.clues.length})` },
  ];
  const tabProps = { caseData: c, progress, onChange: setProgress };

  return (
    <div className="app">
      <div className="playbar">
        <Link to={`/case/${c.id}`} className="back">← {c.title}</Link>
        <span className={`timer ${remaining <= 600 ? 'is-low' : ''}`} aria-label="남은 시간">
          {formatTime(remaining)}
        </span>
        <button className="btn btn-primary" onClick={finish}>수사 종결</button>
      </div>

      {shouldWarn(c, remaining) && !warningDismissed && (
        <div className="banner" role="alert">
          <span>제한 시간이 10분 남았습니다. 범인을 특정했다면 수사를 종결하세요.</span>
          <button className="btn" onClick={() => setWarningDismissed(true)}>확인</button>
        </div>
      )}

      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="play-body">
        {tab === 'investigate' && <InvestigateTab {...tabProps} />}
        {tab === 'interrogate' && <InterrogateTab {...tabProps} />}
        {tab === 'journal' && <JournalTab {...tabProps} />}
      </div>

      {showBriefing && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="panel">
            <p className="eyebrow">새로운 사건 의뢰가 들어왔습니다</p>
            <h2>{c.title}</h2>
            <p className="prewrap">{c.briefing}</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => setShowBriefing(false)}>수사를 시작합니다</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
