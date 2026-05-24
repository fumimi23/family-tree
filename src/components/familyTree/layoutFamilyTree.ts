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
  const maxBottom = ctx.nodes.reduce(
    (acc, n) => Math.max(acc, n.y + n.height),
    PADDING,
  );
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

function buildSecondaryMarriageEdges(
  secondaryMarriages: SecondaryMarriage[],
  personPositions: PlacementCtx['personPositions'],
): SecondaryMarriageEdgeLayout[] {
  const edges: SecondaryMarriageEdgeLayout[] = [];
  let index = 0;
  for (const sm of secondaryMarriages) {
    const primaryPos = personPositions.get(sm.primaryPersonId);
    const spousePos = personPositions.get(sm.spousePersonId);
    if (primaryPos === undefined || spousePos === undefined) {
      continue;
    }
    const halfWidth = PERSON_WIDTH / 2;
    const halfHeight = PERSON_HEIGHT / 2;
    const offset = SECONDARY_MARRIAGE_BUS_OFFSET * (index + 1);
    index += 1;
    edges.push({
      id: sm.relationId,
      type: sm.marriageType,
      primaryAnchorX: primaryPos.x + halfWidth,
      primaryAnchorY: primaryPos.y + halfHeight,
      spouseAnchorX: spousePos.x + halfWidth,
      spouseAnchorY: spousePos.y + halfHeight,
      busY: primaryPos.y + halfHeight + offset,
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
