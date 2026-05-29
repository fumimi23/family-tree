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

  /*
   * householdSide 指定時は person1 が左スロットとは限らない (#164 で継ぐ側を左に配置)。
   * computeParentAnchor は unit の左端を起点に婚姻線中央を計算するため、personIds[0] では
   * なく実際の最小 x を unit 左端として渡す。couple の 2 人は同じ y なので y は先頭でよい。
   */
  return {
    leftX: Math.min(...positions.map((p) => p.x)),
    y: positions[0].y,
  };
}

/*
 * primary 親子線と同じ busY だと水平セグメントが重なり視認性が落ちる
 * (特にいとこ婚など、子側の couple unit が両方の親ユニットを持つケース) ため、
 * secondary 親子線は busY を少し下げる。世代間の余白に収まる小さなオフセットで十分。
 */
const SECONDARY_PARENT_BUS_OFFSET = 12;

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
        busY: anchor.busY + SECONDARY_PARENT_BUS_OFFSET,
        childX: childPos.x + (PERSON_WIDTH / 2),
        childTopY: childPos.y,
        adopted,
      });
    }
  }
  return edges;
}
