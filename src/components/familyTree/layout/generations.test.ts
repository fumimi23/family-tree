import { describe, expect, it } from 'vitest';

import { assignUnitGenerations } from '@/components/familyTree/layout/generations';
import {
  type ParentLink,
  type Unit,
} from '@/components/familyTree/layout/internalTypes';

const ID = {
  GRAND: '11111111-1111-4111-8111-111111111111',
  PARENT: '22222222-2222-4222-8222-222222222222',
  CHILD: '33333333-3333-4333-8333-333333333333',
  A: '44444444-4444-4444-8444-444444444444',
  B: '55555555-5555-4555-8555-555555555555',
} as const;

function singleUnit(id: string, personId: string): Unit {
  return {
    id,
    type: 'single',
    personIds: [personId],
    marriageRelationId: null,
    marriageType: null,
    marriageDivorced: false,
    generation: 0,
  };
}

function link(parentId: string): ParentLink {
  return {
    parentId,
    adopted: false,
  };
}

describe('assignUnitGenerations', () => {
  it('親不在は世代 0、子は親+1 になる', () => {
    const parent = singleUnit('u-parent', ID.PARENT);
    const child = singleUnit('u-child', ID.CHILD);
    const units = [parent, child];
    const childToParents = new Map([[ID.CHILD, [link(ID.PARENT)]]]);
    assignUnitGenerations(units, childToParents);
    expect(parent.generation).toBe(0);
    expect(child.generation).toBe(1);
  });

  it('複数世代を経るとさらに +1 される', () => {
    const grand = singleUnit('u-grand', ID.GRAND);
    const parent = singleUnit('u-parent', ID.PARENT);
    const child = singleUnit('u-child', ID.CHILD);
    const units = [grand, parent, child];
    const childToParents = new Map([
      [ID.PARENT, [link(ID.GRAND)]],
      [ID.CHILD, [link(ID.PARENT)]],
    ]);
    assignUnitGenerations(units, childToParents);
    expect(grand.generation).toBe(0);
    expect(parent.generation).toBe(1);
    expect(child.generation).toBe(2);
  });

  it('親子関係に循環参照があれば throw する', () => {
    const a = singleUnit('u-a', ID.A);
    const b = singleUnit('u-b', ID.B);
    const childToParents = new Map([
      [ID.A, [link(ID.B)]],
      [ID.B, [link(ID.A)]],
    ]);
    expect(() => {
      assignUnitGenerations([a, b], childToParents);
    }).toThrow(/循環参照/u);
  });
});
