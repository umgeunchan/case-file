export function isUnlocked(requires: string[] | undefined, clues: string[]): boolean {
  return (requires ?? []).every((id) => clues.includes(id));
}
