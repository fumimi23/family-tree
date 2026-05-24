import { describe, expect, it } from 'vitest';

import {
  type ParentLink,
  type Unit,
} from '@/components/familyTree/layout/internalTypes';
import {
  computeOwnership,
  findAnchorPersonId,
} from '@/components/familyTree/layout/ownership';

const ID = {
  PARENT: '11111111-1111-4111-8111-111111111111',
  CHILD: '22222222-2222-4222-8222-222222222222',
  HUSBAND: '33333333-3333-4333-8333-333333333333',
  WIFE: '44444444-4444-4444-8444-444444444444',
  OUTSIDER: '55555555-5555-4555-8555-555555555555',
} as const;

function singleUnit(id: string, personId: string): Unit {
  return {
    id,
    type: 'single',
    personIds: [personId],
    marriageRelationId: null,
    marriageType: null,
    generation: 0,
  };
}

function coupleUnit(id: string, p1: string, p2: string): Unit {
  return {
    id,
    type: 'couple',
    personIds: [p1, p2],
    marriageRelationId: 'rel',
    marriageType: 'married',
    generation: 0,
  };
}

function link(parentId: string): ParentLink {
  return {
    parentId,
    adopted: false,
  };
}

describe('computeOwnership', () => {
  it('親不在のユニットは root として扱う', () => {
    const units = [singleUnit('u-parent', ID.PARENT)];
    const unitOfPerson = new Map([[ID.PARENT, 'u-parent']]);
    const result = computeOwnership(units, unitOfPerson, new Map());
    expect(result.rootUnitIds).toEqual(['u-parent']);
    expect(result.childrenOfUnit.size).toBe(0);
  });

  it('単親なら primary owner にのみ記録する', () => {
    const units = [
      singleUnit('u-parent', ID.PARENT),
      singleUnit('u-child', ID.CHILD),
    ];
    const unitOfPerson = new Map([
      [ID.PARENT, 'u-parent'],
      [ID.CHILD, 'u-child'],
    ]);
    const childToParents = new Map([[ID.CHILD, [link(ID.PARENT)]]]);
    const result = computeOwnership(units, unitOfPerson, childToParents);
    expect(result.rootUnitIds).toEqual(['u-parent']);
    expect(result.childrenOfUnit.get('u-parent')).toEqual(['u-child']);
    expect(result.secondaryParentsOfUnit.size).toBe(0);
  });

  it('複数の親ユニットがあるとき 2 つ目以降は secondary になる', () => {
    const units = [
      coupleUnit('u-couple', ID.HUSBAND, ID.WIFE),
      singleUnit('u-outsider', ID.OUTSIDER),
      singleUnit('u-child', ID.CHILD),
    ];
    const unitOfPerson = new Map([
      [ID.HUSBAND, 'u-couple'],
      [ID.WIFE, 'u-couple'],
      [ID.OUTSIDER, 'u-outsider'],
      [ID.CHILD, 'u-child'],
    ]);
    const childToParents = new Map([[ID.CHILD, [link(ID.HUSBAND), link(ID.OUTSIDER)]]]);
    const result = computeOwnership(units, unitOfPerson, childToParents);
    expect(result.childrenOfUnit.get('u-couple')).toEqual(['u-child']);
    expect(result.secondaryParentsOfUnit.get('u-child')).toEqual(['u-outsider']);
  });

  it('同じユニット内の複数の親は重複登録しない', () => {
    const units = [
      coupleUnit('u-couple', ID.HUSBAND, ID.WIFE),
      singleUnit('u-child', ID.CHILD),
    ];
    const unitOfPerson = new Map([
      [ID.HUSBAND, 'u-couple'],
      [ID.WIFE, 'u-couple'],
      [ID.CHILD, 'u-child'],
    ]);
    const childToParents = new Map([[ID.CHILD, [link(ID.HUSBAND), link(ID.WIFE)]]]);
    const result = computeOwnership(units, unitOfPerson, childToParents);
    expect(result.childrenOfUnit.get('u-couple')).toEqual(['u-child']);
    expect(result.secondaryParentsOfUnit.size).toBe(0);
  });
});

describe('findAnchorPersonId', () => {
  it('childUnit 内で parentUnit に親リンクを持つ人物を返す', () => {
    const parent = coupleUnit('u-couple', ID.HUSBAND, ID.WIFE);
    const child = coupleUnit('u-child', ID.CHILD, ID.OUTSIDER);
    const childToParents = new Map([[ID.CHILD, [link(ID.HUSBAND)]]]);
    const result = findAnchorPersonId(child, parent, childToParents);
    expect(result.personId).toBe(ID.CHILD);
    expect(result.adopted).toBe(false);
  });

  it('養子なら adopted=true を返す', () => {
    const parent = singleUnit('u-parent', ID.PARENT);
    const child = singleUnit('u-child', ID.CHILD);
    const childToParents = new Map([
      [
        ID.CHILD,
        [
          { parentId: ID.PARENT,
            adopted: true },
        ],
      ],
    ]);
    const result = findAnchorPersonId(child, parent, childToParents);
    expect(result.adopted).toBe(true);
  });

  it('該当リンクがなければ childUnit の最初の人物を返す (adopted=false)', () => {
    const parent = singleUnit('u-other', ID.OUTSIDER);
    const child = coupleUnit('u-child', ID.CHILD, ID.HUSBAND);
    const result = findAnchorPersonId(child, parent, new Map());
    expect(result.personId).toBe(ID.CHILD);
    expect(result.adopted).toBe(false);
  });
});
