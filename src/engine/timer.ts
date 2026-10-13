import type { CaseData, Progress } from '../types';

export function remainingSeconds(c: CaseData, p: Progress, now: number): number {
  const end = p.finishedAt ?? now;
  const left = c.timeLimitMinutes * 60 - (end - p.startedAt) / 1000;
  return Math.max(0, Math.ceil(left));
}

export function shouldWarn(c: CaseData, remaining: number): boolean {
  return c.timeLimitMinutes > 10 && remaining > 0 && remaining <= 600;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
