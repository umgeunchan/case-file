import type { CaseData, Progress } from '../types';

export type Grade = 'S' | 'A' | 'B' | 'C';

export interface ScoreResult {
  total: number;
  grade: Grade;
  culpritCorrect: boolean;
  motiveCorrect: boolean;
  methodCorrect: boolean;
  keyCluesFound: number;
  keyCluesTotal: number;
  missedKeyClues: number;
}

export function gradeFor(total: number): Grade {
  if (total >= 90) return 'S';
  if (total >= 75) return 'A';
  if (total >= 50) return 'B';
  return 'C';
}

export function score(c: CaseData, p: Progress): ScoreResult | null {
  const report = p.report;
  if (!report) return null;

  const culpritCorrect = report.culpritId === c.solution.culpritId;
  const motiveCorrect = report.motive === c.solution.motive.answer;
  const methodCorrect = report.method === c.solution.method.answer;

  const keyClues = c.clues.filter((clue) => clue.isKey);
  const keyCluesFound = keyClues.filter((clue) => p.clues.includes(clue.id)).length;
  const keyCluesTotal = keyClues.length;
  const clueScore = keyCluesTotal === 0 ? 10 : Math.round((10 * keyCluesFound) / keyCluesTotal);

  const total =
    (culpritCorrect ? 50 : 0) + (motiveCorrect ? 20 : 0) + (methodCorrect ? 20 : 0) + clueScore;

  return {
    total,
    grade: culpritCorrect ? gradeFor(total) : 'C',
    culpritCorrect,
    motiveCorrect,
    methodCorrect,
    keyCluesFound,
    keyCluesTotal,
    missedKeyClues: keyCluesTotal - keyCluesFound,
  };
}
