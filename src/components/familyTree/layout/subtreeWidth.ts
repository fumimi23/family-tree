import {
  COUPLE_GAP,
  PERSON_WIDTH,
  type Unit,
  UNIT_GAP,
} from '@/components/familyTree/layout/internalTypes';

export function unitOwnWidth(unit: Unit): number {
  return unit.type === 'couple'
    ? (PERSON_WIDTH * 2) + COUPLE_GAP
    : PERSON_WIDTH;
}

export function computeSubtreeWidth(
  unitId: string,
  unitMap: Map<string, Unit>,
  childrenOfUnit: Map<string, string[]>,
  memo: Map<string, number>,
): number {
  const cached = memo.get(unitId);
  if (cached !== undefined) {
    return cached;
  }
  const unit = unitMap.get(unitId);
  if (unit === undefined) {
    return 0;
  }
  const own = unitOwnWidth(unit);
  const children = childrenOfUnit.get(unitId) ?? [];
  if (children.length === 0) {
    memo.set(unitId, own);
    return own;
  }
  let total = 0;
  for (const childId of children) {
    total += computeSubtreeWidth(childId, unitMap, childrenOfUnit, memo);
  }
  total += UNIT_GAP * (children.length - 1);
  const w = Math.max(own, total);
  memo.set(unitId, w);
  return w;
}
