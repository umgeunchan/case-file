import { useEffect, useState } from 'react';
import { phoneLock } from '../data/locks';
import { rooms } from '../data/rooms';
import { useGame } from '../state/GameContext';
import DialogBox from './DialogBox';
import { themeVars } from './themeVars';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

function LockIcon({ open }: { open: boolean }) {
  return (
    <svg className="px" viewBox="0 0 12 14" width="36" height="42" role="img" aria-label={open ? '열린 자물쇠' : '잠긴 자물쇠'}>
      <path fill="#050506" d="M2 0h8v1h-8z M1 1h1v6h-1z M10 1h1v6h-1z M0 6h12v8h-12z" />
      <path fill={open ? '#4ae0c0' : '#8a8a96'} d="M2 1h8v1h-8z M2 2h1v4h-1z M9 2h1v4h-1z" />
      <path fill="#c9a050" d="M1 7h10v6h-10z" />
      <path fill="#f0d27a" d="M1 7h10v1h-10z M1 8h1v4h-1z" />
      <path fill="#8a6a2a" d="M10 8h1v5h-1z M2 12h8v1h-8z" />
      <path fill="#3a2410" d="M5 9h2v2h-2z M6 11h1v1h-1z" />
    </svg>
  );
}

function LockScreen({ onOpen }: { onOpen: (app: 'messages' | 'memo') => void }) {
  const { state, dispatch } = useGame();
  const [pin, setPin] = useState('');
  const error = state.phoneError;
  const [prompt, format] = phoneLock.prompt.split(' (');

  // 오답이 나오면 입력을 비운다
  useEffect(() => {
    if (error) setPin('');
  }, [error?.seq]); // eslint-disable-line react-hooks/exhaustive-deps

  const press = (key: string) => {
    if (key === 'back') return setPin((p) => p.slice(0, -1));
    if (key === 'clear') return setPin('');
    if (pin.length >= phoneLock.length) return;
    const next = pin + key;
    setPin(next);
    if (next.length === phoneLock.length) dispatch({ type: 'SUBMIT_PIN', pin: next });
  };

  const unlocked = state.phoneUnlocked;
  const message = unlocked ? '잠금 해제' : error ? error.text : '6자리 숫자를 입력하세요';
  const tone = unlocked ? 'is-ok' : error ? 'is-error' : '';

  return (
    <div className="phone-lock">
      <LockIcon open={unlocked} />
      <p className="phone-prompt">{prompt}</p>
      {format && <p className="phone-format">({format}</p>}
      <div className="pin-dots" aria-label={`${unlocked ? phoneLock.length : pin.length}자리 입력됨`}>
        {Array.from({ length: phoneLock.length }, (_, i) => (
          <span key={i} className={`pin-dot pix ${unlocked || i < pin.length ? 'is-filled' : ''}`} />
        ))}
      </div>
      <p className={`phone-msg ${tone}`} role="alert">{message}</p>
      {unlocked ? (
        <div className="phone-open">
          <p>{phoneLock.unlockText}<br />앱을 확인해 보자.</p>
          <button className="phone-app-btn is-primary pix" onClick={() => onOpen('messages')}>메시지 열기 ▶</button>
          <button className="phone-app-btn pix" onClick={() => onOpen('memo')}>메모 열기 ▶</button>
        </div>
      ) : (
        <div className="keypad">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`key ${key.length > 1 ? 'key-s' : ''}`}
              aria-label={key === 'back' ? '지우기' : key === 'clear' ? '전부 지우기' : key}
              onClick={() => press(key)}
            >
              {key === 'back' ? '←' : key === 'clear' ? '취소' : key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Messages() {
  const [open, setOpen] = useState<string | null>(null);
  const thread = phoneLock.messages.find((m) => m.evidence === open);
  if (thread) {
    return (
      <div className="app app-messages">
        <div className="app-head"><button className="app-back" onClick={() => setOpen(null)} aria-label="대화 목록으로">◀</button>{thread.to}</div>
        <div className="chat">
          <span className="chat-date">— 2026.10 —</span>
          <p className="bubble is-sent">{thread.text}</p>
          <span className="chat-meta">{thread.time} · 읽음</span>
        </div>
      </div>
    );
  }
  return (
    <div className="app app-messages">
      <div className="app-head app-title">메시지</div>
      {phoneLock.messages.map((m) => (
        <button key={m.evidence} className="chat-row" onClick={() => setOpen(m.evidence)}>
          <span className="chat-row-main">
            <span className="chat-row-top"><span>{m.to}</span><span className="chat-time">{m.time}</span></span>
            <span className="chat-preview">{m.text}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function Memo() {
  const [open, setOpen] = useState(false);
  const memo = phoneLock.memos[0];
  return (
    <div className="app app-memo">
      {open ? (
        <>
          <div className="app-head"><button className="app-back" onClick={() => setOpen(false)}>◀ 메모</button></div>
          <div className="memo-page">
            <p className="memo-title">{memo.title}</p>
            <p className="memo-body">{memo.body}</p>
          </div>
        </>
      ) : (
        <>
          <div className="app-head app-title"><span>메모</span><small>{phoneLock.memos.length}개</small></div>
          <div className="memo-list">
            {phoneLock.memos.map((m) => (
              <button key={m.evidence} className="memo-row pix" onClick={() => setOpen(true)}>
                <span>{m.title}</span>
                <small>{m.body}</small>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** 피해자의 휴대폰: 잠금 화면 → 해제 후 메시지·메모 앱 */
export default function PhoneLock() {
  const { state, dispatch } = useGame();
  const [app, setApp] = useState<'lock' | 'messages' | 'memo'>('lock');
  const error = state.phoneError;
  const showApps = state.phoneUnlocked && app !== 'lock';
  const line = !state.phoneUnlocked ? phoneLock.lines.locked : app === 'messages' ? phoneLock.lines.messages : app === 'memo' ? phoneLock.lines.memo : phoneLock.lines.unlocked;

  return (
    <section className="phone-screen" style={themeVars(rooms.study.theme)} role="dialog" aria-modal="true" aria-label="피해자의 스마트폰">
      <header className="zoom-head">
        <button className="zoom-back pix" onClick={() => dispatch({ type: 'CLOSE_PANEL' })}>◀ 서재로</button>
        <span className="zoom-heading">피해자의 스마트폰</span>
      </header>
      <div className="phone-body">
        <div key={error?.shake ? error.seq : 'still'} className={`phone-device ${error?.shake ? 'is-shaking' : ''}`}>
          <div className="phone-display">
            {showApps ? (app === 'messages' ? <Messages /> : <Memo />) : <LockScreen onOpen={setApp} />}
            {showApps && (
              <nav className={`app-nav ${app === 'memo' ? 'is-memo' : ''}`} aria-label="앱">
                <button aria-current={app === 'messages' ? 'page' : undefined} onClick={() => setApp('messages')}>{app === 'messages' ? '● ' : ''}메시지</button>
                <button aria-current={app === 'memo' ? 'page' : undefined} onClick={() => setApp('memo')}>{app === 'memo' ? '● ' : ''}메모</button>
              </nav>
            )}
          </div>
        </div>
      </div>
      <div className="zoom-dialog phone-dialog">
        <DialogBox speaker="나" text={line} />
      </div>
    </section>
  );
}
