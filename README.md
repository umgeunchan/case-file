# 펜트하우스의 마지막 잔

모바일 터치형 추리 어드벤처 프로토타입 (세로 390×844 기준). 명세는 [`game-spec.md`](game-spec.md)에 있습니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 단위 테스트 (데이터 무결성, 게임 로직, 정답 판정, 저장)
npm run build    # dist/ 에 정적 사이트 생성
```

- `?debug=1`을 붙이면 핫스팟 영역이 반투명 박스와 id로 표시됩니다. 예: `http://localhost:5173/?debug=1`
- 진행 상황은 localStorage(`penthouse:save:v1`)에 자동 저장되고, 타이틀의 "이어하기"로 불러옵니다.

## 구조

```
src/
  data/        시나리오 데이터 (코드에 하드코딩하지 않음)
    scenario.ts   사건 개요, 인트로, 용의자, 진상 타임라인
    rooms.ts      방과 핫스팟 (퍼센트 좌표 x, y, w, h)
    items.ts      아이템 (evidence, 보기 방식 popup/zoom/flip/dialog)
    locks.ts      서랍, 휴대폰 퍼즐
    deductions.ts 추리 노트 조합 (추리 결과끼리도 조합 가능)
    dialogues.ts  심문 대사 (after: 먼저 제시해야 하는 증거)
    endings.ts    범인, 판정 범주, 반박 대사, 엔딩 텍스트
  state/       게임 상태 (useReducer), 정답 판정, 저장/불러오기
  components/  화면 컴포넌트
  assets/      도트 에셋 위치 (README 참고)
  game.css     스타일. 폰트는 :root의 --font-ui / --font-dialog 로 교체
```

## 에셋 교체

`src/assets/`에 이미지를 넣고 데이터 파일에 경로만 적으면 플레이스홀더 대신 표시됩니다. 자세한 내용은 [`src/assets/README.md`](src/assets/README.md)를 보세요.

## 이전 버전

범용 사건 JSON 엔진(이 게임 이전 버전)은 git 태그 `v0.1-case-engine`에 남아 있습니다.
