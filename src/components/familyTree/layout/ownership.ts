import { type ParentLink, type Unit } from '@/components/familyTree/layout/internalTypes';

export interface OwnershipResult {
  childrenOfUnit: Map<string, string[]>;
  rootUnitIds: string[];
}

function findOwnerUnit(
  unit: Unit,
  unitOfPerson: Map<string, string>,
  childToParents: Map<string, ParentLink[]>,
): string | null {
  for (const pid of unit.personIds) {
    const parents = childToParents.get(pid) ?? [];
    for (const { parentId } of parents) {
      const ownerId = unitOfPerson.get(parentId);
      if (ownerId !== undefined && ownerId !== unit.id) {
        return ownerId;
      }
    }
  }
  return null;
}

export function computeOwnership(
  units: Unit[],
  unitOfPerson: Map<string, string>,
  childToParents: Map<string, ParentLink[]>,
): OwnershipResult {
  const childrenOfUnit = new Map<string, string[]>();
  const rootUnitIds: string[] = [];
  for (const unit of units) {
    const ownerId = findOwnerUnit(unit, unitOfPerson, childToParents);
    if (ownerId === null) {
      rootUnitIds.push(unit.id);
    } else {
      const arr = childrenOfUnit.get(ownerId) ?? [];
      arr.push(unit.id);
      childrenOfUnit.set(ownerId, arr);
    }
  }
  return {
    childrenOfUnit,
    rootUnitIds,
  };
}

interface AnchorPerson {
  personId: string;
  adopted: boolean;
}

export function findAnchorPersonId(
  childUnit: Unit,
  parentUnit: Unit,
  childToParents: Map<string, ParentLink[]>,
): AnchorPerson {
  for (const pid of childUnit.personIds) {
    const parents = childToParents.get(pid) ?? [];
    const link = parents.find(
      (p) => parentUnit.personIds.includes(p.parentId),
    );
    if (link !== undefined) {
      return {
        personId: pid,
        adopted: link.adopted,
      };
    }
  }
  return {
    personId: childUnit.personIds[0],
    adopted: false,
  };
}
