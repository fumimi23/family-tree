import { describe, expect, it } from 'vitest';

import { layoutFamilyTree } from '@/components/familyTree/layoutFamilyTree';
import { type Person, Sex } from '@/schemas/personSchema';
import { type Relation, RelationType } from '@/schemas/relationSchema';

const ID = {
  HUSBAND: '11111111-1111-4111-8111-111111111111',
  WIFE: '22222222-2222-4222-8222-222222222222',
  CHILD_OLD: '33333333-3333-4333-8333-333333333333',
  CHILD_NEW: '44444444-4444-4444-8444-444444444444',
  REL_MARRIED: 'aaaaaaaa-0000-4000-8000-000000000001',
  REL_PARENT_OLD_H: 'bbbbbbbb-0000-4000-8000-000000000001',
  REL_PARENT_OLD_W: 'bbbbbbbb-0000-4000-8000-000000000002',
  REL_PARENT_NEW_H: 'bbbbbbbb-0000-4000-8000-000000000003',
  REL_PARENT_NEW_W: 'bbbbbbbb-0000-4000-8000-000000000004',
} as const;

function person(id: string, birth: string): Person {
  return {
    id,
    familyName: '山田',
    givenName: '名',
    familyNameKana: 'ヤマダ',
    givenNameKana: 'ナ',
    sex: Sex.UNKNOWN,
    birth,
    death: '',
  };
}

function marriedRel(id: string, p1: string, p2: string): Relation {
  return {
    id,
    relationType: [RelationType.MARRIED_COUPLE],
    persons: {
      personId1: [p1],
      personId2: [p2],
    },
  };
}

function parentRel(id: string, parent: string, child: string): Relation {
  return {
    id,
    relationType: [RelationType.PARENT_CHILD],
    persons: {
      personId1: [parent],
      personId2: [child],
    },
  };
}

describe('layoutFamilyTree', () => {
  it('人物 0 件なら空のレイアウトを返す', () => {
    const result = layoutFamilyTree([], []);
    expect(result.nodes).toEqual([]);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });

  it('夫婦+2 児: 世代 / ノード数 / parentGroups が期待通り', () => {
    const people = [
      person(ID.HUSBAND, '1970-01-01'),
      person(ID.WIFE, '1972-01-01'),
      person(ID.CHILD_OLD, '2000-01-01'),
      person(ID.CHILD_NEW, '2005-01-01'),
    ];
    const relations = [
      marriedRel(ID.REL_MARRIED, ID.HUSBAND, ID.WIFE),
      parentRel(ID.REL_PARENT_OLD_H, ID.HUSBAND, ID.CHILD_OLD),
      parentRel(ID.REL_PARENT_OLD_W, ID.WIFE, ID.CHILD_OLD),
      parentRel(ID.REL_PARENT_NEW_H, ID.HUSBAND, ID.CHILD_NEW),
      parentRel(ID.REL_PARENT_NEW_W, ID.WIFE, ID.CHILD_NEW),
    ];
    const result = layoutFamilyTree(people, relations);
    expect(result.nodes).toHaveLength(4);
    expect(result.generationRows).toHaveLength(2);
    expect(result.marriageEdges).toHaveLength(1);
    expect(result.parentGroups).toHaveLength(1);
    expect(result.parentGroups[0].children).toHaveLength(2);
  });

  it('兄弟の並び順は年長 (= 古い生年) が右側 (x が大きい) になる', () => {
    const people = [
      person(ID.HUSBAND, '1970-01-01'),
      person(ID.WIFE, '1972-01-01'),
      person(ID.CHILD_OLD, '2000-01-01'),
      person(ID.CHILD_NEW, '2005-01-01'),
    ];
    const relations = [
      marriedRel(ID.REL_MARRIED, ID.HUSBAND, ID.WIFE),
      parentRel(ID.REL_PARENT_OLD_H, ID.HUSBAND, ID.CHILD_OLD),
      parentRel(ID.REL_PARENT_NEW_H, ID.HUSBAND, ID.CHILD_NEW),
    ];
    const result = layoutFamilyTree(people, relations);
    const xByPerson = new Map(result.nodes.map((n) => [n.personId, n.x]));
    const xOld = xByPerson.get(ID.CHILD_OLD) ?? 0;
    const xNew = xByPerson.get(ID.CHILD_NEW) ?? 0;
    expect(xOld).toBeGreaterThan(xNew);
  });

  it('存在しない人物を参照する relation は無視する', () => {
    const people = [person(ID.HUSBAND, '')];
    const relations = [marriedRel(ID.REL_MARRIED, ID.HUSBAND, ID.WIFE)];
    const result = layoutFamilyTree(people, relations);
    expect(result.nodes).toHaveLength(1);
    expect(result.marriageEdges).toHaveLength(0);
  });
});
