import type { CaseData, Progress } from '../types';

export interface TabProps {
  caseData: CaseData;
  progress: Progress;
  onChange: (p: Progress) => void;
}
