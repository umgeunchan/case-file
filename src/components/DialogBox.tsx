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
  /** 본문 위에 보이는 제목 (조사한 물건 이름 등) */
  title?: string;
  /** 같은 문구를 다시 출력해야 할 때 바꿔 준다 */
  replayKey?: number;
  /** 전부 출력된 뒤 터치했을 때 */
  onAdvance?: () => void;
  className?: string;
}

function Typed({ text, speaker, title, onAdvance, className }: Omit<Props, 'replayKey'>) {
  const { shown, done, finish } = useTypewriter(text);
  return (
    <div className={`dialog ${speaker ? 'has-speaker' : ''} ${className ?? ''}`}>
      <button type="button" className="dialog-box" onClick={() => (done ? onAdvance?.() : finish())} aria-live="polite">
        {title && <span className="dialog-title">{title}</span>}
        <span className="dialog-text">
          {shown}
          <span className="dialog-rest" aria-hidden="true">{text.slice(shown.length)}</span>
        </span>
        {done && (
          <svg className="dialog-next" viewBox="0 0 5 3" width="15" height="9" aria-hidden="true">
            <path d="M0 0h5v1h-5z M1 1h3v1h-3z M2 2h1v1h-1z" />
          </svg>
        )}
      </button>
      {speaker && <span className="dialog-speaker pix">{speaker}</span>}
    </div>
  );
}

export default function DialogBox({ replayKey, ...props }: Props) {
  return <Typed key={`${replayKey ?? 0}:${props.title ?? ''}:${props.text}`} {...props} />;
}
