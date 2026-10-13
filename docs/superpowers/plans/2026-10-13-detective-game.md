# 추리게임 엔진 (case-file) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** JSON 시나리오 파일 하나로 사건을 정의하는 추리게임(현장 조사 → 질문 선택형 심문 → 보고서 → 채점)을 React 정적 사이트로 만든다.

**Architecture:** 게임 규칙은 `src/engine/`의 순수 함수(조건 판정, 조사/심문, 채점, 타이머, 저장)로 두고 Vitest로 테스트한다. 화면은 `src/pages/`(라우트 단위)와 `src/components/`(탭 등)로 나누고, 진행 상태는 `useProgress` 훅이 localStorage와 동기화한다. 사건은 `src/cases/*.json`을 `import.meta.glob`으로 자동 로드하고 로드 시 검증한다.

**Tech Stack:** React 18, TypeScript 5, Vite 5, React Router 6 (HashRouter), Vitest 2

**Spec:** `docs/superpowers/specs/2026-10-13-detective-game-design.md`

## Global Constraints

- 사건 파일 위치: `src/cases/<caseId>.json`, 파일 추가만으로 목록에 나타나야 함
- 진행 상태 localStorage 키: `case-file:progress:<caseId>`, 모든 읽기/쓰기는 try/catch
- 경고: 남은 시간 10분(600초) 이하에서 한 번, 제한 시간 10분 이하 사건은 경고 없음
- 채점: 범인 50 / 동기 20 / 수법 20 / 핵심 단서 10 × 비율(반올림). 등급 S ≥ 90, A ≥ 75, B ≥ 50, C < 50. 범인 오답이면 등급 C 고정, 제목 "범인 검거 실패"
- 핵심 단서가 0개인 사건: 단서 점수 10점 만점 처리, "놓쳤습니다" 문구 생략
- 정적 빌드: `base: './'` + HashRouter (어느 정적 호스팅에서도 새로고침 404 없음)
- 모바일 폭 360px에서 가로 스크롤 없음

## Review Focus

1. **손상되거나 형식이 다른 localStorage 값** — 앱이 죽지 않고 "진행 기록 없음"으로 취급해야 함 → Task 4 테스트
2. **진행 중에 사건 JSON이 수정되어 저장된 id가 사라진 경우** — 없는 id는 조용히 제거하고 계속 플레이 → Task 2 `sanitizeProgress` 테스트
3. **사건 JSON에 배열 필드가 빠지거나 오타 난 참조** — 크래시 대신 "데이터 오류" 표시 → Task 5 테스트
4. **같은 아이템/질문을 두 번 처리하거나 한 단서를 두 출처에서 얻는 경우** — 단서 중복 없음 → Task 2 테스트
5. **보고서 없이 `/result`로, 진행 없이 `/play`로 직접 접근** — 올바른 화면으로 리다이렉트 → Task 7, 8 수동 확인 단계

---

## 파일 구조

```
case-file/
  package.json, tsconfig.json, vite.config.ts, index.html, .gitignore
  src/
    main.tsx, App.tsx, styles.css, types.ts
    engine/
      conditions.ts        isUnlocked
      investigation.ts     newProgress, inspectItem, askDialogue, getAvailableDialogues,
                           isLocationExhausted, sanitizeProgress, findClue, clueSource
      scoring.ts           score, gradeFor
      timer.ts             remainingSeconds, shouldWarn, formatTime
      storage.ts           loadProgress, saveProgress, clearProgress
      validateCase.ts      validateCase
      __fixtures__/miniCase.ts
      *.test.ts
    cases/
      index.ts             cases, getCase (import.meta.glob)
      sample.json
    hooks/
      useProgress.ts, useNow.ts
    components/
      Layout.tsx, TabProps.ts, InvestigateTab.tsx, InterrogateTab.tsx, JournalTab.tsx
    pages/
      CaseRoute.tsx, NotFound.tsx, CaseList.tsx, CaseIntro.tsx, Play.tsx, Report.tsx, Result.tsx
```

---

### Task 1: 프로젝트 셋업 + 타입 + 조건 판정

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`, `src/types.ts`, `src/engine/conditions.ts`, `src/engine/__fixtures__/miniCase.ts`
- Test: `src/engine/conditions.test.ts`

**Interfaces:**
- Produces: `CaseData`, `Location`, `Item`, `Clue`, `Suspect`, `Dialogue`, `Choice`, `Report`, `Progress` 타입 (`src/types.ts`); `isUnlocked(requires: string[] | undefined, clues: string[]): boolean`; 테스트 픽스처 `miniCase: CaseData`

- [ ] **Step 1: 설정 파일 작성**

`package.json`
```json
{
  "name": "case-file",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.2",
    "typescript": "^5.6.3",
    "vite": "^5.4.9",
    "vitest": "^2.1.3"
  }
}
```

`tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

`vite.config.ts`
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  test: { environment: 'node' },
});
```

`index.html`
```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CASE FILE</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`.gitignore`
```
node_modules
dist
```

- [ ] **Step 2: 의존성 설치**

Run: `npm install`
Expected: 에러 없이 완료, `node_modules/` 생성

- [ ] **Step 3: 타입 정의 작성** — `src/types.ts`

```ts
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
```

- [ ] **Step 4: 테스트 픽스처 작성** — `src/engine/__fixtures__/miniCase.ts`

```ts
import type { CaseData } from '../../types';

export const miniCase: CaseData = {
  id: 'mini',
  title: '테스트 사건',
  summary: '',
  briefing: '',
  difficulty: 1,
  timeLimitMinutes: 30,
  locations: [
    { id: 'L1', name: '거실', description: '' },
    { id: 'L2', name: '빈 방', description: '' },
  ],
  items: [
    { id: 'I1', locationId: 'L1', name: '칼', description: '', givesClues: ['C1'] },
    { id: 'I2', locationId: 'L1', name: '상자', description: '', requires: ['C1'], givesClues: ['C2', 'C1'] },
  ],
  clues: [
    { id: 'C1', text: '칼의 흔적', isKey: true },
    { id: 'C2', text: '상자 속 편지', isKey: true },
    { id: 'C3', text: '목격 증언', isKey: false },
  ],
  suspects: [
    { id: 'S1', name: '가', profile: '' },
    { id: 'S2', name: '나', profile: '' },
  ],
  dialogues: [
    { id: 'D1', suspectId: 'S1', question: 'q1', answer: 'a1', givesClues: ['C3'] },
    { id: 'D2', suspectId: 'S1', question: 'q2', answer: 'a2', requires: ['C2'] },
    { id: 'D3', suspectId: 'S2', question: 'q3', answer: 'a3' },
  ],
  solution: {
    culpritId: 'S1',
    motive: { options: ['m0', 'm1'], answer: 1 },
    method: { options: ['x0', 'x1'], answer: 0 },
    explanation: '',
  },
};
```

- [ ] **Step 5: 실패하는 테스트 작성** — `src/engine/conditions.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { isUnlocked } from './conditions';

describe('isUnlocked', () => {
  it('조건이 없으면 열려 있다', () => {
    expect(isUnlocked(undefined, [])).toBe(true);
    expect(isUnlocked([], [])).toBe(true);
  });
  it('필요한 단서를 모두 가져야 열린다', () => {
    expect(isUnlocked(['C1', 'C2'], ['C1'])).toBe(false);
    expect(isUnlocked(['C1', 'C2'], ['C2', 'C1', 'C3'])).toBe(true);
  });
});
```

- [ ] **Step 6: 실패 확인**

Run: `npx vitest run src/engine/conditions.test.ts`
Expected: FAIL — `Failed to resolve import "./conditions"`

- [ ] **Step 7: 구현** — `src/engine/conditions.ts`

```ts
export function isUnlocked(requires: string[] | undefined, clues: string[]): boolean {
  return (requires ?? []).every((id) => clues.includes(id));
}
```

- [ ] **Step 8: 통과 확인**

Run: `npx vitest run src/engine/conditions.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "chore: scaffold project with types and unlock conditions"
```

---

### Task 2: 조사·심문 엔진

**Files:**
- Create: `src/engine/investigation.ts`
- Test: `src/engine/investigation.test.ts`

**Interfaces:**
- Consumes: `isUnlocked` (Task 1), 타입들
- Produces:
  - `newProgress(caseId: string, now: number): Progress`
  - `inspectItem(p: Progress, item: Item): Progress` — 이미 조사했거나 잠겨 있으면 `p` 그대로 반환
  - `askDialogue(p: Progress, d: Dialogue): Progress` — 이미 했거나 잠겨 있으면 `p` 그대로 반환
  - `getAvailableDialogues(c: CaseData, p: Progress, suspectId: string): Dialogue[]`
  - `isLocationExhausted(c: CaseData, p: Progress, locationId: string): boolean`
  - `sanitizeProgress(c: CaseData, p: Progress): Progress`
  - `findClue(c: CaseData, id: string): Clue | undefined`
  - `clueSource(c: CaseData, p: Progress, clueId: string): string`

