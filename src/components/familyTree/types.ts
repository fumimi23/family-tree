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

/*
 * 同一人物の 2 回目以降の婚姻を表現するための線。
 * primary 婚姻 (MarriageEdgeLayout) と区別するため、人物ノードの上下方向に
 * オフセットを付けて引く (= ジェノグラム慣例の段差表現)。
 */
export interface SecondaryMarriageEdgeLayout {
  id: string;
  type: MarriageLineType;
  // primary person 側のノード右/左中央 (xy)
  primaryAnchorX: number;
  primaryAnchorY: number;
  // 配偶者側のノード中央 (xy)
  spouseAnchorX: number;
  spouseAnchorY: number;
  // ベンドする y 座標 (段差用)
  busY: number;
}

export interface GenerationRowLayout {
  generation: number;
  y: number;
  height: number;
}

export interface FamilyTreeLayout {
  nodes: PersonNodeLayout[];
  marriageEdges: MarriageEdgeLayout[];
  secondaryMarriageEdges: SecondaryMarriageEdgeLayout[];
  parentGroups: ParentChildrenGroupLayout[];
  secondaryParentEdges: SecondaryParentEdgeLayout[];
  generationRows: GenerationRowLayout[];
  width: number;
  height: number;
}
