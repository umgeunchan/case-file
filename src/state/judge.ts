import { categories, culprit, slotCount } from '../data/endings';
import type { SuspectId } from '../data/types';

export type Verdict = 'correct' | 'insufficient' | 'wrong';

/** 범인이 맞고, 서로 다른 증거 3개가 모든 범주를 하나씩 충족하면 정답 */
export function judge(suspect: SuspectId, evidence: string[]): Verdict {
  if (suspect !== culprit) return 'wrong';
  if (evidence.length !== slotCount || new Set(evidence).size !== slotCount) return 'insufficient';
  const covered = categories.every((c) => evidence.some((id) => c.accepted.includes(id)));
  return covered ? 'correct' : 'insufficient';
}
