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

function marriedRel(id: string, p1: string, p2: string, divorced?: boolean): Relation {
  const rel: Relation = {
    id,
    relationType: [RelationType.MARRIED_COUPLE],
    persons: {
      personId1: [p1],
      personId2: [p2],
    },
  };
  if (divorced !== undefined) {
    rel.divorced = divorced;
  }
  return rel;
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

  it('いとこ婚: couple unit から双方の親ユニットに線が引かれる', () => {
    const GP1 = 'eeeeeeee-0000-4000-8000-000000000001';
    const GP2 = 'eeeeeeee-0000-4000-8000-000000000002';
    const GP3 = 'eeeeeeee-0000-4000-8000-000000000003';
    const GP4 = 'eeeeeeee-0000-4000-8000-000000000004';
    const PARENT_A1 = 'ffffffff-0000-4000-8000-000000000001';
    const PARENT_A2 = 'ffffffff-0000-4000-8000-000000000002';
    const PARENT_B1 = 'ffffffff-0000-4000-8000-000000000003';
    const PARENT_B2 = 'ffffffff-0000-4000-8000-000000000004';
    const COUSIN_A = 'aaaaaaaa-1111-4000-8000-000000000001';
    const COUSIN_B = 'aaaaaaaa-1111-4000-8000-000000000002';
    const people = [
      person(GP1, '1920-01-01'),
      person(GP2, '1922-01-01'),
      person(GP3, '1925-01-01'),
      person(GP4, '1927-01-01'),
      person(PARENT_A1, '1950-01-01'),
      person(PARENT_A2, '1952-01-01'),
      person(PARENT_B1, '1955-01-01'),
      person(PARENT_B2, '1957-01-01'),
      person(COUSIN_A, '1980-01-01'),
      person(COUSIN_B, '1982-01-01'),
    ];
    const relations = [
      // 祖父母 1 (GP1-GP2) の子: PARENT_A1
      marriedRel('marrA-gp', GP1, GP2),
      parentRel('par-gp1-a1', GP1, PARENT_A1),
      parentRel('par-gp2-a1', GP2, PARENT_A1),
      // 祖父母 2 (GP3-GP4) の子: PARENT_B1
      marriedRel('marrB-gp', GP3, GP4),
      parentRel('par-gp3-b1', GP3, PARENT_B1),
      parentRel('par-gp4-b1', GP4, PARENT_B1),
      // PARENT_A1 と PARENT_A2 の夫婦, 子: COUSIN_A
      marriedRel('marrA', PARENT_A1, PARENT_A2),
      parentRel('par-a1-ca', PARENT_A1, COUSIN_A),
      parentRel('par-a2-ca', PARENT_A2, COUSIN_A),
      // PARENT_B1 と PARENT_B2 の夫婦, 子: COUSIN_B
      marriedRel('marrB', PARENT_B1, PARENT_B2),
      parentRel('par-b1-cb', PARENT_B1, COUSIN_B),
      parentRel('par-b2-cb', PARENT_B2, COUSIN_B),
      // COUSIN_A と COUSIN_B のいとこ婚 (子なし)
      marriedRel('marr-cousins', COUSIN_A, COUSIN_B),
    ];
    const result = layoutFamilyTree(people, relations);

    /*
     * いとこ婚 (COUSIN_A+B couple unit) は片方の親ユニット (PARENT_A) を primary owner として
     * 紐付くため、もう片方の親ユニット (PARENT_B) へは secondaryParentEdge が引かれる。
     * parentGroups: GP1-GP2 → PARENT_A1 / GP3-GP4 → PARENT_B1 / PARENT_A couple → COUSIN couple の 3 件
     */
    expect(result.parentGroups).toHaveLength(3);
    expect(result.secondaryParentEdges).toHaveLength(1);
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
