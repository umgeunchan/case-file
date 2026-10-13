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
