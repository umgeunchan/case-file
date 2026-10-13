import { useState } from 'react';
import { badEnding, culprit, goodEnding, rebuttals } from '../data/endings';
import { suspects, timeline } from '../data/scenario';
import { useGame } from '../state/GameContext';
import DialogBox from './DialogBox';
import Portrait from './Portrait';

function GoodEnding() {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  const sera = suspects.find((s) => s.id === culprit)!;

  if (step >= 2) {
    return (
      <div className="ending ending-good">
        <p className="stamp">CASE CLOSED</p>
        <h2 className="ending-title">사건의 진상</h2>
        <ol className="timeline">
          {timeline.map((t) => (
            <li key={t.time + t.event}>
              <span className="timeline-time">{t.time}</span>
              <span>{t.event}</span>
            </li>
          ))}
        </ol>
        <button className="pbtn pbtn-primary" onClick={() => dispatch({ type: 'NEW_GAME' })}>처음부터 다시 하기</button>
      </div>
    );
  }

  return (
    <div className="ending ending-good">
      <p className="stamp">CASE CLOSED</p>
      <Portrait suspect={sera} expr={goodEnding.confession.expr} />
      {step === 0 ? (
        <DialogBox speaker={sera.name} text={goodEnding.confession.text} onAdvance={() => setStep(1)} />
      ) : (
        <DialogBox text={goodEnding.narration} onAdvance={() => setStep(2)} />
      )}
    </div>
  );
}

function BadEnding({ suspectId }: { suspectId: string }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  const accused = suspects.find((s) => s.id === suspectId)!;
  const rebuttal = rebuttals[accused.id];

  if (step === 0 && rebuttal) {
    return (
      <div className="ending ending-bad">
        <Portrait suspect={accused} expr={rebuttal.expr} />
        <DialogBox speaker={accused.name} text={rebuttal.text} onAdvance={() => setStep(1)} />
      </div>
    );
  }
  return (
    <div className="ending ending-bad">
      <p className="stamp is-bad">UNSOLVED</p>
      <DialogBox text={badEnding.narration} />
      <button className="pbtn pbtn-primary" onClick={() => dispatch({ type: 'RETRY_ACCUSATION' })}>다시 추리하기</button>
    </div>
  );
}

export default function EndingScreen() {
  const { state } = useGame();
  if (state.ending?.kind === 'good') return <GoodEnding />;
  if (state.ending?.kind === 'bad') return <BadEnding suspectId={state.ending.suspect} />;
  return null;
}
