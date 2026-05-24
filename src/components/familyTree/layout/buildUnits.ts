import {
  type MarriageLineType,
  type ParentLink,
  type Unit,
} from '@/components/familyTree/layout/internalTypes';
import { type Person } from '@/schemas/personSchema';
import { type Relation, RelationType } from '@/schemas/relationSchema';

export interface SecondaryMarriage {
  relationId: string;
  primaryPersonId: string;
  spousePersonId: string;
  marriageType: MarriageLineType;
}

export interface CoupleBuildResult {
  units: Unit[];
  secondaryMarriages: SecondaryMarriage[];
}

function classifyMarriage(rel: Relation): MarriageLineType | null {
  const type = rel.relationType[0];
  if (type === RelationType.MARRIED_COUPLE) {
    return 'married';
  }
  if (type === RelationType.COUPLE) {
    return 'couple';
  }
  return null;
}

export function buildCoupleUnits(
  relations: Relation[],
  unitOfPerson: Map<string, string>,
): CoupleBuildResult {
  const units: Unit[] = [];
  const secondaryMarriages: SecondaryMarriage[] = [];
  for (const rel of relations) {
    const marriageType = classifyMarriage(rel);
    if (marriageType === null) {
      continue;
    }
    if (rel.persons.personId1.length === 0 || rel.persons.personId2.length === 0) {
      continue;
    }
    const p1 = rel.persons.personId1[0];
    const p2 = rel.persons.personId2[0];
    const p1Used = unitOfPerson.has(p1);
    const p2Used = unitOfPerson.has(p2);
    if (p1Used && p2Used) {
      // どちらも他の婚姻 unit に居る場合は線だけ表現する手段がないので一旦スキップ。
      continue;
    }
    if (p1Used || p2Used) {
      // 既にユニット化されている側を primary、未配置側を spouse として secondary 婚姻を記録する。
      secondaryMarriages.push({
        relationId: rel.id,
        primaryPersonId: p1Used ? p1 : p2,
        spousePersonId: p1Used ? p2 : p1,
        marriageType,
      });
      continue;
    }
    const id = `couple-${rel.id}`;
    units.push({
      id,
      type: 'couple',
      personIds: [p1, p2],
      marriageRelationId: rel.id,
      marriageType,
      generation: 0,
    });
    unitOfPerson.set(p1, id);
    unitOfPerson.set(p2, id);
  }
  return {
    units,
    secondaryMarriages,
  };
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
