import {
  COUPLE_GAP,
  GENERATION_GAP,
  PADDING,
  PERSON_HEIGHT,
  PERSON_WIDTH,
  type PlacementCtx,
  type Unit,
  UNIT_GAP,
} from '@/components/familyTree/layout/internalTypes';
import { findAnchorPersonId } from '@/components/familyTree/layout/ownership';
import { unitOwnWidth } from '@/components/familyTree/layout/subtreeWidth';
import { type ChildLinkLayout } from '@/components/familyTree/types';

function placeUnitPersons(
  unit: Unit,
  unitLeftX: number,
  unitY: number,
  ctx: PlacementCtx,
): void {
  let px = unitLeftX;
  for (const pid of unit.personIds) {
    ctx.nodes.push({
      personId: pid,
      x: px,
      y: unitY,
      width: PERSON_WIDTH,
      height: PERSON_HEIGHT,
    });
    ctx.personPositions.set(pid, {
      x: px,
      y: unitY,
    });
    px += PERSON_WIDTH + COUPLE_GAP;
  }
  if (
    unit.type === 'couple'
    && unit.marriageRelationId !== null
    && unit.marriageType !== null
  ) {
    ctx.marriageEdges.push({
      id: unit.marriageRelationId,
      type: unit.marriageType,
      x1: unitLeftX + PERSON_WIDTH,
      x2: unitLeftX + PERSON_WIDTH + COUPLE_GAP,
      y: unitY + (PERSON_HEIGHT / 2),
    });
  }
}

function buildChildLinks(
  parentUnit: Unit,
  childIds: string[],
  ctx: PlacementCtx,
): ChildLinkLayout[] {
  const children: ChildLinkLayout[] = [];
  for (const childId of childIds) {
    const childUnit = ctx.unitMap.get(childId);
    if (childUnit === undefined) {
      continue;
    }
    const { personId, adopted } = findAnchorPersonId(
      childUnit,
      parentUnit,
      ctx.childToParents,
    );
    const pos = ctx.personPositions.get(personId);
    if (pos === undefined) {
      continue;
    }
    children.push({
      childPersonId: personId,
      childX: pos.x + (PERSON_WIDTH / 2),
      childTopY: pos.y,
      adopted,
    });
  }
  return children;
}

function emitParentGroup(
  parentUnit: Unit,
  unitLeftX: number,
  unitY: number,
  childIds: string[],
  ctx: PlacementCtx,
): void {
  const isCouple = parentUnit.type === 'couple';
  const parentAnchorX = isCouple
    ? unitLeftX + PERSON_WIDTH + (COUPLE_GAP / 2)
    : unitLeftX + (PERSON_WIDTH / 2);
  const parentAnchorY = isCouple
    ? unitY + (PERSON_HEIGHT / 2)
    : unitY + PERSON_HEIGHT;
  const busY = unitY + PERSON_HEIGHT + (GENERATION_GAP / 2);
  const children = buildChildLinks(parentUnit, childIds, ctx);
  if (children.length === 0) {
    return;
  }
  ctx.parentGroups.push({
    id: parentUnit.id,
    parentAnchorX,
    parentAnchorY,
    busY,
    children,
  });
}

function computeChildrenWidth(
  childIds: string[],
  ctx: PlacementCtx,
): number {
  let total = -UNIT_GAP;
  for (const childId of childIds) {
    total += (ctx.subtreeWidths.get(childId) ?? 0) + UNIT_GAP;
  }
  return total;
}

export function placeUnit(
  unitId: string,
  leftX: number,
  ctx: PlacementCtx,
): void {
  const unit = ctx.unitMap.get(unitId);
  if (unit === undefined) {
    return;
  }
  const stWidth = ctx.subtreeWidths.get(unitId) ?? unitOwnWidth(unit);
  const own = unitOwnWidth(unit);
  const unitCenterX = leftX + (stWidth / 2);
  const unitLeftX = unitCenterX - (own / 2);
  const unitY = PADDING + (unit.generation * (PERSON_HEIGHT + GENERATION_GAP));
  placeUnitPersons(unit, unitLeftX, unitY, ctx);
  const children = ctx.childrenOfUnit.get(unitId) ?? [];
  if (children.length === 0) {
    return;
  }
  const childrenTotal = computeChildrenWidth(children, ctx);
  let childLeft = unitCenterX - (childrenTotal / 2);
  for (const childId of children) {
    placeUnit(childId, childLeft, ctx);
    childLeft += (ctx.subtreeWidths.get(childId) ?? 0) + UNIT_GAP;
  }
  emitParentGroup(unit, unitLeftX, unitY, children, ctx);
}
