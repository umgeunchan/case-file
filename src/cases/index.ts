import type { CaseData } from '../types';
import { validateCase } from '../engine/validateCase';

export interface CaseEntry {
  data: CaseData;
  errors: string[];
}

const modules = import.meta.glob<{ default: CaseData }>('./*.json', { eager: true });

export const cases: CaseEntry[] = Object.entries(modules)
  .map(([path, mod]) => {
    const errors = validateCase(mod.default);
    if (errors.length) console.error(`[case-file] ${path} 데이터 오류:\n- ${errors.join('\n- ')}`);
    return { data: mod.default, errors };
  })
  .sort((a, b) => String(a.data.title).localeCompare(String(b.data.title), 'ko'));

export function getCase(id: string): CaseEntry | undefined {
  return cases.find((entry) => entry.data.id === id);
}
