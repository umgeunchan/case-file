import type { CaseData, Clue, Dialogue, Item, Progress } from '../types';
import { isUnlocked } from './conditions';

export function newProgress(caseId: string, now: number): Progress {
  return { caseId, startedAt: now, inspectedItems: [], askedDialogues: [], clues: [], memo: '' };
}

function addClues(clues: string[], add: string[] | undefined): string[] {
  const next = [...clues];
  for (const id of add ?? []) if (!next.includes(id)) next.push(id);
  return next;
}

export function inspectItem(p: Progress, item: Item): Progress {
  if (p.inspectedItems.includes(item.id) || !isUnlocked(item.requires, p.clues)) return p;
  return { ...p, inspectedItems: [...p.inspectedItems, item.id], clues: addClues(p.clues, item.givesClues) };
}

export function askDialogue(p: Progress, d: Dialogue): Progress {
  if (p.askedDialogues.includes(d.id) || !isUnlocked(d.requires, p.clues)) return p;
  return { ...p, askedDialogues: [...p.askedDialogues, d.id], clues: addClues(p.clues, d.givesClues) };
}

export function getAvailableDialogues(c: CaseData, p: Progress, suspectId: string): Dialogue[] {
  return c.dialogues.filter(
    (d) => d.suspectId === suspectId && !p.askedDialogues.includes(d.id) && isUnlocked(d.requires, p.clues),
  );
}

export function isLocationExhausted(c: CaseData, p: Progress, locationId: string): boolean {
  return c.items.filter((i) => i.locationId === locationId).every((i) => p.inspectedItems.includes(i.id));
}

export function sanitizeProgress(c: CaseData, p: Progress): Progress {
  const has = (list: { id: string }[]) => (id: string) => list.some((x) => x.id === id);
  return {
    ...p,
    inspectedItems: p.inspectedItems.filter(has(c.items)),
    askedDialogues: p.askedDialogues.filter(has(c.dialogues)),
    clues: p.clues.filter(has(c.clues)),
  };
}

export function findClue(c: CaseData, id: string): Clue | undefined {
  return c.clues.find((clue) => clue.id === id);
}

export function clueSource(c: CaseData, p: Progress, clueId: string): string {
  const item = c.items.find((i) => p.inspectedItems.includes(i.id) && i.givesClues?.includes(clueId));
  if (item) {
    const location = c.locations.find((l) => l.id === item.locationId);
    return `${location?.name ?? ''} · ${item.name}`;
  }
  const d = c.dialogues.find((x) => p.askedDialogues.includes(x.id) && x.givesClues?.includes(clueId));
  if (d) {
    const suspect = c.suspects.find((s) => s.id === d.suspectId);
    return `${suspect?.name ?? ''} 심문`;
  }
  return '';
}
