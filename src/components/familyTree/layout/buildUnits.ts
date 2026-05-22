import { type ParentLink, type Unit } from '@/components/familyTree/layout/internalTypes';
import { type Person } from '@/schemas/personSchema';
import { type Relation, RelationType } from '@/schemas/relationSchema';

export function buildCoupleUnits(
  relations: Relation[],
  unitOfPerson: Map<string, string>,
): Unit[] {
  const units: Unit[] = [];
  for (const rel of relations) {
    const type = rel.relationType[0];
    const isMarried = type === RelationType.MARRIED_COUPLE;
    const isCouple = type === RelationType.COUPLE;
    if (!isMarried && !isCouple) {
      continue;
    }
    if (rel.persons.personId1.length === 0 || rel.persons.personId2.length === 0) {
      continue;
    }
    const p1 = rel.persons.personId1[0];
    const p2 = rel.persons.personId2[0];
    if (unitOfPerson.has(p1) || unitOfPerson.has(p2)) {
      continue;
    }
    const id = `couple-${rel.id}`;
    units.push({
      id,
      type: 'couple',
      personIds: [p1, p2],
      marriageRelationId: rel.id,
      marriageType: isMarried ? 'married' : 'couple',
      generation: 0,
    });
    unitOfPerson.set(p1, id);
    unitOfPerson.set(p2, id);
  }
  return units;
}

export function buildSingleUnits(
  people: Person[],
  unitOfPerson: Map<string, string>,
): Unit[] {
  const units: Unit[] = [];
  for (const p of people) {
    if (unitOfPerson.has(p.id)) {
      continue;
    }
    const id = `single-${p.id}`;
    units.push({
      id,
      type: 'single',
      personIds: [p.id],
      marriageRelationId: null,
      marriageType: null,
      generation: 0,
    });
    unitOfPerson.set(p.id, id);
  }
  return units;
}

export function buildChildToParents(
  relations: Relation[],
): Map<string, ParentLink[]> {
  const map = new Map<string, ParentLink[]>();
  for (const rel of relations) {
    const type = rel.relationType[0];
    const isParent = type === RelationType.PARENT_CHILD;
    const isAdopted = type === RelationType.PARENT_ADOPTED_CHILD;
    if (!isParent && !isAdopted) {
      continue;
    }
    if (rel.persons.personId1.length === 0 || rel.persons.personId2.length === 0) {
      continue;
    }
    const parent = rel.persons.personId1[0];
    const child = rel.persons.personId2[0];
    const arr = map.get(child) ?? [];
    arr.push({
      parentId: parent,
      adopted: isAdopted,
    });
    map.set(child, arr);
  }
  return map;
}
