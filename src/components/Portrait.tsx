import { assetUrl } from '../assetUrl';
import type { Expression, SuspectDef } from '../data/types';

const EXPRESSION_LABEL: Record<Expression, string> = {
  normal: '평온',
  sweat: '당황',
  angry: '반박',
  final: '결말',
};

/** 스프라이트가 없으면 이름과 표정 키를 적은 박스로 대신한다 */
export default function Portrait({ suspect, expr, size = 'large' }: { suspect: SuspectDef; expr: Expression; size?: 'large' | 'small' }) {
  const src = assetUrl(suspect.sprites[expr] ?? suspect.sprites.normal);
  return (
    <div className={`portrait portrait-${size} expr-${expr}`}>
      {src ? (
        <img src={src} alt={`${suspect.name} (${EXPRESSION_LABEL[expr]})`} />
      ) : (
        <>
          <span className="portrait-name">{suspect.name}</span>
          {size === 'large' && <span className="portrait-expr">{expr} · {EXPRESSION_LABEL[expr]}</span>}
        </>
      )}
    </div>
  );
}
