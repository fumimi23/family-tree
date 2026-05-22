import {
  buildChildToParents,
  buildCoupleUnits,
  buildSingleUnits,
} from '@/components/familyTree/layout/buildUnits';
import { assignUnitGenerations } from '@/components/familyTree/layout/generations';
import {
  PADDING,
  type PlacementCtx,
  type Unit,
  UNIT_GAP,
} from '@/components/familyTree/layout/internalTypes';
import { computeOwnership } from '@/components/familyTree/layout/ownership';
import { placeUnit } from '@/components/familyTree/layout/placement';
import { sortChildrenByBirth } from '@/components/familyTree/layout/sortChildren';
import { computeSubtreeWidth } from '@/components/familyTree/layout/subtreeWidth';
import { type FamilyTreeLayout } from '@/components/familyTree/types';
import { type Person } from '@/schemas/personSchema';
import { type Relation } from '@/schemas/relationSchema';

function emptyLayout(): FamilyTreeLayout {
  return {
    nodes: [],
    marriageEdges: [],
    parentGroups: [],
    width: 0,
    height: 0,
  };
}

function buildResult(ctx: PlacementCtx, totalRightX: number): FamilyTreeLayout {
  const maxBottom = ctx.nodes.reduce(
    (acc, n) => Math.max(acc, n.y + n.height),
    PADDING,
  );
  return {
    nodes: ctx.nodes,
    marriageEdges: ctx.marriageEdges,
    parentGroups: ctx.parentGroups,
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
    subtreeWidths: new Map(),
    childToParents: new Map(),
    nodes: [],
    marriageEdges: [],
    parentGroups: [],
    personPositions: new Map(),
  };
  return {
    unitMap,
    ctx,
  };
}

export function layoutFamilyTree(
  people: Person[],
  relations: Relation[],
): FamilyTreeLayout {
  if (people.length === 0) {
    return emptyLayout();
  }
  const unitOfPerson = new Map<string, string>();
  const coupleUnits = buildCoupleUnits(relations, unitOfPerson);
  const singleUnits = buildSingleUnits(people, unitOfPerson);
  const allUnits = [...coupleUnits, ...singleUnits];
  const childToParents = buildChildToParents(relations);
  assignUnitGenerations(allUnits, childToParents);
  const { unitMap, ctx } = createContext(allUnits);
  ctx.childToParents = childToParents;
  const ownership = computeOwnership(allUnits, unitOfPerson, childToParents);
  ctx.childrenOfUnit = ownership.childrenOfUnit;
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
  return buildResult(ctx, leftX);
}
