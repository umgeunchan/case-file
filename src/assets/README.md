# 에셋 폴더

도트 에셋을 이 폴더에 넣고, 데이터 파일의 경로만 채우면 플레이스홀더 대신 이미지가 나옵니다.

| 데이터 | 예시 경로 | 넣을 파일 |
|---|---|---|
| `src/data/rooms.ts` → `rooms.study.background` | `'rooms/study.png'` | `src/assets/rooms/study.png` |
| `src/data/items.ts` → `image` | `'items/earring.png'` | `src/assets/items/earring.png` |
| `src/data/scenario.ts` → `suspects[].sprites.final` | `'suspects/sera_final.png'` | `src/assets/suspects/sera_final.png` |

- 방 배경은 3:4 비율(예: 240×320, 360×480)로 만들면 핫스팟 퍼센트 좌표가 그대로 맞습니다.
- 모든 이미지는 `image-rendering: pixelated`로 표시됩니다.