- [ ] **Step 1: 실패하는 테스트 작성** — `src/engine/investigation.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { miniCase } from './__fixtures__/miniCase';
import {
  askDialogue, clueSource, findClue, getAvailableDialogues, inspectItem,
  isLocationExhausted, newProgress, sanitizeProgress,
} from './investigation';

const item = (id: string) => miniCase.items.find((i) => i.id === id)!;
const dialogue = (id: string) => miniCase.dialogues.find((d) => d.id === id)!;

describe('newProgress', () => {
  it('빈 진행 상태를 만든다', () => {
    expect(newProgress('mini', 1000)).toEqual({
      caseId: 'mini', startedAt: 1000, inspectedItems: [], askedDialogues: [], clues: [], memo: '',
    });
  });
});

describe('inspectItem', () => {
  it('아이템을 조사하면 단서를 얻는다', () => {
    const p = inspectItem(newProgress('mini', 0), item('I1'));
    expect(p.inspectedItems).toEqual(['I1']);
    expect(p.clues).toEqual(['C1']);
  });
  it('잠긴 아이템은 조사할 수 없다', () => {
    const p0 = newProgress('mini', 0);
    expect(inspectItem(p0, item('I2'))).toBe(p0);
  });
  it('이미 가진 단서는 중복으로 추가하지 않는다', () => {
    let p = inspectItem(newProgress('mini', 0), item('I1'));
    p = inspectItem(p, item('I2'));
    expect(p.clues).toEqual(['C1', 'C2']);
  });
  it('같은 아이템을 두 번 조사해도 변하지 않는다', () => {
    const p1 = inspectItem(newProgress('mini', 0), item('I1'));
    expect(inspectItem(p1, item('I1'))).toBe(p1);
  });
});

describe('dialogues', () => {
  it('조건 없는 질문만 처음에 열려 있다', () => {
    const ids = getAvailableDialogues(miniCase, newProgress('mini', 0), 'S1').map((d) => d.id);
    expect(ids).toEqual(['D1']);
  });
  it('단서를 얻으면 새 질문이 열리고, 이미 한 질문은 사라진다', () => {
    let p = inspectItem(newProgress('mini', 0), item('I1'));
    p = inspectItem(p, item('I2'));
    p = askDialogue(p, dialogue('D1'));
    expect(p.askedDialogues).toEqual(['D1']);
    expect(p.clues).toContain('C3');
    expect(getAvailableDialogues(miniCase, p, 'S1').map((d) => d.id)).toEqual(['D2']);
  });
  it('잠긴 질문은 할 수 없다', () => {
    const p0 = newProgress('mini', 0);
    expect(askDialogue(p0, dialogue('D2'))).toBe(p0);
  });
});

describe('isLocationExhausted', () => {
  it('장소의 모든 아이템을 조사하면 true', () => {
    let p = inspectItem(newProgress('mini', 0), item('I1'));
    expect(isLocationExhausted(miniCase, p, 'L1')).toBe(false);
    p = inspectItem(p, item('I2'));
    expect(isLocationExhausted(miniCase, p, 'L1')).toBe(true);
  });
});

describe('sanitizeProgress', () => {
  it('사건에 없는 id를 제거한다', () => {
    const p = {
      ...newProgress('mini', 0),
      inspectedItems: ['I1', 'GONE'],
      askedDialogues: ['D9', 'D1'],
      clues: ['C1', 'CX'],
    };
    const s = sanitizeProgress(miniCase, p);
    expect(s.inspectedItems).toEqual(['I1']);
    expect(s.askedDialogues).toEqual(['D1']);
    expect(s.clues).toEqual(['C1']);
  });
});

describe('findClue / clueSource', () => {
  it('단서와 출처를 찾는다', () => {
    let p = inspectItem(newProgress('mini', 0), item('I1'));
    p = askDialogue(p, dialogue('D1'));
    expect(findClue(miniCase, 'C1')?.text).toBe('칼의 흔적');
    expect(clueSource(miniCase, p, 'C1')).toBe('거실 · 칼');
    expect(clueSource(miniCase, p, 'C3')).toBe('가 심문');
    expect(clueSource(miniCase, p, 'C2')).toBe('');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/engine/investigation.test.ts`
Expected: FAIL — `Failed to resolve import "./investigation"`

- [ ] **Step 3: 구현** — `src/engine/investigation.ts`

```ts
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
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/engine/investigation.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: add investigation engine (items, dialogues, clues)"
```

---

### Task 3: 채점

**Files:**
- Create: `src/engine/scoring.ts`
- Test: `src/engine/scoring.test.ts`

**Interfaces:**
- Consumes: `CaseData`, `Progress`
- Produces:
  - `type Grade = 'S' | 'A' | 'B' | 'C'`
  - `interface ScoreResult { total: number; grade: Grade; culpritCorrect: boolean; motiveCorrect: boolean; methodCorrect: boolean; keyCluesFound: number; keyCluesTotal: number; missedKeyClues: number }`
  - `gradeFor(total: number): Grade`
  - `score(c: CaseData, p: Progress): ScoreResult | null` — 보고서가 없으면 `null`

- [ ] **Step 1: 실패하는 테스트 작성** — `src/engine/scoring.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import type { Progress } from '../types';
import { miniCase } from './__fixtures__/miniCase';
import { gradeFor, score } from './scoring';

const base: Progress = {
  caseId: 'mini', startedAt: 0, inspectedItems: [], askedDialogues: [], clues: [], memo: '',
};

describe('gradeFor', () => {
  it('경계값', () => {
    expect(gradeFor(100)).toBe('S');
    expect(gradeFor(90)).toBe('S');
    expect(gradeFor(89)).toBe('A');
    expect(gradeFor(75)).toBe('A');
    expect(gradeFor(74)).toBe('B');
    expect(gradeFor(50)).toBe('B');
    expect(gradeFor(49)).toBe('C');
  });
});

describe('score', () => {
  it('보고서가 없으면 null', () => {
    expect(score(miniCase, base)).toBeNull();
  });
  it('모두 맞히고 핵심 단서를 모두 찾으면 100점 S', () => {
    const r = score(miniCase, { ...base, clues: ['C1', 'C2'], report: { culpritId: 'S1', motive: 1, method: 0 } })!;
    expect(r.total).toBe(100);
    expect(r.grade).toBe('S');
    expect(r.missedKeyClues).toBe(0);
  });
  it('핵심 단서 일부만 찾으면 비율만큼 점수 (반올림)', () => {
    const r = score(miniCase, { ...base, clues: ['C1', 'C3'], report: { culpritId: 'S1', motive: 1, method: 0 } })!;
    expect(r.keyCluesFound).toBe(1);
    expect(r.keyCluesTotal).toBe(2);
    expect(r.missedKeyClues).toBe(1);
    expect(r.total).toBe(95);
  });
  it('범인을 틀리면 다른 점수와 무관하게 C', () => {
    const r = score(miniCase, { ...base, clues: ['C1', 'C2'], report: { culpritId: 'S2', motive: 1, method: 0 } })!;
    expect(r.culpritCorrect).toBe(false);
    expect(r.total).toBe(50);
    expect(r.grade).toBe('C');
  });
  it('동기·수법 오답은 감점', () => {
    const r = score(miniCase, { ...base, clues: ['C1', 'C2'], report: { culpritId: 'S1', motive: 0, method: 1 } })!;
    expect(r.motiveCorrect).toBe(false);
    expect(r.methodCorrect).toBe(false);
    expect(r.total).toBe(60);
    expect(r.grade).toBe('B');
  });
  it('핵심 단서가 없는 사건은 단서 점수 만점', () => {
    const noKey = { ...miniCase, clues: miniCase.clues.map((c) => ({ ...c, isKey: false })) };
    const r = score(noKey, { ...base, report: { culpritId: 'S1', motive: 1, method: 0 } })!;
    expect(r.keyCluesTotal).toBe(0);
    expect(r.total).toBe(100);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/engine/scoring.test.ts`
Expected: FAIL — `Failed to resolve import "./scoring"`

- [ ] **Step 3: 구현** — `src/engine/scoring.ts`

```ts
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
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/engine/scoring.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: add report scoring and grades"
```

---

### Task 4: 타이머 + 저장소

**Files:**
- Create: `src/engine/timer.ts`, `src/engine/storage.ts`
- Test: `src/engine/timer.test.ts`, `src/engine/storage.test.ts`

**Interfaces:**
- Consumes: `CaseData`, `Progress`
- Produces:
  - `remainingSeconds(c: CaseData, p: Progress, now: number): number` — 0 미만이면 0, `finishedAt`이 있으면 그 시점 기준
  - `shouldWarn(c: CaseData, remaining: number): boolean`
  - `formatTime(seconds: number): string` — `"mm:ss"`
  - `type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>`
  - `loadProgress(caseId: string, store?: KeyValueStore): Progress | null`
  - `saveProgress(p: Progress, store?: KeyValueStore): void`
  - `clearProgress(caseId: string, store?: KeyValueStore): void`

