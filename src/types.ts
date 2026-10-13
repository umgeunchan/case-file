export interface Location {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export interface Item {
  id: string;
  locationId: string;
  name: string;
  description: string;
  image?: string;
  givesClues?: string[];
  requires?: string[];
}

export interface Clue {
  id: string;
  text: string;
  isKey: boolean;
}

export interface Suspect {
  id: string;
  name: string;
  profile: string;
  image?: string;
}

export interface Dialogue {
  id: string;
  suspectId: string;
  question: string;
  answer: string;
  requires?: string[];
  givesClues?: string[];
}

export interface Choice {
  options: string[];
  answer: number;
}

export interface CaseData {
  id: string;
  title: string;
  summary: string;
  briefing: string;
  difficulty: 1 | 2 | 3;
  timeLimitMinutes: number;
  coverImage?: string;
  locations: Location[];
  items: Item[];
  clues: Clue[];
  suspects: Suspect[];
  dialogues: Dialogue[];
  solution: {
    culpritId: string;
    motive: Choice;
    method: Choice;
    explanation: string;
  };
}

export interface Report {
  culpritId: string;
  motive: number;
  method: number;
}

export interface Progress {
  caseId: string;
  startedAt: number;
  inspectedItems: string[];
  askedDialogues: string[];
  clues: string[];
  memo: string;
  report?: Report;
  finishedAt?: number;
}
