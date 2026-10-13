import { drawerLock, phoneLock } from '../data/locks';
import { roomOrder, rooms } from '../data/rooms';
import type { RoomId } from '../data/types';

/** 아이템을 어느 방, 어느 물건에서 얻었는지 (팝업의 "획득 장소"와 확대 화면 테마에 쓴다) */
export function whereFound(itemId: string): { room: RoomId; spot: string } | null {
  for (const id of roomOrder) {
    for (const h of rooms[id].hotspots) {
      const a = h.action;
      const hit =
        ((a.type === 'item' || a.type === 'give') && a.item === itemId) ||
        (a.type === 'drawer' && drawerLock.rewards.includes(itemId)) ||
        (a.type === 'phone' && phoneLock.rewards.includes(itemId));
      if (hit) return { room: id, spot: h.label };
    }
  }
  return null;
}
