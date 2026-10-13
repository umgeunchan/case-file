import { useEffect, useState } from 'react';
import { phoneLock } from '../data/locks';
import { useGame } from '../state/GameContext';
import Panel from './Panel';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'];

function Keypad() {
  const { state, dispatch } = useGame();
  const [pin, setPin] = useState('');
  const error = state.phoneError;

  // 오답이 나오면 입력을 비운다
  useEffect(() => {
    if (error) setPin('');
  }, [error?.seq]); // eslint-disable-line react-hooks/exhaustive-deps

  const press = (key: string) => {
    if (key === '←') return setPin((p) => p.slice(0, -1));
    if (!key || pin.length >= phoneLock.length) return;
    const next = pin + key;
    setPin(next);
    if (next.length === phoneLock.length) dispatch({ type: 'SUBMIT_PIN', pin: next });
  };

  return (
    <div key={error?.shake ? error.seq : 'still'} className={`phone-lock ${error?.shake ? 'is-shaking' : ''}`}>
      <p className="phone-time">23:58</p>
      <p className="phone-prompt">{phoneLock.prompt}</p>
      <div className="pin-dots" aria-label={`${pin.length}자리 입력됨`}>
        {Array.from({ length: phoneLock.length }, (_, i) => (
          <span key={i} className={`pin-dot ${i < pin.length ? 'is-filled' : ''}`} />
        ))}
      </div>
      <p className="phone-error" role="alert">{error?.text ?? ''}</p>
      <div className="keypad">
        {KEYS.map((key, i) =>
          key ? (
            <button key={i} type="button" className="key" onClick={() => press(key)} aria-label={key === '←' ? '지우기' : key}>
              {key}
            </button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
    </div>
  );
}

function PhoneApps() {
  const [app, setApp] = useState<'messages' | 'memo'>('messages');
  return (
    <div className="phone-apps">
      <p className="phone-unlocked">{phoneLock.unlockText} 문자와 메모가 증거로 기록되었다.</p>
      <div className="phone-tabs" role="tablist">
        <button role="tab" aria-selected={app === 'messages'} className={`phone-tab ${app === 'messages' ? 'is-active' : ''}`} onClick={() => setApp('messages')}>메시지</button>
        <button role="tab" aria-selected={app === 'memo'} className={`phone-tab ${app === 'memo' ? 'is-active' : ''}`} onClick={() => setApp('memo')}>메모</button>
      </div>
      {app === 'messages' ? (
        <ul className="phone-list">
          {phoneLock.messages.map((m) => (
            <li key={m.evidence} className="bubble">
              <span className="bubble-meta">{m.time} → {m.to}</span>
              <span>{m.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="phone-list">
          {phoneLock.memos.map((m) => (
            <li key={m.evidence} className="memo-note">{m.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PhoneLock() {
  const { state } = useGame();
  return (
    <Panel title="피해자의 휴대폰" className="panel-phone">
      {state.phoneUnlocked ? <PhoneApps /> : <Keypad />}
    </Panel>
  );
}
