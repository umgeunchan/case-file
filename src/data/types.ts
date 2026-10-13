export type RoomId = 'study' | 'living' | 'kitchen';
export type SuspectId = 'haeun' | 'minseok' | 'doyun' | 'sera';
export type Expression = 'normal' | 'sweat' | 'angry' | 'final';

/** 아이템을 터치했을 때 보여주는 방식 */
export type ItemView =
  | 'popup' // 이미지 + 이름 + 설명
  | 'zoom' // 텍스트가 많은 단서 확대 화면
  | 'flip' // 뒤집으면 뒷면 텍스트가 나오는 연출
  | 'dialog'; // 대화창에 설명만 출력 (분위기용)

export interface ItemDef {
  id: string;
  name: string;
  text: string;
  /** true면 인벤토리에 들어가고 추리·심문·지목에 쓸 수 있다 */
  evidence: boolean;
  /** 열쇠처럼 인벤토리에 보이지만 증거로는 쓰지 않는 아이템 */
  key?: boolean;
  view: ItemView;
  /** flip 연출에서 앞면에 보여줄 텍스트 */
  frontText?: string;
  /** src/assets 기준 경로. 없으면 플레이스홀더 */
  image?: string;
}

export type HotspotAction =
  | { type: 'item'; item: string }
  | { type: 'drawer' }
  | { type: 'phone' }
  | { type: 'give'; item: string; text: string; emptyText: string };

export interface Hotspot {
  id: string;
  label: string;
  /** 방 이미지 기준 퍼센트 좌표 (0~100) */
  x: number;
  y: number;
  w: number;
  h: number;
  action: HotspotAction;
}

export interface RoomDef {
  id: RoomId;
  name: string;
  /** src/assets 기준 경로. 없으면 colors로 단색 배경 */
  background?: string;
  colors: { base: string; accent: string; text: string };
  hotspots: Hotspot[];
}

export interface SuspectDef {
  id: SuspectId;
  name: string;
  age: number;
  relation: string;
  /** 겉보기 동기. null이면 숨김 */
  motive: string | null;
  statement: string;
  sprites: Partial<Record<Expression, string>>;
}

export interface Line {
  expr: Expression;
  text: string;
}

export interface Reaction extends Line {
  evidence: string;
  /** 이 증거들을 먼저 제시해야 나오는 반응 */
  after?: string[];
}

export interface SuspectDialogue {
  base: Line;
  reactions: Reaction[];
}

export interface DeductionDef {
  id: string;
  title: string;
  inputs: [string, string];
  text: string;
}
