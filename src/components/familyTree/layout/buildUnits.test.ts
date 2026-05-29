import { describe, expect, it } from 'vitest';

import {
  buildChildToParents,
  buildCoupleUnits,
  buildSingleUnits,
} from '@/components/familyTree/layout/buildUnits';
import { type Person, Sex } from '@/schemas/personSchema';
import { HouseholdSide, type Relation, RelationType } from '@/schemas/relationSchema';

const ID = {
  PARENT: '11111111-1111-4111-8111-111111111111',
  CHILD: '22222222-2222-4222-8222-222222222222',
  HUSBAND: '33333333-3333-4333-8333-333333333333',
  WIFE: '44444444-4444-4444-8444-444444444444',
  SOLO: '55555555-5555-4555-8555-555555555555',
  REL_MARRIED: 'aaaaaaaa-0000-4000-8000-000000000001',
  REL_COUPLE: 'aaaaaaaa-0000-4000-8000-000000000002',
  REL_PARENT: 'bbbbbbbb-0000-4000-8000-000000000001',
  REL_ADOPTED: 'bbbbbbbb-0000-4000-8000-000000000002',
} as const;

function makePerson(id: string): Person {
  return {
    id,
    familyName: '姓',
    givenName: '名',
    familyNameKana: 'カナ',
    givenNameKana: 'カナ',
    sex: Sex.UNKNOWN,
    birth: '',
    death: '',
  };
}

function makeRelation(
  id: string,
  type: RelationType,
  p1: string,
  p2: string,
): Relation {
  return {
    id,
    relationType: [type],
    persons: {
      personId1: [p1],
      personId2: [p2],
    },
  };
}

describe('buildCoupleUnits', () => {
  it('夫婦関係から couple ユニットを作る', () => {
    const rel = makeRelation(
      ID.REL_MARRIED,
      RelationType.MARRIED_COUPLE,
      ID.HUSBAND,
      ID.WIFE,
    );
    const unitOfPerson = new Map<string, string>();
    const { units, secondaryMarriages } = buildCoupleUnits([rel], unitOfPerson);
    expect(units).toHaveLength(1);
    expect(secondaryMarriages).toHaveLength(0);
    expect(units[0].type).toBe('couple');
    expect(units[0].personIds).toEqual([ID.HUSBAND, ID.WIFE]);
    expect(units[0].marriageType).toBe('married');
    expect(unitOfPerson.get(ID.HUSBAND)).toBe(units[0].id);
    expect(unitOfPerson.get(ID.WIFE)).toBe(units[0].id);
  });

  it('事実婚は marriageType=couple になる', () => {
    const rel = makeRelation(
      ID.REL_COUPLE,
      RelationType.COUPLE,
      ID.HUSBAND,
      ID.WIFE,
    );
    const { units } = buildCoupleUnits([rel], new Map());
    expect(units[0].marriageType).toBe('couple');
  });

  it('householdSide 未指定なら householdHeadPersonId は null (personIds 順も不変)', () => {
    const rel = makeRelation(
      ID.REL_MARRIED,
      RelationType.MARRIED_COUPLE,
      ID.HUSBAND,
      ID.WIFE,
    );
    const { units } = buildCoupleUnits([rel], new Map());
    expect(units[0].householdHeadPersonId).toBeNull();
    expect(units[0].personIds).toEqual([ID.HUSBAND, ID.WIFE]);
  });

  it('householdSide=person2 なら householdHeadPersonId=p2 (personIds 順は変えない)', () => {
    const rel: Relation = {
      ...makeRelation(ID.REL_MARRIED, RelationType.MARRIED_COUPLE, ID.HUSBAND, ID.WIFE),
      householdSide: HouseholdSide.PERSON2,
    };
    const { units } = buildCoupleUnits([rel], new Map());
    expect(units[0].householdHeadPersonId).toBe(ID.WIFE);
    // 視覚順 (personIds) は person1, person2 のまま
    expect(units[0].personIds).toEqual([ID.HUSBAND, ID.WIFE]);
  });

  it('householdSide=person1 なら householdHeadPersonId=p1', () => {
    const rel: Relation = {
      ...makeRelation(ID.REL_MARRIED, RelationType.MARRIED_COUPLE, ID.HUSBAND, ID.WIFE),
      householdSide: HouseholdSide.PERSON1,
    };
    const { units } = buildCoupleUnits([rel], new Map());
    expect(units[0].householdHeadPersonId).toBe(ID.HUSBAND);
  });

  it('親子関係は無視する', () => {
    const rel = makeRelation(
      ID.REL_PARENT,
      RelationType.PARENT_CHILD,
      ID.PARENT,
      ID.CHILD,
    );
    const { units, secondaryMarriages } = buildCoupleUnits([rel], new Map());
    expect(units).toHaveLength(0);
    expect(secondaryMarriages).toHaveLength(0);
  });

  it('既にユニット化された人物を含む夫婦関係は secondary 婚姻として記録する', () => {
    const rel1 = makeRelation(
      ID.REL_MARRIED,
      RelationType.MARRIED_COUPLE,
      ID.HUSBAND,
      ID.WIFE,
    );
    const rel2 = makeRelation(
      'cccccccc-0000-4000-8000-000000000001',
      RelationType.MARRIED_COUPLE,
      ID.HUSBAND,
      ID.SOLO,
    );
    const { units, secondaryMarriages } = buildCoupleUnits([rel1, rel2], new Map());
    expect(units).toHaveLength(1);
    expect(secondaryMarriages).toHaveLength(1);
    expect(secondaryMarriages[0].primaryPersonId).toBe(ID.HUSBAND);
    expect(secondaryMarriages[0].spousePersonId).toBe(ID.SOLO);
    expect(secondaryMarriages[0].marriageType).toBe('married');
  });

  it('双方が既に別の婚姻 unit に居る場合も secondary 婚姻として記録する', () => {
    const OTHER = '99999999-9999-4999-8999-999999999999';
    const rel1 = makeRelation(
      ID.REL_MARRIED,
      RelationType.MARRIED_COUPLE,
      ID.HUSBAND,
      ID.WIFE,
    );
    const rel2 = makeRelation(
      'cccccccc-0000-4000-8000-000000000002',
      RelationType.MARRIED_COUPLE,
      ID.SOLO,
      OTHER,
    );
    const rel3 = makeRelation(
      'cccccccc-0000-4000-8000-000000000003',
      RelationType.MARRIED_COUPLE,
      ID.HUSBAND,
      ID.SOLO,
    );
    const { units, secondaryMarriages } = buildCoupleUnits([rel1, rel2, rel3], new Map());
    expect(units).toHaveLength(2);
    expect(secondaryMarriages).toHaveLength(1);
    expect(secondaryMarriages[0].relationId).toBe('cccccccc-0000-4000-8000-000000000003');
    // 両者既配置のとき personId1 が primary になる
    expect(secondaryMarriages[0].primaryPersonId).toBe(ID.HUSBAND);
    expect(secondaryMarriages[0].spousePersonId).toBe(ID.SOLO);
  });
});

