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

function marriedRel(id: string, p1: string, p2: string, divorced = false): Relation {
  return {
    id,
    relationType: [RelationType.MARRIED_COUPLE],
    persons: {
      personId1: [p1],
      personId2: [p2],
    },
    divorced,
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
    const oldNode = result.nodes.find((n) => n.personId === ID.CHILD_OLD);
    const newNode = result.nodes.find((n) => n.personId === ID.CHILD_NEW);
    if (oldNode === undefined || newNode === undefined) {
      throw new Error('期待した子ノードが見つかりません');
    }
    expect(oldNode.x).toBeGreaterThan(newNode.x);
  });

  it('存在しない人物を参照する relation は無視する', () => {
    const people = [person(ID.HUSBAND, '')];
    const relations = [marriedRel(ID.REL_MARRIED, ID.HUSBAND, ID.WIFE)];
    const result = layoutFamilyTree(people, relations);
    expect(result.nodes).toHaveLength(1);
    expect(result.marriageEdges).toHaveLength(0);
  });

  it('再婚: 2 つ目の婚姻は secondaryMarriageEdges として primary 人物と新配偶者を繋ぐ', () => {
    const SECOND_WIFE = 'cccccccc-0000-4000-8000-000000000099';
    const REL_SECOND = 'dddddddd-0000-4000-8000-000000000099';
    const people = [
      person(ID.HUSBAND, '1970-01-01'),
      person(ID.WIFE, '1972-01-01'),
      person(SECOND_WIFE, '1980-01-01'),
    ];
    const relations = [
      marriedRel(ID.REL_MARRIED, ID.HUSBAND, ID.WIFE),
      marriedRel(REL_SECOND, ID.HUSBAND, SECOND_WIFE),
    ];
    const result = layoutFamilyTree(people, relations);
    expect(result.marriageEdges).toHaveLength(1);
    expect(result.secondaryMarriageEdges).toHaveLength(1);
    const edge = result.secondaryMarriageEdges[0];
    expect(edge.id).toBe(REL_SECOND);
    expect(edge.type).toBe('married');
    // 二人とも描画される (= 重複なし)
    expect(result.nodes.filter((n) => n.personId === ID.HUSBAND)).toHaveLength(1);
    expect(result.nodes.filter((n) => n.personId === SECOND_WIFE)).toHaveLength(1);
    // anchor は両ノードの中央高さ、busY は両ノードの下端より下
    const husbandNode = result.nodes.find((n) => n.personId === ID.HUSBAND);
    const secondWifeNode = result.nodes.find((n) => n.personId === SECOND_WIFE);
    if (husbandNode === undefined || secondWifeNode === undefined) {
      throw new Error('期待したノードが見つかりません');
    }
    expect(edge.primaryAnchorY).toBe(husbandNode.y + (husbandNode.height / 2));
    expect(edge.spouseAnchorY).toBe(secondWifeNode.y + (secondWifeNode.height / 2));
    expect(edge.busY).toBeGreaterThanOrEqual(husbandNode.y + husbandNode.height);
    expect(edge.busY).toBeGreaterThanOrEqual(secondWifeNode.y + secondWifeNode.height);
  });

  it('secondary 婚姻線の busY がノードより下に出る場合は layout.height に含まれる', () => {
    const SECOND_WIFE = 'cccccccc-0000-4000-8000-000000000200';
    const REL_SECOND = 'dddddddd-0000-4000-8000-000000000200';
    const people = [
      person(ID.HUSBAND, '1970-01-01'),
      person(ID.WIFE, '1972-01-01'),
      person(SECOND_WIFE, '1980-01-01'),
    ];
    const relations = [
      marriedRel(ID.REL_MARRIED, ID.HUSBAND, ID.WIFE),
      marriedRel(REL_SECOND, ID.HUSBAND, SECOND_WIFE),
    ];
    const result = layoutFamilyTree(people, relations);
    const edge = result.secondaryMarriageEdges[0];
    expect(result.height).toBeGreaterThanOrEqual(edge.busY);
  });

  it('離婚フラグは primary 婚姻線にも secondary 婚姻線にも伝搬する', () => {
    const SECOND_WIFE = 'cccccccc-0000-4000-8000-000000000300';
    const REL_SECOND = 'dddddddd-0000-4000-8000-000000000300';
    const people = [
      person(ID.HUSBAND, '1970-01-01'),
      person(ID.WIFE, '1972-01-01'),
      person(SECOND_WIFE, '1980-01-01'),
    ];
    const relations = [
      marriedRel(ID.REL_MARRIED, ID.HUSBAND, ID.WIFE, true),
      marriedRel(REL_SECOND, ID.HUSBAND, SECOND_WIFE, true),
    ];
    const result = layoutFamilyTree(people, relations);
    expect(result.marriageEdges[0].divorced).toBe(true);
    expect(result.secondaryMarriageEdges[0].divorced).toBe(true);
  });

  it('離婚フラグが指定されていない relation は divorced=false で出力される', () => {
    const people = [
      person(ID.HUSBAND, '1970-01-01'),
      person(ID.WIFE, '1972-01-01'),
    ];
    const relations = [marriedRel(ID.REL_MARRIED, ID.HUSBAND, ID.WIFE)];
    const result = layoutFamilyTree(people, relations);
    expect(result.marriageEdges[0].divorced).toBe(false);
  });

  it('同一人物の 3 回目以降の婚姻は段差で busY が深くなる', () => {
    const SPOUSE2 = 'cccccccc-0000-4000-8000-000000000101';
    const SPOUSE3 = 'cccccccc-0000-4000-8000-000000000102';
    const REL2 = 'dddddddd-0000-4000-8000-000000000101';
    const REL3 = 'dddddddd-0000-4000-8000-000000000102';
    const people = [
      person(ID.HUSBAND, '1970-01-01'),
      person(ID.WIFE, '1972-01-01'),
      person(SPOUSE2, '1980-01-01'),
      person(SPOUSE3, '1985-01-01'),
    ];
    const relations = [
      marriedRel(ID.REL_MARRIED, ID.HUSBAND, ID.WIFE),
      marriedRel(REL2, ID.HUSBAND, SPOUSE2),
      marriedRel(REL3, ID.HUSBAND, SPOUSE3),
    ];
    const result = layoutFamilyTree(people, relations);
    expect(result.secondaryMarriageEdges).toHaveLength(2);
    const [first, second] = result.secondaryMarriageEdges;
    expect(second.busY).toBeGreaterThan(first.busY);
  });
});
