import { computeParentAnchor } from '@/components/familyTree/layout/edgeAnchor';
import {
  PERSON_WIDTH,
  type PersonPosition,
  type PlacementCtx,
  type Unit,
} from '@/components/familyTree/layout/internalTypes';
import { findAnchorPersonId } from '@/components/familyTree/layout/ownership';
import { type SecondaryParentEdgeLayout } from '@/components/familyTree/types';

interface UnitOrigin {
  leftX: number;
  y: number;
}

function getParentUnitOrigin(
  parentUnit: Unit,
  personPositions: Map<string, PersonPosition>,
): UnitOrigin | null {
  const positions = parentUnit.personIds
    .map((pid) => personPositions.get(pid))
    .filter((p): p is PersonPosition => p !== undefined);
  if (positions.length === 0) {
    return null;
  }
  return {
    leftX: positions[0].x,
    y: positions[0].y,
  };
}

export function buildSecondaryParentEdges(ctx: PlacementCtx): SecondaryParentEdgeLayout[] {
  const edges: SecondaryParentEdgeLayout[] = [];
  for (const [childUnitId, secondaryParentIds] of ctx.secondaryParentsOfUnit) {
    const childUnit = ctx.unitMap.get(childUnitId);
    if (childUnit === undefined) {
      continue;
    }
    for (const parentUnitId of secondaryParentIds) {
      const parentUnit = ctx.unitMap.get(parentUnitId);
      if (parentUnit === undefined) {
        continue;
      }
      const { personId, adopted } = findAnchorPersonId(
        childUnit,
        parentUnit,
        ctx.childToParents,
      );
      const childPos = ctx.personPositions.get(personId);
      const origin = getParentUnitOrigin(parentUnit, ctx.personPositions);
      if (childPos === undefined || origin === null) {
        continue;
      }
      const anchor = computeParentAnchor(parentUnit.type, origin.leftX, origin.y);
      edges.push({
        id: `${parentUnitId}__${childUnitId}`,
        parentAnchorX: anchor.x,
        parentAnchorY: anchor.y,
        busY: anchor.busY,
        childX: childPos.x + (PERSON_WIDTH / 2),
        childTopY: childPos.y,
        adopted,
      });
    }
  }
  return edges;
}
