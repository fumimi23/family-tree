import { describe, expect, it } from 'vitest';

import {
  COUPLE_GAP,
  PERSON_WIDTH,
  type Unit,
  UNIT_GAP,
} from '@/components/familyTree/layout/internalTypes';
import {
  computeSubtreeWidth,
  unitOwnWidth,
} from '@/components/familyTree/layout/subtreeWidth';

function singleUnit(id: string): Unit {
  return {
    id,
    type: 'single',
    personIds: [`p-${id}`],
    marriageRelationId: null,
    marriageType: null,
    marriageDivorced: false,
    generation: 0,
  };
}

function coupleUnit(id: string): Unit {
  return {
    id,
    type: 'couple',
    personIds: [`p1-${id}`, `p2-${id}`],
    marriageRelationId: 'rel',
    marriageType: 'married',
    marriageDivorced: false,
    generation: 0,
  };
}

describe('unitOwnWidth', () => {
  it('single は PERSON_WIDTH', () => {
    expect(unitOwnWidth(singleUnit('a'))).toBe(PERSON_WIDTH);
  });

  it('couple は PERSON_WIDTH*2 + COUPLE_GAP', () => {
    expect(unitOwnWidth(coupleUnit('a'))).toBe((PERSON_WIDTH * 2) + COUPLE_GAP);
  });
});

describe('computeSubtreeWidth', () => {
  it('葉ユニットは自身の幅を返す', () => {
    const unit = singleUnit('leaf');
    const unitMap = new Map([[unit.id, unit]]);
    const width = computeSubtreeWidth(unit.id, unitMap, new Map(), new Map());
    expect(width).toBe(PERSON_WIDTH);
  });

  it('子が複数あるときは子の合計幅 + UNIT_GAP * (n-1) を採用する', () => {
    const root = singleUnit('root');
    const child1 = singleUnit('c1');
    const child2 = singleUnit('c2');
    const unitMap = new Map([
      [root.id, root],
      [child1.id, child1],
      [child2.id, child2],
    ]);
    const childrenOfUnit = new Map([[root.id, [child1.id, child2.id]]]);
    const width = computeSubtreeWidth(root.id, unitMap, childrenOfUnit, new Map());
    expect(width).toBe((PERSON_WIDTH * 2) + UNIT_GAP);
  });

  it('自身の幅の方が子合計より大きい場合は自身の幅を採用する', () => {
    const root = coupleUnit('root');
    const child = singleUnit('c');
    const unitMap = new Map([[root.id, root], [child.id, child]]);
    const childrenOfUnit = new Map([[root.id, [child.id]]]);
    const width = computeSubtreeWidth(root.id, unitMap, childrenOfUnit, new Map());
    expect(width).toBe((PERSON_WIDTH * 2) + COUPLE_GAP);
  });

  it('memo で同じユニットの計算結果は再利用される', () => {
    const root = singleUnit('root');
    const unitMap = new Map([[root.id, root]]);
    const memo = new Map<string, number>();
    computeSubtreeWidth(root.id, unitMap, new Map(), memo);
    expect(memo.get(root.id)).toBe(PERSON_WIDTH);
  });

  it('存在しないユニットは 0 を返す', () => {
    const width = computeSubtreeWidth('missing', new Map(), new Map(), new Map());
    expect(width).toBe(0);
  });
});
