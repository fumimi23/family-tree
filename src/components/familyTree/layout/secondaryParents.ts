import {
  COUPLE_GAP,
  GENERATION_GAP,
  PERSON_HEIGHT,
  PERSON_WIDTH,
  type PersonPosition,
  type PlacementCtx,
  type Unit,
} from '@/components/familyTree/layout/internalTypes';
import { findAnchorPersonId } from '@/components/familyTree/layout/ownership';
import { type SecondaryParentEdgeLayout } from '@/components/familyTree/types';

interface ParentAnchor {
  x: number;
  y: number;
  unitY: number;
}

function getParentAnchor(
  parentUnit: Unit,
  personPositions: Map<string, PersonPosition>,
): ParentAnchor | null {
  const positions = parentUnit.personIds
    .map((pid) => personPositions.get(pid))
    .filter((p): p is PersonPosition => p !== undefined);
  if (positions.length === 0) {
    return null;
  }
  const first = positions[0];
  if (parentUnit.type === 'couple' && positions.length === 2) {
    return {
      x: first.x + PERSON_WIDTH + (COUPLE_GAP / 2),
      y: first.y + (PERSON_HEIGHT / 2),
      unitY: first.y,
    };
  }
  return {
    x: first.x + (PERSON_WIDTH / 2),
    y: first.y + PERSON_HEIGHT,
    unitY: first.y,
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
      const parentAnchor = getParentAnchor(parentUnit, ctx.personPositions);
      if (childPos === undefined || parentAnchor === null) {
        continue;
      }
      edges.push({
        id: `${parentUnitId}__${childUnitId}`,
        parentAnchorX: parentAnchor.x,
        parentAnchorY: parentAnchor.y,
        busY: parentAnchor.unitY + PERSON_HEIGHT + (GENERATION_GAP / 2),
        childX: childPos.x + (PERSON_WIDTH / 2),
        childTopY: childPos.y,
        adopted,
      });
    }
  }
  return edges;
}
