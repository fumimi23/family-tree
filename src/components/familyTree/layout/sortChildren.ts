import { type ParentLink, type Unit } from '@/components/familyTree/layout/internalTypes';
import { findAnchorPersonId } from '@/components/familyTree/layout/ownership';
import { type Person } from '@/schemas/personSchema';

function getAnchorBirth(
  childUnitId: string,
  parentUnit: Unit,
  unitMap: Map<string, Unit>,
  childToParents: Map<string, ParentLink[]>,
  personMap: Map<string, Person>,
): string {
  const childUnit = unitMap.get(childUnitId);
  if (childUnit === undefined) {
    return '';
  }
  const { personId } = findAnchorPersonId(childUnit, parentUnit, childToParents);
  return personMap.get(personId)?.birth ?? '';
}

function compareBirths(birthA: string, birthB: string): number {
  if (birthA === '' && birthB === '') {
    return 0;
  }
  if (birthA === '') {
    return -1;
  }
  if (birthB === '') {
    return 1;
  }
  return birthB.localeCompare(birthA);
}

export function sortChildrenByBirth(
  childrenOfUnit: Map<string, string[]>,
  unitMap: Map<string, Unit>,
  childToParents: Map<string, ParentLink[]>,
  personMap: Map<string, Person>,
): void {
  for (const [parentId, childIds] of childrenOfUnit) {
    const parentUnit = unitMap.get(parentId);
    if (parentUnit === undefined) {
      continue;
    }
    childIds.sort((a, b) => {
      const birthA = getAnchorBirth(a, parentUnit, unitMap, childToParents, personMap);
      const birthB = getAnchorBirth(b, parentUnit, unitMap, childToParents, personMap);
      return compareBirths(birthA, birthB);
    });
  }
}
