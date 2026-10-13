import { useEffect, useState } from 'react';

const SPEED_MS = 35;

/** 한 글자씩 출력하고, 출력 중에 터치하면 즉시 전체를 보여준다 */
export function useTypewriter(text: string) {
  const chars = Array.from(text);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    const timer = setInterval(() => {
      setCount((n) => {
        if (n >= chars.length) {
          clearInterval(timer);
          return n;
        }
        return n + 1;
      });
    }, SPEED_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return { shown: chars.slice(0, count).join(''), done: count >= chars.length, finish: () => setCount(chars.length) };
}

interface Props {
  text: string;
  speaker?: string;
  /** 같은 문구를 다시 출력해야 할 때 바꿔 준다 */
  replayKey?: number;
  /** 전부 출력된 뒤 터치했을 때 */
  onAdvance?: () => void;
  className?: string;
}

function Typed({ text, speaker, onAdvance, className }: Omit<Props, 'replayKey'>) {
  const { shown, done, finish } = useTypewriter(text);
  return (
    <button
      type="button"
      className={`dialog-box ${className ?? ''}`}
      onClick={() => (done ? onAdvance?.() : finish())}
      aria-live="polite"
    >
      {speaker && <span className="dialog-speaker">{speaker}</span>}
      <span className="dialog-text">
        {shown}
        <span className="dialog-rest" aria-hidden="true">{text.slice(shown.length)}</span>
      </span>
      {done && onAdvance && <span className="dialog-next" aria-hidden="true">▼</span>}
    </button>
  );
}

export default function DialogBox({ replayKey, ...props }: Props) {
  return <Typed key={`${replayKey ?? 0}:${props.text}`} {...props} />;
}
