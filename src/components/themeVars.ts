import type { CSSProperties } from 'react';
import type { RoomTheme } from '../data/types';

/** 방 테마를 CSS 변수(--t-<키>)로 바꾼다 */
export function themeVars(theme: RoomTheme): CSSProperties {
  return Object.fromEntries(Object.entries(theme).map(([k, v]) => [`--t-${k}`, v])) as CSSProperties;
}
