import { deductions } from '../data/deductions';
import { items } from '../data/items';
import { ItemIcon } from './Inventory';

export function evidenceName(id: string): string {
  return items[id]?.name ?? deductions[id]?.title ?? id;
}

interface Props {
  id: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/** 증거와 추리 결과를 같은 모양으로 고르는 버튼 (추리 노트, 심문, 지목에서 공용) */
export default function EvidenceChip({ id, selected, disabled, onClick }: Props) {
  const isDeduction = id in deductions;
  return (
    <button
      type="button"
      className={`ev-chip ${isDeduction ? 'is-deduction' : ''} ${selected ? 'is-selected' : ''}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      {isDeduction ? <span className="item-icon is-placeholder ev-deduction-icon" aria-hidden="true">추</span> : <ItemIcon id={id} />}
      <span className="ev-name">{evidenceName(id)}</span>
    </button>
  );
}
