import {
  type MarriageEdgeLayout,
  type MarriageLineType,
  type ParentChildrenGroupLayout,
  type PersonNodeLayout,
  type SecondaryMarriageEdgeLayout,
  type SecondaryParentEdgeLayout,
} from '@/components/familyTree/types';

export type { MarriageLineType };

export const PERSON_WIDTH = 120;
export const PERSON_HEIGHT = 76;
export const GENERATION_GAP = 80;
export const UNIT_GAP = 32;
export const COUPLE_GAP = 16;
export const PADDING = 24;
export const LABELS_WIDTH = 64;

export type UnitType = 'couple' | 'single';

export interface Unit {
  id: string;
  type: UnitType;
  personIds: string[];
  marriageRelationId: string | null;
  marriageType: MarriageLineType | null;
  marriageDivorced: boolean;
  generation: number;
}

export interface ParentLink {
  parentId: string;
  adopted: boolean;
}

export interface PersonPosition {
  x: number;
  y: number;
}

export interface PlacementCtx {
  unitMap: Map<string, Unit>;
  childrenOfUnit: Map<string, string[]>;
  secondaryParentsOfUnit: Map<string, string[]>;
  subtreeWidths: Map<string, number>;
  childToParents: Map<string, ParentLink[]>;
  showFamilyNameMap: Map<string, boolean>;
  nodes: PersonNodeLayout[];
  marriageEdges: MarriageEdgeLayout[];
  secondaryMarriageEdges: SecondaryMarriageEdgeLayout[];
  parentGroups: ParentChildrenGroupLayout[];
  secondaryParentEdges: SecondaryParentEdgeLayout[];
  personPositions: Map<string, PersonPosition>;
}
