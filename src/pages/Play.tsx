import type { CasePageProps } from './CaseRoute';

export default function Play({ caseData }: CasePageProps) {
  return <p>{caseData.title}</p>;
}
