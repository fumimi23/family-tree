import {
  buildChildToParents,
  buildCoupleUnits,
  buildSingleUnits,
  type SecondaryMarriage,
} from '@/components/familyTree/layout/buildUnits';
import { computeShowFamilyNameMap } from '@/components/familyTree/layout/familyNameVisibility';
import { assignUnitGenerations } from '@/components/familyTree/layout/generations';
import {
  PADDING,
  PERSON_HEIGHT,
  PERSON_WIDTH,
  type PlacementCtx,
  type Unit,
  UNIT_GAP,
} from '@/components/familyTree/layout/internalTypes';
import { computeOwnership } from '@/components/familyTree/layout/ownership';
import { placeUnit } from '@/components/familyTree/layout/placement';
import { buildSecondaryParentEdges } from '@/components/familyTree/layout/secondaryParents';
import { sortChildrenByBirth } from '@/components/familyTree/layout/sortChildren';
import { computeSubtreeWidth } from '@/components/familyTree/layout/subtreeWidth';
import {
  type FamilyTreeLayout,
  type GenerationRowLayout,
  type SecondaryMarriageEdgeLayout,
} from '@/components/familyTree/types';
import { type Person } from '@/schemas/personSchema';
import { type Relation } from '@/schemas/relationSchema';

function filterRelationsWithExistingPersons(
  people: Person[],
  relations: Relation[],
): Relation[] {
  const ids = new Set(people.map((p) => p.id));
  return relations.filter((r) => {
    if (r.persons.personId1.length === 0 || r.persons.personId2.length === 0) {
      return false;
    }
    const p1 = r.persons.personId1[0];
    const p2 = r.persons.personId2[0];
    return ids.has(p1) && ids.has(p2);
  });
}

function emptyLayout(): FamilyTreeLayout {
  return {
    nodes: [],
    marriageEdges: [],
    secondaryMarriageEdges: [],
    parentGroups: [],
    secondaryParentEdges: [],
    generationRows: [],
    width: 0,
    height: 0,
  };
}

function buildGenerationRows(ctx: PlacementCtx): GenerationRowLayout[] {
  const heightByY = new Map<number, number>();
  for (const node of ctx.nodes) {
    const current = heightByY.get(node.y) ?? 0;
    if (node.height > current) {
      heightByY.set(node.y, node.height);
    }
  }
  const ys = Array.from(heightByY.keys()).sort((a, b) => a - b);
  return ys.map((y, generation) => ({
    generation,
    y,
    height: heightByY.get(y) ?? 0,
  }));
}

function buildResult(ctx: PlacementCtx, totalRightX: number): FamilyTreeLayout {
  const nodeBottom = ctx.nodes.reduce(
    (acc, n) => Math.max(acc, n.y + n.height),
    PADDING,
  );

  /*
   * secondary 婚姻線がノードより下に来るケース (子なし再婚など) を考慮して
   * viewBox 用の最大下端を計算する。
   */
  const busBottom = ctx.secondaryMarriageEdges.reduce(
    (acc, e) => Math.max(acc, e.busY),
    0,
  );
  const maxBottom = Math.max(nodeBottom, busBottom);
  return {
    nodes: ctx.nodes,
    marriageEdges: ctx.marriageEdges,
    secondaryMarriageEdges: ctx.secondaryMarriageEdges,
    parentGroups: ctx.parentGroups,
    secondaryParentEdges: ctx.secondaryParentEdges,
    generationRows: buildGenerationRows(ctx),
    width: (totalRightX - UNIT_GAP) + PADDING,
    height: maxBottom + PADDING,
  };
}

function createContext(units: Unit[]): {
  unitMap: Map<string, Unit>;
  ctx: PlacementCtx;
} {
  const unitMap = new Map(units.map((u) => [u.id, u]));
  const ctx: PlacementCtx = {
    unitMap,
    childrenOfUnit: new Map(),
    secondaryParentsOfUnit: new Map(),
    subtreeWidths: new Map(),
    childToParents: new Map(),
    showFamilyNameMap: new Map(),
    nodes: [],
    marriageEdges: [],
    secondaryMarriageEdges: [],
    parentGroups: [],
    secondaryParentEdges: [],
    personPositions: new Map(),
  };
  return {
    unitMap,
    ctx,
  };
}

