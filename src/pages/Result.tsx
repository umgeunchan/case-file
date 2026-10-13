import type { CasePageProps } from './CaseRoute';

export default function Result({ caseData }: CasePageProps) {
  return <p>{caseData.title}</p>;
}
