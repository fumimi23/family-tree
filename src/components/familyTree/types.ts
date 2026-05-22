export type MarriageLineType = 'couple' | 'married';

export interface PersonNodeLayout {
  personId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  showFamilyName: boolean;
}

export interface MarriageEdgeLayout {
  id: string;
  type: MarriageLineType;
  x1: number;
  x2: number;
  y: number;
}

export interface ChildLinkLayout {
  childPersonId: string;
  childX: number;
  childTopY: number;
  adopted: boolean;
}

export interface ParentChildrenGroupLayout {
  id: string;
  parentAnchorX: number;
  parentAnchorY: number;
  busY: number;
  children: ChildLinkLayout[];
}

export interface SecondaryParentEdgeLayout {
  id: string;
  parentAnchorX: number;
  parentAnchorY: number;
  busY: number;
  childX: number;
  childTopY: number;
  adopted: boolean;
}

export interface GenerationRowLayout {
  generation: number;
  y: number;
  height: number;
}

export interface FamilyTreeLayout {
  nodes: PersonNodeLayout[];
  marriageEdges: MarriageEdgeLayout[];
  parentGroups: ParentChildrenGroupLayout[];
  secondaryParentEdges: SecondaryParentEdgeLayout[];
  generationRows: GenerationRowLayout[];
  width: number;
  height: number;
}
