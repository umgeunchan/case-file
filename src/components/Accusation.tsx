import { useState } from 'react';
import { assetUrl } from '../assetUrl';
import { slotCount } from '../data/endings';
import { suspects } from '../data/scenario';
import type { SuspectId } from '../data/types';
import { usableEvidence } from '../state/game';
import { useGame } from '../state/GameContext';
import DialogBox from './DialogBox';
import EvidenceChip, { evidenceName } from './EvidenceChip';
import { ItemIcon } from './Inventory';
import { deductions } from '../data/deductions';

function SlotIcon({ id }: { id: string }) {
  if (id in deductions) return <span className="item-icon is-placeholder ev-deduction-icon" aria-hidden="true">추</span>;
  return <ItemIcon id={id} />;
}

export default function Accusation() {
  const { state, dispatch } = useGame();
  const [suspect, setSuspect] = useState<SuspectId | null>(null);
  const [slots, setSlots] = useState<(string | null)[]>(() => Array(slotCount).fill(null));
  const [picking, setPicking] = useState<number | null>(null);
  const usable = usableEvidence(state);
  const filled = slots.filter((x): x is string => x !== null);
  const ready = !!suspect && filled.length === slotCount;
  const who = suspects.find((s) => s.id === suspect);

  const line = state.accuseNotice
    ? state.accuseNotice.text
    : ready
      ? '준비 완료. 결정적인 한 수를 던질 시간이다.'
      : who
        ? `${who.name}… 증거를 세 개 모두 골라야 한다.`
        : '용의자를 고르고, 증거 세 개를 맞춰 보자.';

  const put = (index: number, id: string | null) => {
    setSlots((s) => s.map((x, i) => (i === index ? id : x)));
    setPicking(null);
  };

  return (
    <section className="accuse-screen" role="dialog" aria-modal="true" aria-label="범인 지목">
      <header className="accuse-head">
        <button className="accuse-close" onClick={() => dispatch({ type: 'CLOSE_PANEL' })} aria-label="지목 그만두기">✕</button>
        <h2>범인을 지목하라!</h2>
        <p>용의자 1명과 결정적 증거 {slotCount}개를 고르세요</p>
      </header>

      <div className="accuse-body">
        <div className="suspect-cards">
          {suspects.map((s) => (
            <button
              key={s.id}
              className={`suspect-card ${suspect === s.id ? 'is-on' : ''}`}
              aria-pressed={suspect === s.id}
              onClick={() => setSuspect(s.id)}
            >
              <span className="suspect-card-art" style={{ background: s.card.bg }}>
                {assetUrl(s.sprites.normal) ? <img src={assetUrl(s.sprites.normal)} alt="" /> : <span>{s.name}</span>}
              </span>
              <span className="suspect-card-name">{s.name}</span>
              <span className="suspect-card-desc">{s.age} · {s.relation}</span>
            </button>
          ))}
        </div>

        <div className="slot-head"><span>결정적 증거</span><span>칸을 눌러 바꾸기</span></div>
        <div className="evidence-slots">
          {slots.map((id, i) => (
            <button key={i} className="evidence-slot" onClick={() => setPicking(i)} aria-label={id ? `증거 ${i + 1}: ${evidenceName(id)} (바꾸기)` : `증거 ${i + 1} 고르기`}>
              {id ? (
                <>
                  <SlotIcon id={id} />
                  <span className="slot-label">{evidenceName(id)}</span>
                </>
              ) : (
                <>
                  <span className="slot-plus">+</span>
                  <span className="slot-num">증거 {i + 1}</span>
                </>
              )}
            </button>
          ))}
        </div>

        <button
          className={`accuse-go ${ready ? 'is-ready' : ''}`}
          disabled={!ready}
          onClick={() => suspect && dispatch({ type: 'ACCUSE', suspect, evidence: filled })}
        >
          지목하기!
        </button>
      </div>

      <div className="zoom-dialog accuse-dialog">
        <DialogBox speaker="나" text={line} replayKey={state.accuseNotice?.seq} />
      </div>

      {picking !== null && (
        <div className="overlay" onClick={() => setPicking(null)}>
          <div className="picker pix" role="dialog" aria-modal="true" aria-label={`증거 ${picking + 1} 고르기`} onClick={(e) => e.stopPropagation()}>
            <div className="picker-head">
              <span>증거 {picking + 1} 고르기</span>
              {slots[picking] && <button className="link-btn" onClick={() => put(picking, null)}>비우기</button>}
            </div>
            <div className="ev-grid">
              {usable.length === 0 && <p className="muted-text">제출할 증거가 없다.</p>}
              {usable.map((id) => (
                <EvidenceChip
                  key={id}
                  id={id}
                  selected={slots[picking] === id}
                  disabled={slots.includes(id) && slots[picking] !== id}
                  onClick={() => put(picking, id)}
                />
              ))}
            </div>
            <button className="pbtn picker-cancel" onClick={() => setPicking(null)}>닫기</button>
          </div>
        </div>
      )}
    </section>
  );
}
