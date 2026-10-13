import type { CasePageProps } from './CaseRoute';

export default function Report({ caseData }: CasePageProps) {
  return <p>{caseData.title}</p>;
}
