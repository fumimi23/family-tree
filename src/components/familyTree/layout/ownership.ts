import { type ParentLink, type Unit } from '@/components/familyTree/layout/internalTypes';

export interface OwnershipResult {
  childrenOfUnit: Map<string, string[]>;
  secondaryParentsOfUnit: Map<string, string[]>;
  rootUnitIds: string[];
}

/*
 * householdHeadPersonId が指定されていれば、その人物を先頭にした personIds 順を返す。
 * この順は 2 箇所で使う:
 *   1. 親ユニット探索 — 先に見つかった親ユニットが primary になるため、「家系を継ぐ側」の
 *      親系統が primary に選ばれる。
 *   2. placement の左右配置 — 継ぐ側を先頭にすることで婚姻線の左に配置され、嫁入り/婿入りを
 *      ラベル無しで視覚的に表現する (#164)。
 * householdHeadPersonId 未指定なら従来どおり personId1 が先頭 (= 左)。
 */
export function orderedPersonIds(unit: Unit): string[] {
  const head = unit.householdHeadPersonId;
  if (head === null || !unit.personIds.includes(head)) {
    return unit.personIds;
  }
  return [head, ...unit.personIds.filter((pid) => pid !== head)];
}

function findAllParentUnits(
  unit: Unit,
  unitOfPerson: Map<string, string>,
  childToParents: Map<string, ParentLink[]>,
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const pid of orderedPersonIds(unit)) {
    const parents = childToParents.get(pid) ?? [];
    for (const { parentId } of parents) {
      const ownerId = unitOfPerson.get(parentId);
      if (ownerId === undefined || ownerId === unit.id || seen.has(ownerId)) {
        continue;
      }
      seen.add(ownerId);
      result.push(ownerId);
    }
  }
  return result;
}

function recordPrimary(
  unitId: string,
  ownerId: string,
  childrenOfUnit: Map<string, string[]>,
): void {
  const arr = childrenOfUnit.get(ownerId) ?? [];
  arr.push(unitId);
  childrenOfUnit.set(ownerId, arr);
}

export function computeOwnership(
  units: Unit[],
  unitOfPerson: Map<string, string>,
  childToParents: Map<string, ParentLink[]>,
): OwnershipResult {
  const childrenOfUnit = new Map<string, string[]>();
  const secondaryParentsOfUnit = new Map<string, string[]>();
  const rootUnitIds: string[] = [];
  for (const unit of units) {
    const allParents = findAllParentUnits(unit, unitOfPerson, childToParents);
    if (allParents.length === 0) {
      rootUnitIds.push(unit.id);
      continue;
    }
    recordPrimary(unit.id, allParents[0], childrenOfUnit);
    if (allParents.length > 1) {
      secondaryParentsOfUnit.set(unit.id, allParents.slice(1));
    }
  }
  return {
    childrenOfUnit,
    secondaryParentsOfUnit,
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
