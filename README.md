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
