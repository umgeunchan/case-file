const ARRAY_FIELDS = ['locations', 'items', 'clues', 'suspects', 'dialogues'] as const;

type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);

export function validateCase(raw: unknown): string[] {
  if (!isRec(raw)) return ['사건 데이터가 객체가 아닙니다.'];
  const errors: string[] = [];

  if (typeof raw.id !== 'string' || raw.id === '') errors.push('id가 비어 있습니다.');
  if (typeof raw.title !== 'string') errors.push('title이 없습니다.');
  if (typeof raw.timeLimitMinutes !== 'number' || raw.timeLimitMinutes <= 0) {
    errors.push('timeLimitMinutes는 0보다 큰 숫자여야 합니다.');
  }
  if (![1, 2, 3].includes(raw.difficulty as number)) errors.push('difficulty는 1, 2, 3 중 하나여야 합니다.');

  for (const field of ARRAY_FIELDS) {
    if (!Array.isArray(raw[field])) errors.push(`${field} 배열이 없습니다.`);
  }
  if (!isRec(raw.solution)) errors.push('solution이 없습니다.');
  if (errors.some((e) => e.includes('배열') || e.includes('solution'))) return errors;

  const list = (field: (typeof ARRAY_FIELDS)[number]) => raw[field] as Rec[];
  const idsOf = (field: (typeof ARRAY_FIELDS)[number]) => {
    const ids = new Set<string>();
    for (const x of list(field)) {
      const id = x.id as string;
      if (ids.has(id)) errors.push(`${field}에 중복된 id '${id}'가 있습니다.`);
      ids.add(id);
    }
    return ids;
  };

  const locationIds = idsOf('locations');
  idsOf('items');
  const clueIds = idsOf('clues');
  const suspectIds = idsOf('suspects');
  idsOf('dialogues');

  const checkClues = (owner: string, key: string, ids: unknown) => {
    if (ids === undefined) return;
    if (!Array.isArray(ids)) return void errors.push(`${owner}.${key}는 배열이어야 합니다.`);
    for (const id of ids) {
      if (!clueIds.has(id)) errors.push(`${owner}.${key}: 없는 단서 '${id}'`);
    }
  };

  for (const item of list('items')) {
    const owner = `items[${item.id}]`;
    if (!locationIds.has(item.locationId as string)) errors.push(`${owner}: 없는 장소 '${item.locationId}'`);
    checkClues(owner, 'givesClues', item.givesClues);
    checkClues(owner, 'requires', item.requires);
  }

  for (const d of list('dialogues')) {
    const owner = `dialogues[${d.id}]`;
    if (!suspectIds.has(d.suspectId as string)) errors.push(`${owner}: 없는 용의자 '${d.suspectId}'`);
    checkClues(owner, 'givesClues', d.givesClues);
    checkClues(owner, 'requires', d.requires);
  }

  const solution = raw.solution as Rec;
  if (!suspectIds.has(solution.culpritId as string)) {
    errors.push(`solution.culpritId: 없는 용의자 '${solution.culpritId}'`);
  }
  for (const key of ['motive', 'method'] as const) {
    const choice = solution[key];
    if (!isRec(choice) || !Array.isArray(choice.options)) {
      errors.push(`solution.${key}.options 배열이 없습니다.`);
      continue;
    }
    const answer = choice.answer;
    if (typeof answer !== 'number' || !Number.isInteger(answer) || answer < 0 || answer >= choice.options.length) {
      errors.push(`solution.${key}.answer가 보기 범위를 벗어났습니다.`);
    }
  }

  return errors;
}
