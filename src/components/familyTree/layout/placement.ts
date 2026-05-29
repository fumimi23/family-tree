import { computeParentAnchor } from '@/components/familyTree/layout/edgeAnchor';
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
import { findAnchorPersonId, orderedPersonIds } from '@/components/familyTree/layout/ownership';
import { unitOwnWidth } from '@/components/familyTree/layout/subtreeWidth';
import { type ChildLinkLayout } from '@/components/familyTree/types';

function placeUnitPersons(
  unit: Unit,
  unitLeftX: number,
  unitY: number,
  ctx: PlacementCtx,
): void {
  let px = unitLeftX;
  // 継ぐ側 (household head) を左に配置するため head-first 順で並べる (#164)
  for (const pid of orderedPersonIds(unit)) {
    ctx.nodes.push({
      personId: pid,
      x: px,
      y: unitY,
      width: PERSON_WIDTH,
      height: PERSON_HEIGHT,
      showFamilyName: ctx.showFamilyNameMap.get(pid) ?? true,
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
      divorced: unit.marriageDivorced,
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
  const anchor = computeParentAnchor(parentUnit.type, unitLeftX, unitY);
  const children = buildChildLinks(parentUnit, childIds, ctx);
  if (children.length === 0) {
    return;
  }
  ctx.parentGroups.push({
    id: parentUnit.id,
    parentAnchorX: anchor.x,
    parentAnchorY: anchor.y,
    busY: anchor.busY,
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
