import { useState } from 'react';
import { assetUrl } from '../assetUrl';
import { rooms } from '../data/rooms';
import type { ItemDef, ZoomDef } from '../data/types';
import { useGame } from '../state/GameContext';
import DialogBox from './DialogBox';
import { themeVars } from './themeVars';
import { whereFound } from './whereFound';

type Of<K extends ZoomDef['kind']> = Extract<ZoomDef, { kind: K }>;

function LogDevice({ zoom }: { zoom: Of<'log'> }) {
  const last = zoom.rows[zoom.rows.length - 1]?.[0] ?? '--:--';
  return (
    <div className={`device device-${zoom.device}`}>
      {zoom.device === 'doorlock' && (
        <div className="device-top"><span>DOOR LOCK</span><span className="device-led">ON</span></div>
      )}
      {zoom.device === 'wallpad' && (
        <div className="device-top"><span>HOME PAD</span><span>2026.10</span></div>
      )}
      {zoom.device === 'oven' && (
        <div className="oven-display"><span className="oven-knob" aria-hidden="true" /><span>{last}</span><span className="oven-knob" aria-hidden="true" /></div>
      )}
      <div className="device-screen">
        {zoom.device === 'wallpad' ? (
          <div className="wallpad-tabs" aria-hidden="true"><span className="is-active">출입</span><span>호출</span><span>방문자</span></div>
        ) : (
          <div className="device-screen-head"><span>{zoom.device === 'oven' ? '조리 기록' : '출입 기록'}</span><span>{zoom.device === 'oven' ? 'HISTORY' : 'LOG'}</span></div>
        )}
        <table className="log-table">
          <thead>
            <tr>{zoom.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
          </thead>
          <tbody>
            {zoom.rows.map((row, i) => (
              <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
        <div className="device-screen-foot"><span>{zoom.device === 'wallpad' ? '최근 기록' : '2026.10'}</span><span>◀ 1/1 ▶</span></div>
      </div>
      {zoom.device === 'doorlock' && (
        <div className="doorlock-keys" aria-hidden="true">
          {['1', '2', '3', '4', '5', '6', '*', '0', '#'].map((k) => <span key={k}>{k}</span>)}
        </div>
      )}
      {zoom.device === 'wallpad' && (
        <div className="wallpad-keys" aria-hidden="true"><span>홈</span><span>통화</span><span className="is-on">열림</span></div>
      )}
    </div>
  );
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function Calendar({ zoom }: { zoom: Of<'calendar'> }) {
  const cells: (number | null)[] = [
    ...Array.from({ length: zoom.firstWeekday }, () => null),
    ...Array.from({ length: zoom.days }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  return (
    <div className="calendar pix">
      <img className="calendar-rings" src={assetUrl('zoom/calendar_rings.svg')} alt="" />
      <div className="calendar-head">
        <span className="calendar-month">{zoom.month}<small>월</small></span>
        <span className="calendar-en">{['', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'][zoom.month]}</span>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {WEEKDAYS.map((d, i) => <span key={d} className={i === 0 ? 'is-sun' : i === 6 ? 'is-sat' : ''}>{d}</span>)}
      </div>
      <div className="calendar-grid calendar-days">
        {cells.map((n, i) => (
          <span key={i} className={`calendar-day ${i % 7 === 0 ? 'is-sun' : i % 7 === 6 ? 'is-sat' : ''} ${n === zoom.mark ? 'is-marked' : ''}`}>
            {n === zoom.mark && <img className="calendar-mark" src={assetUrl('zoom/calendar_mark.svg')} alt="" />}
            {n !== null && <span className="calendar-n">{n}</span>}
            {n === zoom.mark && <span className="calendar-note">{zoom.markLabel}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function Painting({ zoom }: { zoom: Of<'painting'> }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="painting">
      <div className={`flip-inner ${flipped ? 'is-flipped' : ''}`}>
        <div className="flip-face painting-front">
          <div className="painting-canvas" aria-hidden="true" />
          <span className="painting-plate">「첫 그림」</span>
          <p className="sr-only">{zoom.frontText}</p>
        </div>
        <div className="flip-face painting-back">
          <img src={assetUrl(zoom.image)} alt="액자 뒷면의 캔버스 천" />
          <p className="painting-hand">
            {zoom.handwriting.map((line) => (
              <span key={line} className={/\d{4}/.test(line) ? 'is-big' : ''}>{line}</span>
            ))}
          </p>
        </div>
      </div>
      <button className="pbtn painting-flip" onClick={() => setFlipped((f) => !f)}>{flipped ? '앞면 보기' : '액자 뒤집어 보기'}</button>
    </div>
  );
}

/** 텍스트가 많은 단서의 전체 화면 확대 보기 (기기 로그, 달력, 그림 뒷면) */
export default function ZoomScreen({ item }: { item: ItemDef }) {
  const { dispatch } = useGame();
  const zoom = item.zoom!;
  const room = rooms[whereFound(item.id)?.room ?? 'study'];
  const close = () => dispatch({ type: 'CLOSE_OVERLAY' });

  return (
    <section className={`zoom-screen zoom-${zoom.kind}`} style={themeVars(room.theme)} role="dialog" aria-modal="true" aria-label={item.name}>
      <header className="zoom-head">
        <button className="zoom-back pix" onClick={close}>◀ {room.name}로</button>
        <span className="zoom-heading">{zoom.kind === 'log' ? zoom.heading : item.name}</span>
      </header>
      <div className="zoom-body">
        {zoom.kind === 'log' && <LogDevice zoom={zoom} />}
        {zoom.kind === 'calendar' && <Calendar zoom={zoom} />}
        {zoom.kind === 'painting' && <Painting zoom={zoom} />}
      </div>
      <div className="zoom-dialog">
        <DialogBox speaker="나" title={zoom.title} text={zoom.line} />
      </div>
      <button className="zoom-close pix" onClick={close}>닫기</button>
    </section>
  );
}