- [ ] **Step 1: 실패하는 테스트 작성** — `src/engine/timer.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { miniCase } from './__fixtures__/miniCase';
import { newProgress } from './investigation';
import { formatTime, remainingSeconds, shouldWarn } from './timer';

describe('remainingSeconds', () => {
  const p = newProgress('mini', 0);
  it('경과 시간만큼 줄어든다', () => {
    expect(remainingSeconds(miniCase, p, 60_000)).toBe(1740);
  });
  it('0 아래로 내려가지 않는다', () => {
    expect(remainingSeconds(miniCase, p, 99 * 60_000)).toBe(0);
  });
  it('종료 시각이 있으면 그 시점에 멈춘다', () => {
    expect(remainingSeconds(miniCase, { ...p, finishedAt: 120_000 }, 999_000)).toBe(1680);
  });
});

describe('shouldWarn', () => {
  it('10분 이하로 남으면 경고', () => {
    expect(shouldWarn(miniCase, 601)).toBe(false);
    expect(shouldWarn(miniCase, 600)).toBe(true);
    expect(shouldWarn(miniCase, 0)).toBe(false);
  });
  it('제한 시간이 10분 이하인 사건은 경고 없음', () => {
    expect(shouldWarn({ ...miniCase, timeLimitMinutes: 10 }, 300)).toBe(false);
  });
});

describe('formatTime', () => {
  it('mm:ss', () => {
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(5999)).toBe('99:59');
  });
});
```

`src/engine/storage.test.ts`
```ts
import { describe, expect, it } from 'vitest';
import { newProgress } from './investigation';
import { clearProgress, loadProgress, saveProgress, type KeyValueStore } from './storage';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwing: KeyValueStore = {
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('blocked'); },
  removeItem: () => { throw new Error('blocked'); },
};

describe('storage', () => {
  it('저장하고 다시 불러온다', () => {
    const store = memoryStore();
    const p = { ...newProgress('mini', 5), memo: '메모' };
    saveProgress(p, store);
    expect(store.data.has('case-file:progress:mini')).toBe(true);
    expect(loadProgress('mini', store)).toEqual(p);
  });
  it('기록이 없으면 null', () => {
    expect(loadProgress('mini', memoryStore())).toBeNull();
  });
  it('손상된 JSON이면 null', () => {
    const store = memoryStore();
    store.setItem('case-file:progress:mini', '{not json');
    expect(loadProgress('mini', store)).toBeNull();
  });
  it('형식이 다르면 null', () => {
    const store = memoryStore();
    store.setItem('case-file:progress:mini', JSON.stringify({ caseId: 'mini', clues: 'x' }));
    expect(loadProgress('mini', store)).toBeNull();
  });
  it('다른 사건의 기록이면 null', () => {
    const store = memoryStore();
    store.setItem('case-file:progress:mini', JSON.stringify(newProgress('other', 0)));
    expect(loadProgress('mini', store)).toBeNull();
  });
  it('삭제한다', () => {
    const store = memoryStore();
    saveProgress(newProgress('mini', 0), store);
    clearProgress('mini', store);
    expect(loadProgress('mini', store)).toBeNull();
  });
  it('저장소 접근이 막혀도 예외를 던지지 않는다', () => {
    expect(loadProgress('mini', throwing)).toBeNull();
    expect(() => saveProgress(newProgress('mini', 0), throwing)).not.toThrow();
    expect(() => clearProgress('mini', throwing)).not.toThrow();
  });
  it('저장소가 없어도(Node 환경) 예외를 던지지 않는다', () => {
    expect(loadProgress('mini')).toBeNull();
    expect(() => saveProgress(newProgress('mini', 0))).not.toThrow();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/engine/timer.test.ts src/engine/storage.test.ts`
Expected: FAIL — `Failed to resolve import "./timer"` / `"./storage"`

- [ ] **Step 3: 구현** — `src/engine/timer.ts`

```ts
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
```

`src/engine/storage.ts`
```ts
import type { Progress } from '../types';

export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const key = (caseId: string) => `case-file:progress:${caseId}`;

function defaultStore(): KeyValueStore | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

function isProgress(v: unknown): v is Progress {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.caseId === 'string' &&
    typeof p.startedAt === 'number' &&
    isStringArray(p.inspectedItems) &&
    isStringArray(p.askedDialogues) &&
    isStringArray(p.clues) &&
    typeof p.memo === 'string'
  );
}

export function loadProgress(caseId: string, store = defaultStore()): Progress | null {
  try {
    const raw = store?.getItem(key(caseId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isProgress(parsed) && parsed.caseId === caseId ? parsed : null;
  } catch {
    return null;
  }
}

export function saveProgress(p: Progress, store = defaultStore()): void {
  try {
    store?.setItem(key(p.caseId), JSON.stringify(p));
  } catch {
    // 저장이 막힌 환경에서는 메모리 상태로만 진행한다.
  }
}

export function clearProgress(caseId: string, store = defaultStore()): void {
  try {
    store?.removeItem(key(caseId));
  } catch {
    // 위와 같음
  }
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/engine/timer.test.ts src/engine/storage.test.ts`
Expected: PASS (14 tests)

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: add timer helpers and safe progress storage"
```

---

### Task 5: 시나리오 검증 + 샘플 사건 + 사건 레지스트리

**Files:**
- Create: `src/engine/validateCase.ts`, `src/cases/sample.json`, `src/cases/index.ts`
- Test: `src/engine/validateCase.test.ts`

**Interfaces:**
- Consumes: `CaseData`
- Produces:
  - `validateCase(raw: unknown): string[]` — 오류 메시지 목록, 정상이면 `[]`
  - `interface CaseEntry { data: CaseData; errors: string[] }`
  - `cases: CaseEntry[]`, `getCase(id: string): CaseEntry | undefined` (`src/cases/index.ts`)

- [ ] **Step 1: 실패하는 테스트 작성** — `src/engine/validateCase.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import sample from '../cases/sample.json';
import { miniCase } from './__fixtures__/miniCase';
import { validateCase } from './validateCase';

const clone = () => structuredClone(miniCase);