const SECONDARY_MARRIAGE_BUS_OFFSET = 18;

/*
 * primary 人物ごとの secondary 婚姻線の段差カウンタ。
 * 同じ人が複数回再婚しているときは段ごとに busY を下げて重ならないようにする。
 * 別人物の secondary 婚姻にカウンタを引き継ぐと不要に深い段差になるので独立させる。
 */
function buildSecondaryMarriageEdges(
  secondaryMarriages: SecondaryMarriage[],
  personPositions: PlacementCtx['personPositions'],
): SecondaryMarriageEdgeLayout[] {
  const edges: SecondaryMarriageEdgeLayout[] = [];
  const indexByPrimary = new Map<string, number>();
  for (const sm of secondaryMarriages) {
    const primaryPos = personPositions.get(sm.primaryPersonId);
    const spousePos = personPositions.get(sm.spousePersonId);
    if (primaryPos === undefined || spousePos === undefined) {
      continue;
    }
    const idx = indexByPrimary.get(sm.primaryPersonId) ?? 0;
    indexByPrimary.set(sm.primaryPersonId, idx + 1);
    const offset = SECONDARY_MARRIAGE_BUS_OFFSET * (idx + 1);
    // 配偶者方向の側面 (左/右) を anchor とすることで縦線がノード内部を貫かないようにする。
    const spouseIsRight = spousePos.x > primaryPos.x;
    const primaryAnchorX = spouseIsRight ? primaryPos.x + PERSON_WIDTH : primaryPos.x;
    const spouseAnchorX = spouseIsRight ? spousePos.x : spousePos.x + PERSON_WIDTH;
    const halfHeight = PERSON_HEIGHT / 2;
    // 両ノードの下端より下に busY を置き、配偶者が下段にあっても線がノード内を通らないようにする。
    const lowerBottom = Math.max(primaryPos.y, spousePos.y) + PERSON_HEIGHT;
    edges.push({
      id: sm.relationId,
      type: sm.marriageType,
      primaryAnchorX,
      primaryAnchorY: primaryPos.y + halfHeight,
      spouseAnchorX,
      spouseAnchorY: spousePos.y + halfHeight,
      busY: lowerBottom + offset,
      divorced: sm.divorced,
    });
  }
  return edges;
}

export function layoutFamilyTree(
  people: Person[],
  relations: Relation[],
): FamilyTreeLayout {
  if (people.length === 0) {
    return emptyLayout();
  }
  const validRelations = filterRelationsWithExistingPersons(people, relations);
  const unitOfPerson = new Map<string, string>();
  const { units: coupleUnits, secondaryMarriages } = buildCoupleUnits(validRelations, unitOfPerson);
  const singleUnits = buildSingleUnits(people, unitOfPerson);
  const allUnits = [...coupleUnits, ...singleUnits];
  const childToParents = buildChildToParents(validRelations);
  assignUnitGenerations(allUnits, childToParents);
  const { unitMap, ctx } = createContext(allUnits);
  ctx.childToParents = childToParents;
  ctx.showFamilyNameMap = computeShowFamilyNameMap(people, childToParents);
  const ownership = computeOwnership(allUnits, unitOfPerson, childToParents);
  ctx.childrenOfUnit = ownership.childrenOfUnit;
  ctx.secondaryParentsOfUnit = ownership.secondaryParentsOfUnit;
  const personMap = new Map(people.map((p) => [p.id, p]));
  sortChildrenByBirth(ctx.childrenOfUnit, unitMap, childToParents, personMap);
  for (const rootId of ownership.rootUnitIds) {
    computeSubtreeWidth(rootId, unitMap, ctx.childrenOfUnit, ctx.subtreeWidths);
  }
  let leftX = PADDING;
  for (const rootId of ownership.rootUnitIds) {
    placeUnit(rootId, leftX, ctx);
    leftX += (ctx.subtreeWidths.get(rootId) ?? 0) + UNIT_GAP;
  }
  ctx.secondaryParentEdges = buildSecondaryParentEdges(ctx);
  ctx.secondaryMarriageEdges = buildSecondaryMarriageEdges(secondaryMarriages, ctx.personPositions);
  return buildResult(ctx, leftX);
}
