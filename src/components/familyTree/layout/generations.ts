import { type ParentLink, type Unit } from '@/components/familyTree/layout/internalTypes';

function computePersonGen(
  personId: string,
  childToParents: Map<string, ParentLink[]>,
  memo: Map<string, number>,
  visiting: Set<string>,
): number {
  const cached = memo.get(personId);
  if (cached !== undefined) {
    return cached;
  }
  if (visiting.has(personId)) {
    throw new Error(`親子関係に循環参照があります (人物ID: ${personId})`);
  }
  visiting.add(personId);
  const parents = childToParents.get(personId) ?? [];
  let g = 0;
  for (const { parentId } of parents) {
    const pg = computePersonGen(parentId, childToParents, memo, visiting);
    g = Math.max(g, pg + 1);
  }
  visiting.delete(personId);
  memo.set(personId, g);
  return g;
}

export function assignUnitGenerations(
  units: Unit[],
  childToParents: Map<string, ParentLink[]>,
): void {
  const memo = new Map<string, number>();
  const visiting = new Set<string>();
  for (const unit of units) {
    let max = 0;
    for (const pid of unit.personIds) {
      const g = computePersonGen(pid, childToParents, memo, visiting);
      max = Math.max(max, g);
    }
    unit.generation = max;
  }
}
