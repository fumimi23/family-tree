import { type Person } from '@/schemas/personSchema';
import { type Relation, RelationType } from '@/schemas/relationSchema';

export type FilterScope = 'ancestors' | 'descendants' | 'both';

export interface FilterCriteria {
  focusPersonId: string;
  scope: FilterScope;
}

interface ParentChildMaps {
  parentToChildren: Map<string, Set<string>>;
  childToParents: Map<string, Set<string>>;
  // person → 配偶者 (married-couple / couple)
  spouseMap: Map<string, Set<string>>;
}

function buildMaps(relations: Relation[]): ParentChildMaps {
  const parentToChildren = new Map<string, Set<string>>();
  const childToParents = new Map<string, Set<string>>();
  const spouseMap = new Map<string, Set<string>>();
  for (const rel of relations) {
    const type = rel.relationType[0];
    if (rel.persons.personId1.length === 0 || rel.persons.personId2.length === 0) {
      continue;
    }
    const p1 = rel.persons.personId1[0];
    const p2 = rel.persons.personId2[0];
    if (type === RelationType.PARENT_CHILD || type === RelationType.PARENT_ADOPTED_CHILD) {
      const parent = p1;
      const child = p2;
      const children = parentToChildren.get(parent) ?? new Set();
      children.add(child);
      parentToChildren.set(parent, children);
      const parents = childToParents.get(child) ?? new Set();
      parents.add(parent);
      childToParents.set(child, parents);
      continue;
    }
    if (type === RelationType.MARRIED_COUPLE || type === RelationType.COUPLE) {
      const s1 = spouseMap.get(p1) ?? new Set();
      s1.add(p2);
      spouseMap.set(p1, s1);
      const s2 = spouseMap.get(p2) ?? new Set();
      s2.add(p1);
      spouseMap.set(p2, s2);
    }
  }
  return {
    parentToChildren,
    childToParents,
    spouseMap,
  };
}

function collectAncestors(personId: string, maps: ParentChildMaps): Set<string> {
  const visited = new Set<string>();
  const queue = [personId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || visited.has(current)) {
      continue;
    }
    visited.add(current);
    const parents = maps.childToParents.get(current) ?? new Set();
    for (const p of parents) {
      queue.push(p);
    }
  }
  return visited;
}

function collectDescendants(personId: string, maps: ParentChildMaps): Set<string> {
  const visited = new Set<string>();
  const queue = [personId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || visited.has(current)) {
      continue;
    }
    visited.add(current);
    const children = maps.parentToChildren.get(current) ?? new Set();
    for (const c of children) {
      queue.push(c);
    }
  }
  return visited;
}

function addSpouses(ids: Set<string>, spouseMap: Map<string, Set<string>>): void {
  /*
   * 血縁範囲に含まれる各人の配偶者を追加する。
   * 配偶者の祖先/子孫は辿らない (= 元の血縁範囲だけが対象、配偶者は「並べる相手」として表示)。
   */
  const original = Array.from(ids);
  for (const id of original) {
    const spouses = spouseMap.get(id);
    if (spouses === undefined) {
      continue;
    }
    for (const s of spouses) {
      ids.add(s);
    }
  }
}

export interface FilterResult {
  people: Person[];
  relations: Relation[];
}

export function applyFilter(
  people: Person[],
  relations: Relation[],
  criteria: FilterCriteria | null,
): FilterResult {
  if (criteria === null) {
    return {
      people,
      relations,
    };
  }
  const maps = buildMaps(relations);
  const collected = new Set<string>();
  if (criteria.scope === 'ancestors' || criteria.scope === 'both') {
    for (const id of collectAncestors(criteria.focusPersonId, maps)) {
      collected.add(id);
    }
  }
  if (criteria.scope === 'descendants' || criteria.scope === 'both') {
    for (const id of collectDescendants(criteria.focusPersonId, maps)) {
      collected.add(id);
    }
  }
  addSpouses(collected, maps.spouseMap);
  const filteredPeople = people.filter((p) => collected.has(p.id));

  /*
   * relation の両端が実在する人物 (filteredPeople) に含まれるものだけ残す。
   * `collected` は relations から構築した親子グラフ由来なので、削除済み人物の id が
   * 残るケースがあり、それを基準にすると people / relations が内部的に不整合になる。
   */
  const filteredPersonIds = new Set(filteredPeople.map((p) => p.id));
  const filteredRelations = relations.filter((r) => {
    if (r.persons.personId1.length === 0 || r.persons.personId2.length === 0) {
      return false;
    }
    return filteredPersonIds.has(r.persons.personId1[0])
      && filteredPersonIds.has(r.persons.personId2[0]);
  });
  return {
    people: filteredPeople,
    relations: filteredRelations,
  };
}