describe('buildSingleUnits', () => {
  it('未ユニット化の人物それぞれを single ユニットにする', () => {
    const people = [makePerson(ID.SOLO), makePerson(ID.CHILD)];
    const unitOfPerson = new Map<string, string>();
    const units = buildSingleUnits(people, unitOfPerson);
    expect(units).toHaveLength(2);
    expect(units.every((u) => u.type === 'single')).toBe(true);
  });

  it('既にユニット化済みの人物はスキップする', () => {
    const people = [makePerson(ID.SOLO), makePerson(ID.CHILD)];
    const unitOfPerson = new Map<string, string>([[ID.SOLO, 'existing-unit']]);
    const units = buildSingleUnits(people, unitOfPerson);
    expect(units).toHaveLength(1);
    expect(units[0].personIds).toEqual([ID.CHILD]);
  });
});

describe('buildChildToParents', () => {
  it('実子関係は adopted=false で記録する', () => {
    const rel = makeRelation(
      ID.REL_PARENT,
      RelationType.PARENT_CHILD,
      ID.PARENT,
      ID.CHILD,
    );
    const map = buildChildToParents([rel]);
    expect(map.get(ID.CHILD)).toEqual([
      { parentId: ID.PARENT,
        adopted: false },
    ]);
  });

  it('養子関係は adopted=true で記録する', () => {
    const rel = makeRelation(
      ID.REL_ADOPTED,
      RelationType.PARENT_ADOPTED_CHILD,
      ID.PARENT,
      ID.CHILD,
    );
    const map = buildChildToParents([rel]);
    expect(map.get(ID.CHILD)).toEqual([
      { parentId: ID.PARENT,
        adopted: true },
    ]);
  });

  it('1 人の子に複数の親を紐付ける', () => {
    const rel1 = makeRelation(
      ID.REL_PARENT,
      RelationType.PARENT_CHILD,
      ID.HUSBAND,
      ID.CHILD,
    );
    const rel2 = makeRelation(
      'bbbbbbbb-0000-4000-8000-000000000003',
      RelationType.PARENT_CHILD,
      ID.WIFE,
      ID.CHILD,
    );
    const map = buildChildToParents([rel1, rel2]);
    const parents = map.get(ID.CHILD) ?? [];
    expect(parents.map((p) => p.parentId)).toEqual([ID.HUSBAND, ID.WIFE]);
  });

  it('夫婦/事実婚関係は無視する', () => {
    const rel = makeRelation(
      ID.REL_MARRIED,
      RelationType.MARRIED_COUPLE,
      ID.HUSBAND,
      ID.WIFE,
    );
    const map = buildChildToParents([rel]);
    expect(map.size).toBe(0);
  });
});
