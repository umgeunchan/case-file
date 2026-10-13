import { describe, expect, it, vi } from 'vitest';
import { assetUrl } from '../assetUrl';
import { deductionList, deductions } from './deductions';
import { dialogues } from './dialogues';
import { categories, culprit, rebuttals } from './endings';
import { items, itemList } from './items';
import { drawerLock, phoneLock } from './locks';
import { rooms } from './rooms';
import { scenario, suspects } from './scenario';

const evidenceIds = new Set(itemList.filter((i) => i.evidence).map((i) => i.id));
const usable = (id: string) => evidenceIds.has(id) || id in deductions;

describe('시나리오 데이터 무결성', () => {
  it('아이템 id가 겹치지 않는다', () => {
    expect(new Set(itemList.map((i) => i.id)).size).toBe(itemList.length);
  });

  it('모든 핫스팟이 존재하는 아이템을 가리키고, 방 안에서 id가 겹치지 않는다', () => {
    for (const room of Object.values(rooms)) {
      const ids = room.hotspots.map((h) => h.id);
      expect(new Set(ids).size, room.id).toBe(ids.length);
      for (const h of room.hotspots) {
        if (h.action.type === 'item' || h.action.type === 'give') expect(items[h.action.item], h.id).toBeDefined();
        for (const v of [h.x, h.y, h.w, h.h]) expect(v).toBeGreaterThanOrEqual(0);
        expect(h.x + h.w, h.id).toBeLessThanOrEqual(100);
        expect(h.y + h.h, h.id).toBeLessThanOrEqual(100);
      }
    }
  });

  it('서랍과 휴대폰의 보상은 증거 아이템이다', () => {
    expect(items[drawerLock.requiresItem]).toBeDefined();
    for (const id of [...drawerLock.rewards, ...phoneLock.rewards]) expect(evidenceIds.has(id), id).toBe(true);
    expect(phoneLock.pin).toHaveLength(phoneLock.length);
  });

  it('추리 조합의 재료는 증거나 다른 추리 결과다', () => {
    for (const d of deductionList) for (const input of d.inputs) expect(usable(input), `${d.id}:${input}`).toBe(true);
  });

  it('심문 반응과 지목 범주는 쓸 수 있는 증거만 가리킨다', () => {
    for (const [suspect, dialogue] of Object.entries(dialogues)) {
      for (const r of dialogue.reactions) {
        expect(usable(r.evidence), `${suspect}:${r.evidence}`).toBe(true);
        for (const a of r.after ?? []) expect(usable(a), `${suspect}:after ${a}`).toBe(true);
      }
    }
    for (const c of categories) for (const id of c.accepted) expect(usable(id), `${c.id}:${id}`).toBe(true);
  });

  it('모든 용의자에게 대사가 있고, 범인이 아닌 용의자에게는 반박 대사가 있다', () => {
    for (const s of suspects) {
      expect(dialogues[s.id], s.id).toBeDefined();
      if (s.id !== culprit) expect(rebuttals[s.id], s.id).toBeDefined();
    }
  });

  it('확대 화면 아이템에는 확대 화면 내용이 있다', () => {
    for (const i of itemList) {
      expect(i.view === 'zoom', i.id).toBe(!!i.zoom);
      if (i.zoom?.kind === 'log') for (const row of i.zoom.rows) expect(row, i.id).toHaveLength(i.zoom.columns.length);
    }
  });

  it('데이터에 적힌 에셋 경로는 src/assets에서 찾을 수 있다', () => {
    const paths = [
      ...Object.values(rooms).map((r) => r.background),
      ...itemList.map((i) => i.image),
      ...suspects.flatMap((s) => Object.values(s.sprites)),
      scenario.victim.image,
      ...itemList.map((i) => (i.zoom?.kind === 'painting' ? i.zoom.image : undefined)),
    ].filter((p): p is string => !!p);
    expect(paths.length).toBeGreaterThan(30);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const p of paths) expect(assetUrl(p), p).toBeTruthy();
  });
});