describe('validateCase', () => {
  it('정상 사건은 오류가 없다', () => {
    expect(validateCase(miniCase)).toEqual([]);
  });
  it('샘플 사건은 오류가 없다', () => {
    expect(validateCase(sample)).toEqual([]);
  });
  it('객체가 아니거나 배열 필드가 없으면 오류', () => {
    expect(validateCase(null).length).toBeGreaterThan(0);
    const c = clone() as Record<string, unknown>;
    delete c.items;
    expect(validateCase(c).join()).toContain('items');
  });
  it('없는 장소를 참조하는 아이템', () => {
    const c = clone();
    c.items[0].locationId = 'LX';
    expect(validateCase(c).join()).toContain('LX');
  });
  it('없는 단서를 참조하는 질문 조건', () => {
    const c = clone();
    c.dialogues[0].requires = ['CX'];
    expect(validateCase(c).join()).toContain('CX');
  });
  it('없는 용의자를 참조하는 질문과 정답', () => {
    const c = clone();
    c.dialogues[0].suspectId = 'SX';
    c.solution.culpritId = 'SY';
    const errors = validateCase(c).join();
    expect(errors).toContain('SX');
    expect(errors).toContain('SY');
  });
  it('정답 인덱스가 보기 범위를 벗어나면 오류', () => {
    const c = clone();
    c.solution.motive.answer = 5;
    expect(validateCase(c).join()).toContain('motive');
  });
  it('id 중복은 오류', () => {
    const c = clone();
    c.clues.push({ id: 'C1', text: 'dup', isKey: false });
    expect(validateCase(c).join()).toContain('C1');
  });
  it('제한 시간과 난이도 범위', () => {
    const c = clone() as Record<string, unknown>;
    c.timeLimitMinutes = 0;
    c.difficulty = 7;
    const errors = validateCase(c).join();
    expect(errors).toContain('timeLimitMinutes');
    expect(errors).toContain('difficulty');
  });
});
```

- [ ] **Step 2: 샘플 사건 작성** — `src/cases/sample.json`

```json
{
  "id": "sample",
  "title": "사라진 '푸른 새벽'",
  "summary": "폐관 직후의 미술관에서 대표 소장품 '푸른 새벽'이 액자만 남긴 채 사라졌다. 그날 밤 미술관에 남아 있던 사람은 세 명뿐이다.",
  "briefing": "23시 58분, 순찰 중이던 경비원이 전시실의 빈 액자를 발견했다.\n외부 침입 흔적은 없다. 범인은 그날 밤 미술관에 있던 세 사람 중 한 명이다.\n현장을 조사하고, 용의자를 심문해 범인과 동기, 수법을 밝혀내라.",
  "difficulty": 1,
  "timeLimitMinutes": 30,
  "locations": [
    { "id": "gallery", "name": "제1전시실", "description": "'푸른 새벽'이 걸려 있던 전시실. 조명은 꺼져 있고, 빈 액자만 벽에 남아 있다." },
    { "id": "office", "name": "관리실", "description": "CCTV 모니터와 공구함, 직원들의 소지품 보관함이 있는 좁은 방." }
  ],
  "items": [
    { "id": "frame", "locationId": "gallery", "name": "빈 액자", "description": "액자를 벽에 고정하던 나사가 깔끔하게 풀려 있다. 나사 머리 모양이 특이해서 전용 드라이버가 아니면 풀 수 없다.", "givesClues": ["screws"] },
    { "id": "guestbook", "name": "방명록", "locationId": "gallery", "description": "마지막 기록: '강민재 — 23:30 퇴관'. 서명 옆에 출입 게이트 확인 도장이 찍혀 있다.", "givesClues": ["collector-left"] },
    { "id": "cctv", "locationId": "office", "name": "CCTV 모니터", "description": "녹화 기록을 돌려 보니 23:40부터 23:55까지 15분간 전시실 카메라가 꺼져 있다. 관리실에서 수동으로 끈 기록이 남아 있다.", "givesClues": ["cctv-off"] },
    { "id": "toolbox", "locationId": "office", "name": "공구함", "description": "액자 설치용 전용 드라이버 자리가 비어 있다. 공구함 열쇠는 관리실 직원만 가지고 있다.", "givesClues": ["driver-missing"] },
    { "id": "bag", "locationId": "office", "name": "윤채원의 가방", "description": "가방 안쪽 주머니에서 전용 드라이버가 나왔다. 손잡이에 금색 페인트 가루가 묻어 있다.", "requires": ["driver-missing"], "givesClues": ["driver-in-bag"] }
  ],
  "clues": [
    { "id": "screws", "text": "액자 나사는 전용 드라이버로만 풀 수 있다.", "isKey": true },
    { "id": "cctv-off", "text": "23:40~23:55 동안 관리실에서 전시실 CCTV를 수동으로 껐다.", "isKey": true },
    { "id": "driver-missing", "text": "관리실 공구함에서 전용 드라이버가 사라졌다.", "isKey": false },
    { "id": "driver-in-bag", "text": "윤채원의 가방에서 금색 페인트가 묻은 전용 드라이버가 발견되었다.", "isKey": true },
    { "id": "collector-left", "text": "강민재는 23:30에 미술관을 떠났다.", "isKey": false },
    { "id": "guard-upstairs", "text": "박도현은 23:45경 2층을 순찰하고 있었다.", "isKey": false },
    { "id": "secret-offer", "text": "윤채원이 강민재에게 '푸른 새벽'을 몰래 넘기겠다고 제안한 적이 있다.", "isKey": false }
  ],
  "suspects": [
    { "id": "guard", "name": "박도현", "profile": "야간 경비원, 52세. 이 미술관에서 12년째 근무 중." },
    { "id": "curator", "name": "윤채원", "profile": "수석 큐레이터, 38세. '푸른 새벽' 전시를 직접 기획했다." },
    { "id": "collector", "name": "강민재", "profile": "미술품 수집가, 45세. 폐관 직전까지 전시실에 머물렀다." }
  ],
  "dialogues": [
    { "id": "guard-where", "suspectId": "guard", "question": "그 시간에 어디 계셨죠?", "answer": "23시 40분쯤부터 2층 순찰을 돌고 있었습니다. 2층 출입 기록을 보시면 나올 겁니다.", "givesClues": ["guard-upstairs"] },
    { "id": "guard-cctv", "suspectId": "guard", "question": "CCTV가 왜 꺼져 있었죠?", "answer": "제가 끈 게 아닙니다! 관리실 열쇠는 저 말고 윤 큐레이터님도 갖고 계세요.", "requires": ["cctv-off"] },
    { "id": "curator-where", "suspectId": "curator", "question": "그 시간에 어디 계셨죠?", "answer": "관리실에서 다음 전시 서류를 정리하고 있었어요. 혼자였지만요." },
    { "id": "curator-driver", "suspectId": "curator", "question": "가방에서 전용 드라이버가 나왔습니다.", "answer": "그, 그건… 낮에 액자 점검하다가 깜빡 넣어 둔 거예요. 페인트요? 전시 준비하다 묻었겠죠.", "requires": ["driver-in-bag"] },
    { "id": "collector-where", "suspectId": "collector", "question": "그 시간에 어디 계셨죠?", "answer": "11시 반에 나왔어요. 방명록에 서명도 했고, 게이트 기록도 있을 겁니다." },
    { "id": "collector-painting", "suspectId": "collector", "question": "'푸른 새벽'에 관심이 많으셨다고요?", "answer": "솔직히 말하죠. 윤 큐레이터가 지난달 그 그림을 몰래 넘겨주겠다고 제안했어요. 빚이 많다더군요. 당연히 거절했습니다.", "requires": ["collector-left"], "givesClues": ["secret-offer"] }
  ],
  "solution": {
    "culpritId": "curator",
    "motive": {
      "options": ["그림을 팔아 빚을 갚으려고", "전시 기획을 망친 관장에게 복수하려고", "경비원에게 누명을 씌우려고"],
      "answer": 0
    },
    "method": {
      "options": [
        "관리실에서 CCTV를 끄고 전용 드라이버로 액자를 분해해 그림을 빼돌렸다",
        "관람 시간 중에 위조품과 바꿔치기했다",
        "경비원의 열쇠를 훔쳐 창고로 그림을 옮겼다"
      ],
      "answer": 0
    },
    "explanation": "윤채원은 빚에 시달리다 수집가 강민재에게 그림을 팔려 했지만 거절당했다. 그날 밤 경비원이 2층 순찰을 도는 사이 관리실에서 CCTV를 15분간 끄고, 공구함의 전용 드라이버로 액자 나사를 풀어 그림을 빼냈다. 드라이버에 묻은 금색 페인트는 '푸른 새벽'의 액자 칠이다."
  }
}
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run src/engine/validateCase.test.ts`
Expected: FAIL — `Failed to resolve import "./validateCase"`

- [ ] **Step 4: 구현** — `src/engine/validateCase.ts`

```ts
const ARRAY_FIELDS = ['locations', 'items', 'clues', 'suspects', 'dialogues'] as const;

type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);

export function validateCase(raw: unknown): string[] {
  if (!isRec(raw)) return ['사건 데이터가 객체가 아닙니다.'];
  const errors: string[] = [];

  if (typeof raw.id !== 'string' || raw.id === '') errors.push('id가 비어 있습니다.');
  if (typeof raw.title !== 'string') errors.push('title이 없습니다.');
  if (typeof raw.timeLimitMinutes !== 'number' || raw.timeLimitMinutes <= 0) {
    errors.push('timeLimitMinutes는 0보다 큰 숫자여야 합니다.');
  }
  if (![1, 2, 3].includes(raw.difficulty as number)) errors.push('difficulty는 1, 2, 3 중 하나여야 합니다.');

  for (const field of ARRAY_FIELDS) {
    if (!Array.isArray(raw[field])) errors.push(`${field} 배열이 없습니다.`);
  }
  if (!isRec(raw.solution)) errors.push('solution이 없습니다.');
  if (errors.some((e) => e.includes('배열') || e.includes('solution'))) return errors;

  const list = (field: (typeof ARRAY_FIELDS)[number]) => raw[field] as Rec[];
  const idsOf = (field: (typeof ARRAY_FIELDS)[number]) => {
    const ids = new Set<string>();
    for (const x of list(field)) {
      const id = x.id as string;
      if (ids.has(id)) errors.push(`${field}에 중복된 id '${id}'가 있습니다.`);
      ids.add(id);
    }
    return ids;
  };

  const locationIds = idsOf('locations');
  idsOf('items');
  const clueIds = idsOf('clues');
  const suspectIds = idsOf('suspects');
  idsOf('dialogues');

  const checkClues = (owner: string, key: string, ids: unknown) => {
    if (ids === undefined) return;
    if (!Array.isArray(ids)) return void errors.push(`${owner}.${key}는 배열이어야 합니다.`);
    for (const id of ids) {
      if (!clueIds.has(id)) errors.push(`${owner}.${key}: 없는 단서 '${id}'`);
    }
  };

  for (const item of list('items')) {
    const owner = `items[${item.id}]`;
    if (!locationIds.has(item.locationId as string)) errors.push(`${owner}: 없는 장소 '${item.locationId}'`);
    checkClues(owner, 'givesClues', item.givesClues);
    checkClues(owner, 'requires', item.requires);
  }

  for (const d of list('dialogues')) {
    const owner = `dialogues[${d.id}]`;
    if (!suspectIds.has(d.suspectId as string)) errors.push(`${owner}: 없는 용의자 '${d.suspectId}'`);
    checkClues(owner, 'givesClues', d.givesClues);
    checkClues(owner, 'requires', d.requires);
  }

  const solution = raw.solution as Rec;
  if (!suspectIds.has(solution.culpritId as string)) {
    errors.push(`solution.culpritId: 없는 용의자 '${solution.culpritId}'`);
  }
  for (const key of ['motive', 'method'] as const) {
    const choice = solution[key];
    if (!isRec(choice) || !Array.isArray(choice.options)) {
      errors.push(`solution.${key}.options 배열이 없습니다.`);
      continue;
    }
    const answer = choice.answer;
    if (typeof answer !== 'number' || !Number.isInteger(answer) || answer < 0 || answer >= choice.options.length) {
      errors.push(`solution.${key}.answer가 보기 범위를 벗어났습니다.`);
    }
  }

  return errors;
}
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run src/engine/validateCase.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 6: 사건 레지스트리 작성** — `src/cases/index.ts`

