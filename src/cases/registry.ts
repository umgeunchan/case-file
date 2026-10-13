import type { CaseData } from '../types';
import { validateCase } from '../engine/validateCase';

export interface CaseEntry {
  key: string;
  title: string;
  data: CaseData;
  errors: string[];
}

export function buildRegistry(modules: Record<string, { default: unknown }>): CaseEntry[] {
  const seen = new Set<string>();
  return Object.entries(modules)
    .map(([key, mod]) => {
      const raw = mod.default as Partial<CaseData> | null;
      const errors = validateCase(raw);
      const id = typeof raw?.id === 'string' ? raw.id : '';
      if (id && seen.has(id)) errors.push(`다른 사건 파일과 id '${id}'가 겹칩니다.`);
      if (id) seen.add(id);
      const title = typeof raw?.title === 'string' ? raw.title : `알 수 없는 사건 (${key})`;
      if (errors.length) console.error(`[case-file] ${key} 데이터 오류:\n- ${errors.join('\n- ')}`);
      return { key, title, data: raw as CaseData, errors };
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'ko'));
}
