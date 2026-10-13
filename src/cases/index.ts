import { buildRegistry, type CaseEntry } from './registry';

export type { CaseEntry };

export const cases: CaseEntry[] = buildRegistry(import.meta.glob<{ default: unknown }>('./*.json', { eager: true }));

export function getCase(id: string): CaseEntry | undefined {
  return (
    cases.find((entry) => entry.errors.length === 0 && entry.data.id === id) ??
    cases.find((entry) => entry.data?.id === id)
  );
}
