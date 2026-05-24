import { describe, expect, it } from 'vitest';

import {
  COUPLE_GAP,
  GENERATION_GAP,
  type ParentLink,
  PERSON_HEIGHT,
  PERSON_WIDTH,
  type PersonPosition,
  type PlacementCtx,
  type Unit,
} from '@/components/familyTree/layout/internalTypes';
import { buildSecondaryParentEdges } from '@/components/familyTree/layout/secondaryParents';

const ID = {
  HUSBAND: '11111111-1111-4111-8111-111111111111',
  WIFE: '22222222-2222-4222-8222-222222222222',
  OUTSIDER: '33333333-3333-4333-8333-333333333333',
  CHILD: '44444444-4444-4444-8444-444444444444',
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

function buildCtx(
  units: Unit[],
  secondaryParentsOfUnit: Map<string, string[]>,
  childToParents: Map<string, ParentLink[]>,
  personPositions: Map<string, PersonPosition>,
): PlacementCtx {
  return {
    unitMap: new Map(units.map((u) => [u.id, u])),
    childrenOfUnit: new Map(),
    secondaryParentsOfUnit,
    subtreeWidths: new Map(),
    childToParents,
    showFamilyNameMap: new Map(),
    nodes: [],
    marriageEdges: [],
    secondaryMarriageEdges: [],
    parentGroups: [],
    secondaryParentEdges: [],
    personPositions,
  };
}

describe('buildSecondaryParentEdges', () => {
  it('secondary parent との edge を生成する (single 親、実子)', () => {
    const couple = coupleUnit('u-couple', ID.HUSBAND, ID.WIFE);
    const outsider = singleUnit('u-outsider', ID.OUTSIDER);
    const child = singleUnit('u-child', ID.CHILD);
    const childToParents = new Map<string, ParentLink[]>([
      [
        ID.CHILD,
        [
          { parentId: ID.HUSBAND,
            adopted: false },
          { parentId: ID.OUTSIDER,
            adopted: false },
        ],
      ],
    ]);
    const personPositions = new Map<string, PersonPosition>([
      [
        ID.HUSBAND, { x: 0,
          y: 0 },
      ],
      [
        ID.WIFE, { x: PERSON_WIDTH + COUPLE_GAP,
          y: 0 },
      ],
      [
        ID.OUTSIDER, { x: 300,
          y: 0 },
      ],
      [
        ID.CHILD, { x: 150,
          y: 200 },
      ],
    ]);
    const ctx = buildCtx(
      [couple, outsider, child],
      new Map([[child.id, [outsider.id]]]),
      childToParents,
      personPositions,
    );
    const edges = buildSecondaryParentEdges(ctx);
    expect(edges).toHaveLength(1);
    expect(edges[0].id).toBe('u-outsider__u-child');
    expect(edges[0].parentAnchorX).toBe(300 + (PERSON_WIDTH / 2));
    expect(edges[0].parentAnchorY).toBe(PERSON_HEIGHT);
    expect(edges[0].busY).toBe(PERSON_HEIGHT + (GENERATION_GAP / 2));
    expect(edges[0].childX).toBe(150 + (PERSON_WIDTH / 2));
    expect(edges[0].childTopY).toBe(200);
    expect(edges[0].adopted).toBe(false);
  });

  it('養子なら adopted=true で edge を作る', () => {
    const outsider = singleUnit('u-outsider', ID.OUTSIDER);
    const child = singleUnit('u-child', ID.CHILD);
    const childToParents = new Map<string, ParentLink[]>([
      [
        ID.CHILD, [
          { parentId: ID.OUTSIDER,
            adopted: true },
        ],
      ],
    ]);
    const personPositions = new Map<string, PersonPosition>([
      [
        ID.OUTSIDER, { x: 0,
          y: 0 },
      ],
      [
        ID.CHILD, { x: 100,
          y: 200 },
      ],
    ]);
    const ctx = buildCtx(
      [outsider, child],
      new Map([[child.id, [outsider.id]]]),
      childToParents,
      personPositions,
    );
    const edges = buildSecondaryParentEdges(ctx);
    expect(edges[0].adopted).toBe(true);
  });

  it('座標が未確定の場合は edge をスキップする', () => {
    const outsider = singleUnit('u-outsider', ID.OUTSIDER);
    const child = singleUnit('u-child', ID.CHILD);
    const childToParents = new Map<string, ParentLink[]>([
      [
        ID.CHILD, [
          { parentId: ID.OUTSIDER,
            adopted: false },
        ],
      ],
    ]);
    const ctx = buildCtx(
      [outsider, child],
      new Map([[child.id, [outsider.id]]]),
      childToParents,
      new Map(),
    );
    expect(buildSecondaryParentEdges(ctx)).toEqual([]);
  });
});
