import { useCallback, useState } from 'react';
import type { CaseData, Progress } from '../types';
import { sanitizeProgress } from '../engine/investigation';
import { clearProgress, loadProgress, saveProgress } from '../engine/storage';

export function useProgress(c: CaseData) {
  const [progress, setProgress] = useState<Progress | null>(() => {
    const saved = loadProgress(c.id);
    return saved ? sanitizeProgress(c, saved) : null;
  });

  const update = useCallback(
    (next: Progress | null) => {
      setProgress(next);
      if (next) saveProgress(next);
      else clearProgress(c.id);
    },
    [c.id],
  );

  return [progress, update] as const;
}