```ts
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
```

- [ ] **Step 7: 전체 테스트 실행**

Run: `npm test`
Expected: PASS — 모든 테스트 파일 통과

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: add case validation, sample case and registry"
```

---

### Task 6: 레이아웃·라우팅·사건 목록·사건 소개 화면

**Files:**
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/hooks/useProgress.ts`, `src/hooks/useNow.ts`, `src/components/Layout.tsx`, `src/pages/CaseRoute.tsx`, `src/pages/NotFound.tsx`, `src/pages/CaseList.tsx`, `src/pages/CaseIntro.tsx`, 그리고 Task 7·8에서 채울 `src/pages/Play.tsx`, `src/pages/Report.tsx`, `src/pages/Result.tsx` 임시 파일

**Interfaces:**
- Consumes: `cases`, `getCase`, `loadProgress`, `saveProgress`, `clearProgress`, `sanitizeProgress`, `newProgress`
- Produces:
  - `useProgress(c: CaseData): readonly [Progress | null, (next: Progress | null) => void]`
  - `useNow(intervalMs?: number): number`
  - `Layout({ children }: { children: ReactNode })`
  - `interface CasePageProps { caseData: CaseData }` (`src/pages/CaseRoute.tsx`)

- [ ] **Step 1: 훅 작성**

`src/hooks/useProgress.ts`
```ts
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
```

`src/hooks/useNow.ts`
```ts
import { useEffect, useState } from 'react';

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
```

- [ ] **Step 2: 공통 컴포넌트와 라우트 작성**

`src/components/Layout.tsx`
```tsx
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="logo">CASE FILE</Link>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
```

`src/pages/NotFound.tsx`
```tsx
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="panel center">
        <h1>존재하지 않는 사건입니다.</h1>
        <Link className="btn" to="/">사건 목록으로</Link>
      </div>
    </Layout>
  );
}
```

`src/pages/CaseRoute.tsx`
```tsx
import type { ComponentType } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCase } from '../cases';
import type { CaseData } from '../types';
import NotFound from './NotFound';

export interface CasePageProps {
  caseData: CaseData;
}

export default function CaseRoute({ page: Page }: { page: ComponentType<CasePageProps> }) {
  const { caseId } = useParams();
  const entry = caseId ? getCase(caseId) : undefined;
  if (!entry) return <NotFound />;
  if (entry.errors.length) {
    return (
      <Layout>
        <div className="panel">
          <h1>데이터 오류</h1>
          <p className="muted">사건 파일을 고쳐야 플레이할 수 있습니다.</p>
          <ul>{entry.errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      </Layout>
    );
  }
  return <Page key={entry.data.id} caseData={entry.data} />;
}
```

`src/pages/Play.tsx`, `src/pages/Report.tsx`, `src/pages/Result.tsx` (Task 7·8에서 교체할 임시 내용 — 각 파일에서 함수 이름만 Play/Report/Result로)
```tsx
import type { CasePageProps } from './CaseRoute';

export default function Play({ caseData }: CasePageProps) {
  return <p>{caseData.title}</p>;
}
```

`src/App.tsx`
```tsx
import { HashRouter, Route, Routes } from 'react-router-dom';
import CaseIntro from './pages/CaseIntro';
import CaseList from './pages/CaseList';
import CaseRoute from './pages/CaseRoute';
import NotFound from './pages/NotFound';
import Play from './pages/Play';
import Report from './pages/Report';
import Result from './pages/Result';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CaseList />} />
        <Route path="/case/:caseId" element={<CaseRoute page={CaseIntro} />} />
        <Route path="/case/:caseId/play" element={<CaseRoute page={Play} />} />
        <Route path="/case/:caseId/report" element={<CaseRoute page={Report} />} />
        <Route path="/case/:caseId/result" element={<CaseRoute page={Result} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
```

`src/main.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 3: 목록·소개 화면 작성**

`src/pages/CaseList.tsx`
```tsx
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { cases } from '../cases';
import { loadProgress } from '../engine/storage';
import type { CaseData } from '../types';

function statusOf(id: string): string | null {
  const p = loadProgress(id);
  if (!p) return null;
  return p.report ? '종결' : '수사 중';
}

function CardBody({ data, status }: { data: CaseData; status: string | null }) {
  return (
    <>
      <div className="card-meta">
        <span>{'★'.repeat(data.difficulty)}{'☆'.repeat(3 - data.difficulty)}</span>
        <span>제한 {data.timeLimitMinutes}분</span>
      </div>
      <h2>{data.title}</h2>
      <p className="muted">{data.summary}</p>
      {status && <span className="badge">{status}</span>}
    </>
  );
}

export default function CaseList() {
  return (
    <Layout>
      <section className="hero">
        <p className="eyebrow">CASE FILE</p>
        <h1>모든 진실은 현장에 숨겨져 있다</h1>
        <p className="muted">단서를 모으고, 용의자를 심문하고, 범인을 지목하라.</p>
      </section>
      {cases.length === 0 && <p className="muted center">아직 등록된 사건이 없습니다.</p>}
      <div className="case-grid">
        {cases.map(({ data, errors }) =>
          errors.length ? (
            <div key={data.id ?? data.title} className="case-card is-broken">
              <CardBody data={data} status="데이터 오류" />
            </div>
          ) : (
            <Link key={data.id} to={`/case/${data.id}`} className="case-card">
              <CardBody data={data} status={statusOf(data.id)} />
            </Link>
          ),
        )}
      </div>
    </Layout>
  );
}
```

`src/pages/CaseIntro.tsx`
```tsx
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { newProgress } from '../engine/investigation';
import { useProgress } from '../hooks/useProgress';
import type { CasePageProps } from './CaseRoute';

export default function CaseIntro({ caseData: c }: CasePageProps) {
  const [progress, setProgress] = useProgress(c);
  const navigate = useNavigate();

  const start = () => {
    setProgress(newProgress(c.id, Date.now()));
    navigate(`/case/${c.id}/play`);
  };
  const restart = () => {
    if (window.confirm('진행 상황이 모두 삭제됩니다. 처음부터 다시 수사하시겠습니까?')) start();
  };

  return (
    <Layout>
      <article className="panel dossier">
        <div className="card-meta">
          <span>난이도 {'★'.repeat(c.difficulty)}{'☆'.repeat(3 - c.difficulty)}</span>
          <span>제한 시간 {c.timeLimitMinutes}분</span>
        </div>
        <h1>{c.title}</h1>
        {c.coverImage && <img className="cover" src={c.coverImage} alt="" />}
        <p className="prewrap">{c.summary}</p>

        <h2>용의자</h2>
        <ul className="suspect-grid">
          {c.suspects.map((s) => (
            <li key={s.id} className="suspect-card">
              {s.image && <img src={s.image} alt="" />}
              <strong>{s.name}</strong>
              <p className="muted">{s.profile}</p>
            </li>
          ))}
        </ul>

        <h2>수사 규칙</h2>
        <ul className="rules">
          <li>제한 시간 {c.timeLimitMinutes}분 안에 사건을 해결하세요. 시간이 끝나면 바로 보고서를 작성해야 합니다.</li>
          <li>현장을 조사해 단서를 모으면 용의자에게 새로운 질문을 할 수 있습니다.</li>
          <li>범인, 동기, 수법을 맞히고 핵심 단서를 많이 찾을수록 높은 등급을 받습니다.</li>
        </ul>

        <div className="actions">
          {!progress && <button className="btn btn-primary" onClick={start}>수사 개시</button>}
          {progress && !progress.report && (
            <button className="btn btn-primary" onClick={() => navigate(`/case/${c.id}/play`)}>이어서 수사</button>
          )}
          {progress?.report && (
            <button className="btn btn-primary" onClick={() => navigate(`/case/${c.id}/result`)}>결과 보기</button>
          )}
          {progress && <button className="btn" onClick={restart}>재수사하기</button>}
        </div>
      </article>
    </Layout>
  );
}
```

- [ ] **Step 4: 스타일 작성** — `src/styles.css`

```css
:root {
  --bg: #0f0e0d;
  --surface: #1a1816;
  --surface-2: #24211e;
  --paper: #e9e1cf;
  --text: #ece6da;
  --muted: #a39b8d;
  --line: #3a352f;
  --accent: #c0392b;
  --accent-2: #e06a4f;
  --ok: #6fbf73;
  --warn: #e0a84f;
  --radius: 10px;
  --font-title: 'Special Elite', 'Noto Sans KR', monospace;
  --font-body: 'Noto Sans KR', system-ui, sans-serif;
}

* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.6;
}
img { max-width: 100%; display: block; }
h1, h2, .logo, .eyebrow, .timer, .grade-letter, .stamp { font-family: var(--font-title); letter-spacing: 0.02em; }
h1 { font-size: clamp(1.5rem, 4vw, 2.2rem); margin: 0.2em 0 0.5em; }
h2 { font-size: 1.15rem; margin: 1.6em 0 0.6em; }
a { color: inherit; }
ul { padding-left: 1.2em; }

