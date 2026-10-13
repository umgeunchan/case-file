# 추리게임 엔진 (case-file) 설계

작성일: 2026-10-13

## 목표

casezero.site와 비슷한 흐름(현장 조사 → 용의자 심문 → 보고서 제출 → 채점)의 추리게임을 만든다.
이번 범위는 **게임 엔진과 화면 구조**이며, 실제 시나리오와 아이템은 사용자가 나중에 제공한다.
시나리오는 JSON 파일 하나로 정의되고, 파일을 추가하는 것만으로 새 사건이 생겨야 한다.

### 범위 밖
로그인, 결제, 커뮤니티, AI 실시간 심문, 백엔드 서버. (AI 심문은 추후 붙일 수 있도록 심문 로직을 한 모듈에 격리한다.)

## 기술 스택

- React 18 + Vite + TypeScript
- React Router (화면 라우팅)
- Vitest (엔진 로직 테스트)
- 상태 저장: localStorage
- 정적 사이트로 빌드 (`npm run build` → `dist/`)

## 화면

| 경로 | 화면 | 내용 |
|---|---|---|
| `/` | 사건 목록 | 사건 카드(제목, 난이도, 제한 시간, 진행중/종결 표시) |
| `/case/:caseId` | 사건 소개 | 개요, 등장 용의자, 규칙 안내, "수사 개시"/"이어서 수사" 버튼 |
| `/case/:caseId/play` | 게임 | 상단: 타이머, 수사 종결 버튼. 탭: 현장 조사 / 용의자 심문 / 수사 일지 |
| `/case/:caseId/report` | 수사결과보고서 | 범인, 동기, 수법 객관식 선택 후 제출 |
| `/case/:caseId/result` | 결과 | 점수, 등급, 각 항목 정오, 해설, 놓친 핵심 단서 수 |

### 게임 화면 탭
- **현장 조사**: 장소 목록 → 장소 선택 시 아이템 목록. 아이템 클릭 시 설명을 보여주고 단서를 획득한다. 잠긴 아이템(조건 미충족)은 "아직 살펴볼 수 없다"로 표시한다. 장소의 아이템을 모두 조사하면 "이 장소는 다 살펴본 것 같아"를 표시한다.
- **용의자 심문**: 용의자 선택 → 열린 질문 목록에서 선택 → 답변이 대화 기록에 추가된다. 답변으로 단서를 얻을 수 있다. 이미 한 질문은 다시 표시하지 않는다.
- **수사 일지**: 획득한 단서 목록(획득 출처 표시) + 자유 메모 입력란.

## 시나리오 데이터

위치: `src/cases/<caseId>.json`. `import.meta.glob`으로 자동 로드한다.

```ts
interface CaseData {
  id: string;
  title: string;
  summary: string;          // 사건 개요(소개 화면)
  briefing: string;         // 수사 시작 시 보여줄 브리핑
  difficulty: 1 | 2 | 3;
  timeLimitMinutes: number;
  coverImage?: string;

  locations: { id: string; name: string; description: string; image?: string }[];

  items: {
    id: string;
    locationId: string;
    name: string;
    description: string;    // 조사 시 보여줄 내용
    image?: string;
    givesClues?: string[];  // 조사 시 획득하는 단서 id
    requires?: string[];    // 이 단서들을 모두 가져야 조사 가능
  }[];

  clues: { id: string; text: string; isKey: boolean }[];

  suspects: { id: string; name: string; profile: string; image?: string }[];

  dialogues: {
    id: string;
    suspectId: string;
    question: string;
    answer: string;
    requires?: string[];    // 이 단서들을 모두 가져야 질문이 열림
    givesClues?: string[];
  }[];

  solution: {
    culpritId: string;
    motive:  { options: string[]; answer: number };  // answer = options 인덱스
    method:  { options: string[]; answer: number };
    explanation: string;
  };
}
```

로드 시 검증한다: 참조하는 id(locationId, suspectId, 단서 id, culpritId)가 모두 존재하는지, answer 인덱스가 범위 안인지. 오류가 있으면 사건 목록에 "데이터 오류" 표시와 함께 콘솔에 상세 메시지를 남긴다.

## 진행 상태

```ts
interface Progress {
  caseId: string;
  startedAt: number;         // epoch ms
  inspectedItems: string[];
  askedDialogues: string[];  // 순서대로 = 심문 기록
  clues: string[];
  memo: string;
  report?: { culpritId: string; motive: number; method: number };
  finishedAt?: number;
}
```

- 키: `case-file:progress:<caseId>`. 모든 읽기/쓰기는 try/catch로 감싸고 실패 시 메모리 상태로만 진행한다.
- 남은 시간 = `timeLimitMinutes*60 - (now - startedAt)/1000`. 새로고침해도 실제 경과 시간 기준으로 계속 흐른다.
- 남은 시간이 10분이 되면 경고 배너를 한 번 띄운다. (제한 시간이 10분 이하인 사건은 경고 없음)
- 0이 되면 `/report`로 강제 이동하고, 보고서 화면에서는 타이머가 멈춘 것으로 표시한다(시간 초과 상태에서도 제출은 가능).
- "재수사하기"는 진행 상태를 지우고 처음부터 시작한다.

## 엔진 모듈 (순수 함수, UI와 분리)

`src/engine/`
- `loadCases.ts` — JSON 로드 + 검증
- `conditions.ts` — `isUnlocked(requires, clues)`
- `investigation.ts` — `inspectItem(progress, item)`, `askDialogue(progress, dialogue)` → 새 Progress 반환
- `scoring.ts` — `score(caseData, progress)` → 결과
- `storage.ts` — localStorage 읽기/쓰기

심문은 `investigation.ts`의 `askDialogue`와 `getAvailableDialogues`로만 이뤄지게 해서, 추후 AI 심문으로 바꿀 때 이 경계만 교체하면 되게 한다.

## 채점

| 항목 | 배점 |
|---|---|
| 범인 지목 | 50 |
| 동기 | 20 |
| 수법 | 20 |
| 핵심 단서 수집률 | 10 × (획득한 핵심 단서 수 / 전체 핵심 단서 수), 반올림 |

- 등급: S ≥ 90, A ≥ 75, B ≥ 50, C < 50
- 범인을 틀리면 점수와 무관하게 결과 화면 제목은 "범인 검거 실패"이고 등급은 C로 고정한다.
- 결과 화면에 "핵심 단서 N개를 놓쳤습니다"를 표시한다(핵심 단서가 0개인 사건이면 생략).

## 디자인

어두운 수사 파일 톤: 짙은 배경, 종이/서류 질감 카드, 붉은 강조색, 타자기풍 제목 폰트. 모바일 폭(360px)에서도 탭과 목록이 깨지지 않게 한다.

## 샘플 사건

엔진 확인용으로 짧은 샘플 사건 1개(`sample.json`)를 넣는다: 장소 2곳, 아이템 5개, 용의자 3명, 단서 6개(핵심 3개), 잠금 조건이 있는 아이템 1개와 질문 2개 이상. 실제 시나리오를 받으면 교체하거나 추가한다.

## 테스트

Vitest로 엔진만 테스트한다:
- 조건 판정(잠금/해제)
- 아이템 조사·심문 시 단서 획득, 중복 획득 방지
- 채점(만점, 범인 오답, 핵심 단서 0개 사건, 등급 경계값)
- 시나리오 검증(잘못된 참조 id 검출)