.app { min-height: 100vh; }
.topbar { border-bottom: 1px solid var(--line); padding: 14px 16px; }
.logo { text-decoration: none; color: var(--accent-2); font-size: 1.3rem; }
.container { max-width: 1040px; margin: 0 auto; padding: 24px 16px 64px; }

.panel { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; }
.center { text-align: center; }
.muted { color: var(--muted); }
.prewrap { white-space: pre-wrap; }
.hint { color: var(--warn); font-size: 0.95rem; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; padding: 0 18px; border-radius: 8px;
  border: 1px solid var(--line); background: var(--surface-2); color: var(--text);
  font: inherit; font-weight: 500; cursor: pointer; text-decoration: none;
}
.btn:hover:not(:disabled) { border-color: var(--muted); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--accent-2); border-color: var(--accent-2); }
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }

.hero { padding: 24px 0 32px; }
.eyebrow { color: var(--accent-2); margin: 0; }
.case-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
.case-card {
  display: block; position: relative; text-decoration: none;
  background: var(--paper); color: #2a241d; border-radius: var(--radius); padding: 20px;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.4); transition: transform 0.15s;
}
.case-card:hover { transform: translateY(-3px); }
.case-card .muted { color: #6b6255; }
.case-card h2 { margin: 0.4em 0; }
.case-card.is-broken { opacity: 0.6; }
.card-meta { display: flex; gap: 12px; font-size: 0.85rem; color: var(--muted); }
.case-card .card-meta { color: #6b6255; }
.badge {
  display: inline-block; margin-top: 8px; padding: 2px 10px; border-radius: 999px;
  border: 1px solid var(--accent); color: var(--accent); font-size: 0.8rem; font-weight: 700;
}

.cover { border-radius: var(--radius); margin-bottom: 16px; }
.suspect-grid { list-style: none; padding: 0; display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
.suspect-card { background: var(--surface-2); border-radius: 8px; padding: 14px; }
.suspect-card img { border-radius: 6px; margin-bottom: 8px; }
.suspect-card p { margin: 4px 0 0; font-size: 0.9rem; }
.rules li { margin-bottom: 6px; }

/* 게임 화면 */
.playbar {
  position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 12px;
  padding: 10px 16px; background: var(--bg); border-bottom: 1px solid var(--line);
}
.playbar .back { flex: 1; min-width: 0; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.timer { font-size: 1.3rem; }
.timer.is-low { color: var(--accent-2); }
.banner { margin: 12px 16px 0; padding: 10px 14px; border-radius: 8px; background: rgba(224, 168, 79, 0.15); border: 1px solid var(--warn); display: flex; gap: 12px; align-items: center; justify-content: space-between; }
.tabs { display: flex; gap: 4px; padding: 12px 16px 0; overflow-x: auto; }
.tab { flex: 1; min-height: 44px; border: 1px solid var(--line); border-bottom: none; border-radius: 8px 8px 0 0; background: var(--surface-2); color: var(--muted); font: inherit; cursor: pointer; white-space: nowrap; padding: 0 12px; }
.tab.is-active { background: var(--surface); color: var(--text); font-weight: 700; }
.play-body { padding: 0 16px 48px; }

.split { display: grid; gap: 12px; grid-template-columns: 200px 1fr; }
.sidebar { display: flex; flex-direction: column; gap: 6px; }
.side-btn {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  min-height: 44px; padding: 8px 12px; border-radius: 8px; text-align: left;
  border: 1px solid var(--line); background: var(--surface); color: var(--text); font: inherit; cursor: pointer;
}
.side-btn.is-active { border-color: var(--accent); }
.side-btn small { color: var(--muted); }

.scene { border-radius: 8px; margin-bottom: 12px; }
.item-grid { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); margin-top: 12px; }
.item {
  min-height: 56px; padding: 10px; border-radius: 8px; border: 1px dashed var(--line);
  background: var(--surface-2); color: var(--text); font: inherit; cursor: pointer; text-align: left;
}
.item img { border-radius: 4px; margin-bottom: 6px; }
.item.is-done { border-style: solid; color: var(--muted); }
.item.is-active { border-color: var(--accent); color: var(--text); }
.item:disabled { cursor: not-allowed; opacity: 0.5; }
.item small { display: block; color: var(--muted); }

.detail { margin-top: 16px; background: var(--paper); color: #2a241d; border-radius: 8px; padding: 16px; }
.detail h3 { margin: 0 0 6px; }
.detail img { border-radius: 6px; margin-bottom: 10px; }
.clue-tag { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #b7ab94; font-weight: 700; color: var(--accent); }

.suspect-head { display: flex; gap: 14px; align-items: flex-start; }
.suspect-head img { width: 80px; border-radius: 8px; }
.suspect-head h2 { margin: 0; }
.transcript { margin: 16px 0; display: flex; flex-direction: column; gap: 12px; }
.qa { background: var(--surface-2); border-radius: 8px; padding: 12px 14px; }
.qa p { margin: 0; }
.qa-q { color: var(--muted); }
.qa-a { margin-top: 4px !important; }
.questions { display: flex; flex-direction: column; gap: 8px; }
.questions .btn { justify-content: flex-start; text-align: left; padding: 10px 14px; height: auto; }

.journal { display: grid; gap: 12px; }
.clue-list { padding-left: 1.4em; }
.clue-list li { margin-bottom: 8px; }
.clue-list small { display: block; }
.memo {
  width: 100%; min-height: 160px; resize: vertical; padding: 12px; border-radius: 8px;
  background: var(--paper); color: #2a241d; border: none; font: inherit;
}

.modal { position: fixed; inset: 0; z-index: 20; background: rgba(0, 0, 0, 0.75); display: grid; place-items: center; padding: 16px; }
.modal .panel { max-width: 560px; width: 100%; }

/* 보고서·결과 */
.report-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 8px; }
fieldset { border: 1px solid var(--line); border-radius: 8px; margin: 16px 0; padding: 12px 16px; }
legend { font-weight: 700; padding: 0 6px; }
.choice { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; cursor: pointer; }
.choice input { margin-top: 0.35em; accent-color: var(--accent); }

.stamp {
  display: inline-block; transform: rotate(-4deg); border: 3px solid var(--accent); color: var(--accent);
  padding: 2px 12px; font-size: 1.1rem; margin: 0;
}
.grade { display: flex; align-items: baseline; gap: 14px; margin: 8px 0 20px; }
.grade-letter { font-size: 4rem; line-height: 1; color: var(--accent-2); }
.grade-letter.grade-S { color: var(--warn); }
.score-table { width: 100%; border-collapse: collapse; }
.score-table th, .score-table td { padding: 10px 8px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
.score-table th { width: 90px; color: var(--muted); font-weight: 500; }
.ok { color: var(--ok); }
.ng { color: var(--accent-2); }

@media (max-width: 640px) {
  .split { grid-template-columns: 1fr; }
  .sidebar { flex-direction: row; overflow-x: auto; }
  .side-btn { flex: 0 0 auto; }
  .score-table th { width: 64px; }
}
```

- [ ] **Step 5: 타입 검사와 수동 확인**

Run: `npx tsc --noEmit`
Expected: 오류 없음

Run: `npm run dev` 후 브라우저에서 `http://localhost:5173/`
Expected:
- 목록에 "사라진 '푸른 새벽'" 카드가 보인다
- 카드를 누르면 소개 화면 → 용의자 3명, 규칙, "수사 개시" 버튼
- `#/case/nope` 접속 시 "존재하지 않는 사건입니다."

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: add routing, case list and intro pages"
```

---

### Task 7: 게임 화면 (타이머 + 조사/심문/일지 탭)

**Files:**
- Create: `src/components/TabProps.ts`, `src/components/InvestigateTab.tsx`, `src/components/InterrogateTab.tsx`, `src/components/JournalTab.tsx`
- Modify: `src/pages/Play.tsx` (임시 내용 전체 교체)

**Interfaces:**
- Consumes: `useProgress`, `useNow`, `remainingSeconds`, `shouldWarn`, `formatTime`, `inspectItem`, `askDialogue`, `getAvailableDialogues`, `isLocationExhausted`, `isUnlocked`, `findClue`, `clueSource`
- Produces: `interface TabProps { caseData: CaseData; progress: Progress; onChange: (p: Progress) => void }`

- [ ] **Step 1: 탭 공통 타입** — `src/components/TabProps.ts`

```ts
import type { CaseData, Progress } from '../types';

export interface TabProps {
  caseData: CaseData;
  progress: Progress;
  onChange: (p: Progress) => void;
}
```

- [ ] **Step 2: 현장 조사 탭** — `src/components/InvestigateTab.tsx`

```tsx
import { useState } from 'react';
import { isUnlocked } from '../engine/conditions';
import { findClue, inspectItem, isLocationExhausted } from '../engine/investigation';
import type { Item } from '../types';
import type { TabProps } from './TabProps';

export default function InvestigateTab({ caseData: c, progress, onChange }: TabProps) {
  const [locationId, setLocationId] = useState(c.locations[0]?.id);
  const [itemId, setItemId] = useState<string | null>(null);

  const location = c.locations.find((l) => l.id === locationId);
  const items = c.items.filter((i) => i.locationId === locationId);
  const selected = items.find((i) => i.id === itemId);

  const open = (item: Item) => {
    setItemId(item.id);
    onChange(inspectItem(progress, item));
  };

  return (
    <div className="split">
      <nav className="sidebar" aria-label="장소">
        {c.locations.map((l) => {
          const all = c.items.filter((i) => i.locationId === l.id);
          const done = all.filter((i) => progress.inspectedItems.includes(i.id)).length;
          return (
            <button
              key={l.id}
              className={`side-btn ${l.id === locationId ? 'is-active' : ''}`}
              onClick={() => { setLocationId(l.id); setItemId(null); }}
            >
              {l.name}
              <small>{done}/{all.length}</small>
            </button>
          );
        })}
      </nav>

      {location && (
        <section className="panel">
          {location.image && <img className="scene" src={location.image} alt="" />}
          <h2 style={{ marginTop: 0 }}>{location.name}</h2>
          <p className="muted prewrap">{location.description}</p>
          {items.length === 0 && <p className="hint">이 장소엔 살펴볼 것이 없는 것 같아.</p>}
          {items.length > 0 && isLocationExhausted(c, progress, location.id) && (
            <p className="hint">이 장소는 다 살펴본 것 같아.</p>
          )}

          <div className="item-grid">
            {items.map((item) => {
              const locked = !isUnlocked(item.requires, progress.clues);
              const done = progress.inspectedItems.includes(item.id);
              return (
                <button
                  key={item.id}
                  disabled={locked}
                  className={`item ${done ? 'is-done' : ''} ${item.id === itemId ? 'is-active' : ''}`}
                  onClick={() => open(item)}
                >
                  {item.image && !locked && <img src={item.image} alt="" />}
                  {done ? '✓ ' : ''}{item.name}
                  {locked && <small>아직 살펴볼 수 없다</small>}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="detail">
              <h3>{selected.name}</h3>
              {selected.image && <img src={selected.image} alt="" />}
              <p className="prewrap" style={{ margin: 0 }}>{selected.description}</p>
              {selected.givesClues?.map((id) => (
                <p key={id} className="clue-tag">단서 획득: {findClue(c, id)?.text}</p>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 용의자 심문 탭** — `src/components/InterrogateTab.tsx`

```tsx
import { useState } from 'react';
import { askDialogue, findClue, getAvailableDialogues } from '../engine/investigation';
import type { Dialogue } from '../types';
import type { TabProps } from './TabProps';

export default function InterrogateTab({ caseData: c, progress, onChange }: TabProps) {
  const [suspectId, setSuspectId] = useState(c.suspects[0]?.id);
  const suspect = c.suspects.find((s) => s.id === suspectId);

  const transcript = progress.askedDialogues
    .map((id) => c.dialogues.find((d) => d.id === id))
    .filter((d): d is Dialogue => !!d && d.suspectId === suspectId);
  const available = suspect ? getAvailableDialogues(c, progress, suspect.id) : [];

  return (
    <div className="split">
      <nav className="sidebar" aria-label="용의자">
        {c.suspects.map((s) => (
          <button
            key={s.id}
            className={`side-btn ${s.id === suspectId ? 'is-active' : ''}`}
            onClick={() => setSuspectId(s.id)}
          >
            {s.name}
            {getAvailableDialogues(c, progress, s.id).length > 0 && <small>●</small>}
          </button>
        ))}
      </nav>

      {suspect && (
        <section className="panel">
          <header className="suspect-head">
            {suspect.image && <img src={suspect.image} alt="" />}
            <div>
              <h2>{suspect.name}</h2>
              <p className="muted" style={{ margin: 0 }}>{suspect.profile}</p>
            </div>
          </header>

          <div className="transcript">
            {transcript.length === 0 && <p className="muted">아직 심문 기록이 없습니다.</p>}
            {transcript.map((d) => (
              <div key={d.id} className="qa">
                <p className="qa-q">Q. {d.question}</p>
                <p className="qa-a prewrap">{d.answer}</p>
                {d.givesClues?.map((id) => (
                  <p key={id} className="hint" style={{ marginTop: 6 }}>단서 획득: {findClue(c, id)?.text}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="questions">
            {available.length === 0 ? (
              <p className="hint">지금은 더 물어볼 것이 없다. 단서를 더 찾아보자.</p>
            ) : (
              available.map((d) => (
                <button key={d.id} className="btn" onClick={() => onChange(askDialogue(progress, d))}>
                  ▶ {d.question}
                </button>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 수사 일지 탭** — `src/components/JournalTab.tsx`

```tsx
import { clueSource, findClue } from '../engine/investigation';
import type { TabProps } from './TabProps';

export default function JournalTab({ caseData: c, progress, onChange }: TabProps) {
  return (
    <div className="journal">
      <section className="panel">
        <h2 style={{ marginTop: 0 }}>사건 브리핑</h2>
        <p className="prewrap" style={{ margin: 0 }}>{c.briefing}</p>
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0 }}>수집한 단서 ({progress.clues.length})</h2>
        {progress.clues.length === 0 ? (
          <p className="muted">아직 수집한 단서가 없습니다.</p>
        ) : (
          <ol className="clue-list">
            {progress.clues.map((id) => (
              <li key={id}>
                {findClue(c, id)?.text}
                <small className="muted">{clueSource(c, progress, id)}</small>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0 }}>메모장</h2>
        <textarea
          className="memo"
          value={progress.memo}
          placeholder="수사 메모를 입력하세요."
          onChange={(e) => onChange({ ...progress, memo: e.target.value })}
        />
      </section>
    </div>
  );
}
```

- [ ] **Step 5: 게임 화면** — `src/pages/Play.tsx` (전체 교체)

```tsx
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import InterrogateTab from '../components/InterrogateTab';
import InvestigateTab from '../components/InvestigateTab';
import JournalTab from '../components/JournalTab';
import { formatTime, remainingSeconds, shouldWarn } from '../engine/timer';
import { useNow } from '../hooks/useNow';
import { useProgress } from '../hooks/useProgress';
import type { CasePageProps } from './CaseRoute';

type Tab = 'investigate' | 'interrogate' | 'journal';

export default function Play({ caseData: c }: CasePageProps) {
  const [progress, setProgress] = useProgress(c);
  const now = useNow();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('investigate');
  const [showBriefing, setShowBriefing] = useState(
    () => !!progress && progress.inspectedItems.length === 0 && progress.askedDialogues.length === 0,
  );
  const [warningDismissed, setWarningDismissed] = useState(false);

  const remaining = progress ? remainingSeconds(c, progress, now) : 0;
  const timeUp = !!progress && !progress.report && remaining === 0;

  useEffect(() => {
    if (timeUp) navigate(`/case/${c.id}/report`, { replace: true });
  }, [timeUp, navigate, c.id]);

  if (!progress) return <Navigate to={`/case/${c.id}`} replace />;
  if (progress.report) return <Navigate to={`/case/${c.id}/result`} replace />;

  const finish = () => {
    if (window.confirm('수사를 종결하고 보고서를 작성하시겠습니까?')) navigate(`/case/${c.id}/report`);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'investigate', label: '현장 조사' },
    { id: 'interrogate', label: '용의자 심문' },
    { id: 'journal', label: `수사 일지 (${progress.clues.length})` },
  ];
  const tabProps = { caseData: c, progress, onChange: setProgress };

  return (
    <div className="app">
      <div className="playbar">
        <Link to={`/case/${c.id}`} className="back">← {c.title}</Link>
        <span className={`timer ${remaining <= 600 ? 'is-low' : ''}`} aria-label="남은 시간">
          {formatTime(remaining)}
        </span>
        <button className="btn btn-primary" onClick={finish}>수사 종결</button>
      </div>

      {shouldWarn(c, remaining) && !warningDismissed && (
        <div className="banner" role="alert">
          <span>제한 시간이 10분 남았습니다. 범인을 특정했다면 수사를 종결하세요.</span>
          <button className="btn" onClick={() => setWarningDismissed(true)}>확인</button>
        </div>
      )}

      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="play-body">
        {tab === 'investigate' && <InvestigateTab {...tabProps} />}
        {tab === 'interrogate' && <InterrogateTab {...tabProps} />}
        {tab === 'journal' && <JournalTab {...tabProps} />}
      </div>

      {showBriefing && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="panel">
            <p className="eyebrow">새로운 사건 의뢰가 들어왔습니다</p>
            <h2>{c.title}</h2>
            <p className="prewrap">{c.briefing}</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => setShowBriefing(false)}>수사를 시작합니다</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: 타입 검사와 수동 확인**

Run: `npx tsc --noEmit`
Expected: 오류 없음

`npm run dev`로 확인:
- 소개 → "수사 개시" → 브리핑 모달 → 닫으면 타이머 30:00부터 감소
- 관리실 "윤채원의 가방"은 잠겨 있다가 "공구함"을 조사하면 열림
- 박도현의 "CCTV가 왜 꺼져 있었죠?" 질문은 CCTV 모니터 조사 후 나타남
- 수사 일지에 단서와 출처, 메모 입력 후 새로고침해도 유지
- 진행 기록을 지운 상태(개발자도구에서 localStorage 삭제)로 `#/case/sample/play` 접속 → 소개 화면으로 이동

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: add play screen with timer and investigation tabs"
```

---

### Task 8: 보고서 + 결과 화면

**Files:**
- Modify: `src/pages/Report.tsx`, `src/pages/Result.tsx` (임시 내용 전체 교체)

**Interfaces:**
- Consumes: `useProgress`, `remainingSeconds`, `formatTime`, `score`, `newProgress`

- [ ] **Step 1: 보고서 화면** — `src/pages/Report.tsx`

```tsx
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { formatTime, remainingSeconds } from '../engine/timer';
import { useProgress } from '../hooks/useProgress';
import type { CasePageProps } from './CaseRoute';

function Choices({ name, options, value, onChange }: {
  name: string; options: string[]; value: number | null; onChange: (i: number) => void;
}) {
  return (
    <>
      {options.map((text, i) => (
        <label key={i} className="choice">
          <input type="radio" name={name} checked={value === i} onChange={() => onChange(i)} />
          <span>{text}</span>
        </label>
      ))}
    </>
  );
}

export default function Report({ caseData: c }: CasePageProps) {
  const [progress, setProgress] = useProgress(c);
  const navigate = useNavigate();
  const [culpritId, setCulpritId] = useState<string | null>(null);
  const [motive, setMotive] = useState<number | null>(null);
  const [method, setMethod] = useState<number | null>(null);
  const [openedAt] = useState(() => Date.now());

  if (!progress) return <Navigate to={`/case/${c.id}`} replace />;
  if (progress.report) return <Navigate to={`/case/${c.id}/result`} replace />;

  const remaining = remainingSeconds(c, progress, openedAt);
  const ready = culpritId !== null && motive !== null && method !== null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (culpritId === null || motive === null || method === null) return;
    if (!window.confirm('보고서를 제출하면 수정할 수 없습니다. 제출하시겠습니까?')) return;
    setProgress({ ...progress, report: { culpritId, motive, method }, finishedAt: Date.now() });
    navigate(`/case/${c.id}/result`);
  };

  return (
    <Layout>
      <form className="panel" onSubmit={submit}>
        <div className="report-head">
          <h1>수사결과보고서</h1>
          <span className={`timer ${remaining === 0 ? 'is-low' : ''}`}>
            {remaining > 0 ? `남은 시간 ${formatTime(remaining)}` : '제한 시간 종료'}
          </span>
        </div>
        <p className="muted">지금까지 수집한 단서를 바탕으로 범인을 지목하고 사건을 재구성하세요.</p>

        <fieldset>
          <legend>1. 범인은 누구인가?</legend>
          {c.suspects.map((s) => (
            <label key={s.id} className="choice">
              <input type="radio" name="culprit" checked={culpritId === s.id} onChange={() => setCulpritId(s.id)} />
              <span>{s.name} <small className="muted">— {s.profile}</small></span>
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>2. 동기는 무엇인가?</legend>
          <Choices name="motive" options={c.solution.motive.options} value={motive} onChange={setMotive} />
        </fieldset>

        <fieldset>
          <legend>3. 어떻게 범행했는가?</legend>
          <Choices name="method" options={c.solution.method.options} value={method} onChange={setMethod} />
        </fieldset>

        <div className="actions">
          {remaining > 0 && <Link className="btn" to={`/case/${c.id}/play`}>수사로 돌아가기</Link>}
          <button className="btn btn-primary" type="submit" disabled={!ready}>보고서 제출</button>
        </div>
      </form>
    </Layout>
  );
}
```

- [ ] **Step 2: 결과 화면** — `src/pages/Result.tsx`

```tsx
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { newProgress } from '../engine/investigation';
import { score } from '../engine/scoring';
import { useProgress } from '../hooks/useProgress';
import type { CasePageProps } from './CaseRoute';

function Row({ label, mine, answer, ok }: { label: string; mine?: string; answer?: string; ok: boolean }) {
  return (
    <tr>
      <th>{label}</th>
      <td>
        <span className={ok ? 'ok' : 'ng'}>{ok ? '✓' : '✗'}</span> {mine ?? '-'}
        {!ok && <div className="muted">정답: {answer}</div>}
      </td>
    </tr>
  );
}

export default function Result({ caseData: c }: CasePageProps) {
  const [progress, setProgress] = useProgress(c);
  const navigate = useNavigate();

  if (!progress) return <Navigate to={`/case/${c.id}`} replace />;
  const result = score(c, progress);
  const report = progress.report;
  if (!result || !report) return <Navigate to={`/case/${c.id}/play`} replace />;

  const nameOf = (id: string) => c.suspects.find((s) => s.id === id)?.name;
  const { motive, method } = c.solution;

  const restart = () => {
    if (!window.confirm('처음부터 다시 수사하시겠습니까?')) return;
    setProgress(newProgress(c.id, Date.now()));
    navigate(`/case/${c.id}/play`);
  };

  return (
    <Layout>
      <article className="panel">
        <p className="stamp">{result.culpritCorrect ? 'CASE CLOSED' : 'UNSOLVED'}</p>
        <h1>{result.culpritCorrect ? '사건을 해결했습니다!' : '범인 검거 실패'}</h1>

        <div className="grade">
          <span className={`grade-letter grade-${result.grade}`}>{result.grade}</span>
          <span>{result.total}점 / 100</span>
        </div>

        <table className="score-table">
          <tbody>
            <Row label="범인" mine={nameOf(report.culpritId)} answer={nameOf(c.solution.culpritId)} ok={result.culpritCorrect} />
            <Row label="동기" mine={motive.options[report.motive]} answer={motive.options[motive.answer]} ok={result.motiveCorrect} />
            <Row label="수법" mine={method.options[report.method]} answer={method.options[method.answer]} ok={result.methodCorrect} />
            {result.keyCluesTotal > 0 && (
              <tr>
                <th>핵심 단서</th>
                <td>{result.keyCluesFound} / {result.keyCluesTotal}</td>
              </tr>
            )}
          </tbody>
        </table>

        {result.missedKeyClues > 0 && <p className="hint">핵심 단서 {result.missedKeyClues}개를 놓쳤습니다.</p>}

        <h2>사건의 진상</h2>
        <p className="prewrap">{c.solution.explanation}</p>

        <div className="actions">
          <button className="btn btn-primary" onClick={restart}>재수사하기</button>
          <Link className="btn" to="/">사건 목록</Link>
        </div>
      </article>
    </Layout>
  );
}
```

- [ ] **Step 3: 타입 검사와 수동 확인**

Run: `npx tsc --noEmit`
Expected: 오류 없음

`npm run dev`로 확인:
- 수사 종결 → 보고서. 세 항목을 다 고르기 전엔 제출 버튼 비활성
- 정답(윤채원 / 빚 / CCTV+드라이버) 제출 + 핵심 단서 3개 모두 → "사건을 해결했습니다!", S, 100점
- 범인 오답 → "범인 검거 실패", C
- 결과 화면에서 뒤로 가기로 `#/case/sample/play` 접근 → 결과 화면으로 돌아옴
- 보고서 제출 전 `#/case/sample/result` 직접 접근 → 게임 화면으로 이동
- 목록 카드에 "종결" 배지

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "feat: add report and result screens"
```

---

### Task 9: 최종 검증 + README

**Files:**
- Create: `README.md`

- [ ] **Step 1: README 작성** — `README.md`

````markdown
# CASE FILE

현장 조사 → 용의자 심문 → 보고서 제출로 진행되는 추리게임.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm test         # 엔진 테스트
npm run build    # dist/ 에 정적 사이트 생성
```

## 새 사건 추가

`src/cases/<사건id>.json` 파일을 추가하면 목록에 자동으로 나타납니다.
형식은 `src/types.ts`의 `CaseData`와 `src/cases/sample.json`을 참고하세요.

- `items[].requires` / `dialogues[].requires`: 이 단서를 모두 가져야 조사·질문 가능
- `givesClues`: 조사하거나 질문했을 때 얻는 단서
- `clues[].isKey`: 채점에 들어가는 핵심 단서
- 이미지는 `public/` 폴더에 넣고 `"image": "images/xxx.png"`처럼 적습니다.

참조 id에 오타가 있으면 목록에 "데이터 오류"가 표시되고 브라우저 콘솔에 상세 내용이 나옵니다.

## 채점

범인 50 + 동기 20 + 수법 20 + 핵심 단서 수집률 10. S ≥ 90, A ≥ 75, B ≥ 50, C. 범인을 틀리면 C.
````

- [ ] **Step 2: 전체 테스트와 빌드**

Run: `npm test`
Expected: 모든 테스트 PASS

Run: `npm run build`
Expected: 타입 오류 없이 `dist/` 생성

- [ ] **Step 3: 모바일 폭 확인**

`npm run preview` 후 브라우저 개발자도구에서 360px 폭으로 목록·게임·보고서·결과 화면 확인. 가로 스크롤 없음.

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "docs: add README with case authoring guide"
```
